import type { Pool, PoolAttributes, Connection } from 'oracledb';
import type { StorageAdapter, Appointment, BlockedTime, Provider } from '../types';

/**
 * Configuration options for Oracle connection pool
 */
export interface OracleConfig {
	/**
	 * Oracle connection string or descriptor
	 * Format: "hostname:port/servicename" or TNS descriptor
	 */
	connectString: string;

	/**
	 * Database username
	 */
	user: string;

	/**
	 * Database password
	 */
	password: string;

	/**
	 * Maximum number of connections in pool (default: 10)
	 */
	poolMax?: number;

	/**
	 * Minimum number of connections in pool (default: 0)
	 */
	poolMin?: number;

	/**
	 * Connection pool increment (default: 1)
	 */
	poolIncrement?: number;

	/**
	 * Connection timeout in seconds (default: 60)
	 */
	poolTimeout?: number;
}

/**
 * Oracle storage adapter implementation
 * Provides persistent storage using Oracle Database with connection pooling
 */
export class OracleAdapter implements StorageAdapter {
	private config: OracleConfig;
	private pool: Pool | null = null;
	private oracledb: any = null;

	constructor(config: OracleConfig) {
		this.config = {
			poolMax: 10,
			poolMin: 0,
			poolIncrement: 1,
			poolTimeout: 60,
			...config,
		};
	}

	/**
	 * Connect to Oracle and create tables if they don't exist
	 */
	async connect(): Promise<void> {
		this.oracledb = await import('oracledb');

		const poolConfig: PoolAttributes = {
			user: this.config.user,
			password: this.config.password,
			connectString: this.config.connectString,
			poolMax: this.config.poolMax,
			poolMin: this.config.poolMin,
			poolIncrement: this.config.poolIncrement,
			poolTimeout: this.config.poolTimeout,
		};

		this.pool = await this.oracledb.createPool(poolConfig);

		// Create tables if they don't exist
		await this.createTables();
	}

	/**
	 * Create database tables with proper indexes
	 */
	private async createTables(): Promise<void> {
		if (!this.pool) throw new Error('Pool not initialized');

		const connection: Connection = await this.pool.getConnection();

		try {
			// Create appointments table
			await connection.execute(`
        BEGIN
          EXECUTE IMMEDIATE 'CREATE TABLE appointments (
            id VARCHAR2(255) PRIMARY KEY,
            provider_id VARCHAR2(255),
            start_time TIMESTAMP NOT NULL,
            end_time TIMESTAMP NOT NULL,
            metadata CLOB
          )';
        EXCEPTION
          WHEN OTHERS THEN
            IF SQLCODE != -955 THEN -- Table already exists
              RAISE;
            END IF;
        END;
      `);

			// Create indexes for appointments
			await connection.execute(`
        BEGIN
          EXECUTE IMMEDIATE 'CREATE INDEX idx_appointments_provider ON appointments(provider_id)';
        EXCEPTION
          WHEN OTHERS THEN
            IF SQLCODE != -955 THEN
              RAISE;
            END IF;
        END;
      `);

			await connection.execute(`
        BEGIN
          EXECUTE IMMEDIATE 'CREATE INDEX idx_appointments_start_time ON appointments(start_time)';
        EXCEPTION
          WHEN OTHERS THEN
            IF SQLCODE != -955 THEN
              RAISE;
            END IF;
        END;
      `);

			// Create blocked_times table
			await connection.execute(`
        BEGIN
          EXECUTE IMMEDIATE 'CREATE TABLE blocked_times (
            id VARCHAR2(255) PRIMARY KEY,
            provider_id VARCHAR2(255),
            start_time TIMESTAMP NOT NULL,
            end_time TIMESTAMP NOT NULL,
            reason VARCHAR2(255)
          )';
        EXCEPTION
          WHEN OTHERS THEN
            IF SQLCODE != -955 THEN
              RAISE;
            END IF;
        END;
      `);

			// Create indexes for blocked_times
			await connection.execute(`
        BEGIN
          EXECUTE IMMEDIATE 'CREATE INDEX idx_blocked_times_provider ON blocked_times(provider_id)';
        EXCEPTION
          WHEN OTHERS THEN
            IF SQLCODE != -955 THEN
              RAISE;
            END IF;
        END;
      `);

			await connection.execute(`
        BEGIN
          EXECUTE IMMEDIATE 'CREATE INDEX idx_blocked_times_start_time ON blocked_times(start_time)';
        EXCEPTION
          WHEN OTHERS THEN
            IF SQLCODE != -955 THEN
              RAISE;
            END IF;
        END;
      `);

			// Create providers table
			await connection.execute(`
        BEGIN
          EXECUTE IMMEDIATE 'CREATE TABLE providers (
            id VARCHAR2(255) PRIMARY KEY,
            name VARCHAR2(255) NOT NULL,
            metadata CLOB
          )';
        EXCEPTION
          WHEN OTHERS THEN
            IF SQLCODE != -955 THEN
              RAISE;
            END IF;
        END;
      `);

			await connection.commit();
		} finally {
			await connection.close();
		}
	}

	/**
	 * Disconnect from Oracle and close pool
	 */
	async disconnect(): Promise<void> {
		if (this.pool) {
			await this.pool.close(0);
			this.pool = null;
		}
	}

	/**
	 * Convert Oracle row to Appointment
	 */
	private rowToAppointment(row: any[]): Appointment {
		return {
			id: row[0],
			providerId: row[1],
			startTime: new Date(row[2]).toISOString(),
			endTime: new Date(row[3]).toISOString(),
			metadata: row[4] ? JSON.parse(row[4]) : {},
		};
	}

	/**
	 * Convert Oracle row to BlockedTime
	 */
	private rowToBlockedTime(row: any[]): BlockedTime {
		return {
			id: row[0],
			providerId: row[1],
			startTime: new Date(row[2]).toISOString(),
			endTime: new Date(row[3]).toISOString(),
			reason: row[4],
		};
	}

	/**
	 * Convert Oracle row to Provider
	 */
	private rowToProvider(row: any[]): Provider {
		return {
			id: row[0],
			name: row[1],
			metadata: row[2] ? JSON.parse(row[2]) : {},
		};
	}

	// Appointment operations

	async saveAppointment(appointment: Appointment): Promise<Appointment> {
		if (!this.pool) throw new Error('Pool not initialized');

		const connection: Connection = await this.pool.getConnection();

		try {
			await connection.execute(
				`INSERT INTO appointments (id, provider_id, start_time, end_time, metadata)
         VALUES (:id, :provider_id, :start_time, :end_time, :metadata)`,
				{
					id: appointment.id,
					provider_id: appointment.providerId,
					start_time: new Date(appointment.startTime),
					end_time: new Date(appointment.endTime),
					metadata: JSON.stringify(appointment.metadata || {}),
				},
				{ autoCommit: true }
			);

			return appointment;
		} finally {
			await connection.close();
		}
	}

	async getAppointment(id: string): Promise<Appointment | null> {
		if (!this.pool) throw new Error('Pool not initialized');

		const connection: Connection = await this.pool.getConnection();

		try {
			const result = await connection.execute(
				'SELECT id, provider_id, start_time, end_time, metadata FROM appointments WHERE id = :id',
				{ id },
				{ outFormat: this.oracledb.OUT_FORMAT_ARRAY }
			);

			if (!result.rows || result.rows.length === 0) return null;
			return this.rowToAppointment(result.rows[0] as any[]);
		} finally {
			await connection.close();
		}
	}

	async getAllAppointments(providerId?: string): Promise<Appointment[]> {
		if (!this.pool) throw new Error('Pool not initialized');

		const connection: Connection = await this.pool.getConnection();

		try {
			let query = 'SELECT id, provider_id, start_time, end_time, metadata FROM appointments';
			const binds: any = {};

			if (providerId) {
				query += ' WHERE provider_id = :provider_id';
				binds.provider_id = providerId;
			}

			const result = await connection.execute(
				query,
				binds,
				{ outFormat: this.oracledb.OUT_FORMAT_ARRAY }
			);

			if (!result.rows) return [];
			return result.rows.map((row: any) => this.rowToAppointment(row));
		} finally {
			await connection.close();
		}
	}

	async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
		if (!this.pool) throw new Error('Pool not initialized');

		const connection: Connection = await this.pool.getConnection();

		try {
			const setClauses: string[] = [];
			const binds: any = { id };

			if (updates.providerId !== undefined) {
				setClauses.push('provider_id = :provider_id');
				binds.provider_id = updates.providerId;
			}
			if (updates.startTime !== undefined) {
				setClauses.push('start_time = :start_time');
				binds.start_time = new Date(updates.startTime);
			}
			if (updates.endTime !== undefined) {
				setClauses.push('end_time = :end_time');
				binds.end_time = new Date(updates.endTime);
			}
			if (updates.metadata !== undefined) {
				setClauses.push('metadata = :metadata');
				binds.metadata = JSON.stringify(updates.metadata);
			}

			if (setClauses.length > 0) {
				await connection.execute(
					`UPDATE appointments SET ${setClauses.join(', ')} WHERE id = :id`,
					binds,
					{ autoCommit: true }
				);
			}

			const updated = await this.getAppointment(id);
			if (!updated) throw new Error(`Appointment ${id} not found`);

			return updated;
		} finally {
			await connection.close();
		}
	}

	async deleteAppointment(id: string): Promise<void> {
		if (!this.pool) throw new Error('Pool not initialized');

		const connection: Connection = await this.pool.getConnection();

		try {
			await connection.execute(
				'DELETE FROM appointments WHERE id = :id',
				{ id },
				{ autoCommit: true }
			);
		} finally {
			await connection.close();
		}
	}

	// Blocked time operations

	async saveBlockedTime(blockedTime: BlockedTime): Promise<BlockedTime> {
		if (!this.pool) throw new Error('Pool not initialized');

		const connection: Connection = await this.pool.getConnection();

		try {
			await connection.execute(
				`INSERT INTO blocked_times (id, provider_id, start_time, end_time, reason)
         VALUES (:id, :provider_id, :start_time, :end_time, :reason)`,
				{
					id: blockedTime.id,
					provider_id: blockedTime.providerId,
					start_time: new Date(blockedTime.startTime),
					end_time: new Date(blockedTime.endTime),
					reason: blockedTime.reason,
				},
				{ autoCommit: true }
			);

			return blockedTime;
		} finally {
			await connection.close();
		}
	}

	async getBlockedTime(id: string): Promise<BlockedTime | null> {
		if (!this.pool) throw new Error('Pool not initialized');

		const connection: Connection = await this.pool.getConnection();

		try {
			const result = await connection.execute(
				'SELECT id, provider_id, start_time, end_time, reason FROM blocked_times WHERE id = :id',
				{ id },
				{ outFormat: this.oracledb.OUT_FORMAT_ARRAY }
			);

			if (!result.rows || result.rows.length === 0) return null;
			return this.rowToBlockedTime(result.rows[0] as any[]);
		} finally {
			await connection.close();
		}
	}

	async getAllBlockedTimes(providerId?: string): Promise<BlockedTime[]> {
		if (!this.pool) throw new Error('Pool not initialized');

		const connection: Connection = await this.pool.getConnection();

		try {
			let query = 'SELECT id, provider_id, start_time, end_time, reason FROM blocked_times';
			const binds: any = {};

			if (providerId) {
				query += ' WHERE provider_id = :provider_id';
				binds.provider_id = providerId;
			}

			const result = await connection.execute(
				query,
				binds,
				{ outFormat: this.oracledb.OUT_FORMAT_ARRAY }
			);

			if (!result.rows) return [];
			return result.rows.map((row: any) => this.rowToBlockedTime(row));
		} finally {
			await connection.close();
		}
	}

	async deleteBlockedTime(id: string): Promise<void> {
		if (!this.pool) throw new Error('Pool not initialized');

		const connection: Connection = await this.pool.getConnection();

		try {
			await connection.execute(
				'DELETE FROM blocked_times WHERE id = :id',
				{ id },
				{ autoCommit: true }
			);
		} finally {
			await connection.close();
		}
	}

	// Provider operations

	async saveProvider(provider: Provider): Promise<Provider> {
		if (!this.pool) throw new Error('Pool not initialized');

		const connection: Connection = await this.pool.getConnection();

		try {
			await connection.execute(
				`INSERT INTO providers (id, name, metadata)
         VALUES (:id, :name, :metadata)`,
				{
					id: provider.id,
					name: provider.name,
					metadata: JSON.stringify(provider.metadata || {}),
				},
				{ autoCommit: true }
			);

			return provider;
		} finally {
			await connection.close();
		}
	}

	async getProvider(id: string): Promise<Provider | null> {
		if (!this.pool) throw new Error('Pool not initialized');

		const connection: Connection = await this.pool.getConnection();

		try {
			const result = await connection.execute(
				'SELECT id, name, metadata FROM providers WHERE id = :id',
				{ id },
				{ outFormat: this.oracledb.OUT_FORMAT_ARRAY }
			);

			if (!result.rows || result.rows.length === 0) return null;
			return this.rowToProvider(result.rows[0] as any[]);
		} finally {
			await connection.close();
		}
	}

	async getAllProviders(): Promise<Provider[]> {
		if (!this.pool) throw new Error('Pool not initialized');

		const connection: Connection = await this.pool.getConnection();

		try {
			const result = await connection.execute(
				'SELECT id, name, metadata FROM providers',
				{},
				{ outFormat: this.oracledb.OUT_FORMAT_ARRAY }
			);

			if (!result.rows) return [];
			return result.rows.map((row: any) => this.rowToProvider(row));
		} finally {
			await connection.close();
		}
	}

	async deleteProvider(id: string): Promise<void> {
		if (!this.pool) throw new Error('Pool not initialized');

		const connection: Connection = await this.pool.getConnection();

		try {
			await connection.execute(
				'DELETE FROM providers WHERE id = :id',
				{ id },
				{ autoCommit: true }
			);
		} finally {
			await connection.close();
		}
	}

	/**
	 * Clear all data (useful for testing)
	 */
	async clear(): Promise<void> {
		if (!this.pool) throw new Error('Pool not initialized');

		const connection: Connection = await this.pool.getConnection();

		try {
			await connection.execute('DELETE FROM appointments');
			await connection.execute('DELETE FROM blocked_times');
			await connection.execute('DELETE FROM providers');
			await connection.commit();
		} finally {
			await connection.close();
		}
	}
}
