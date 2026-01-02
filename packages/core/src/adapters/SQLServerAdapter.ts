import type { ConnectionPool, config as SQLConfig } from 'mssql';
import type { StorageAdapter, Appointment, BlockedTime, Provider } from '../types';

/**
 * Configuration options for SQL Server connection pool
 */
export interface SQLServerConfig {
	/**
	 * SQL Server host (default: localhost)
	 */
	server?: string;

	/**
	 * SQL Server port (default: 1433)
	 */
	port?: number;

	/**
	 * Database name
	 */
	database: string;

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
	max?: number;

	/**
	 * Minimum number of connections in pool (default: 0)
	 */
	min?: number;

	/**
	 * Connection timeout in milliseconds (default: 15000)
	 */
	connectionTimeout?: number;

	/**
	 * Request timeout in milliseconds (default: 15000)
	 */
	requestTimeout?: number;

	/**
	 * Enable encryption (default: true)
	 */
	encrypt?: boolean;

	/**
	 * Trust server certificate (default: false)
	 */
	trustServerCertificate?: boolean;
}

/**
 * SQL Server storage adapter implementation
 * Provides persistent storage using SQL Server with connection pooling
 */
export class SQLServerAdapter implements StorageAdapter {
	private config: SQLServerConfig;
	private pool: ConnectionPool | null = null;

	constructor(config: SQLServerConfig) {
		this.config = {
			server: 'localhost',
			port: 1433,
			max: 10,
			min: 0,
			connectionTimeout: 15000,
			requestTimeout: 15000,
			encrypt: true,
			trustServerCertificate: false,
			...config,
		};
	}

	/**
	 * Connect to SQL Server and create tables if they don't exist
	 */
	async connect(): Promise<void> {
		const mssql = await import('mssql');

		const poolConfig: SQLConfig = {
			server: this.config.server!,
			port: this.config.port,
			database: this.config.database,
			user: this.config.user,
			password: this.config.password,
			pool: {
				max: this.config.max!,
				min: this.config.min!,
			},
			options: {
				encrypt: this.config.encrypt!,
				trustServerCertificate: this.config.trustServerCertificate!,
			},
			connectionTimeout: this.config.connectionTimeout,
			requestTimeout: this.config.requestTimeout,
		};

		this.pool = await mssql.connect(poolConfig);

		// Create tables if they don't exist
		await this.createTables();
	}

	/**
	 * Create database tables with proper indexes
	 */
	private async createTables(): Promise<void> {
		if (!this.pool) throw new Error('Pool not initialized');

		// Create appointments table
		await this.pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='appointments' AND xtype='U')
      CREATE TABLE appointments (
        id NVARCHAR(255) PRIMARY KEY,
        provider_id NVARCHAR(255),
        start_time DATETIME2 NOT NULL,
        end_time DATETIME2 NOT NULL,
        metadata NVARCHAR(MAX)
      )
    `);

		await this.pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_appointments_provider_id')
      CREATE INDEX idx_appointments_provider_id ON appointments(provider_id)
    `);

		await this.pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_appointments_start_time')
      CREATE INDEX idx_appointments_start_time ON appointments(start_time)
    `);

		// Create blocked_times table
		await this.pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='blocked_times' AND xtype='U')
      CREATE TABLE blocked_times (
        id NVARCHAR(255) PRIMARY KEY,
        provider_id NVARCHAR(255),
        start_time DATETIME2 NOT NULL,
        end_time DATETIME2 NOT NULL,
        reason NVARCHAR(255)
      )
    `);

		await this.pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_blocked_times_provider_id')
      CREATE INDEX idx_blocked_times_provider_id ON blocked_times(provider_id)
    `);

		await this.pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_blocked_times_start_time')
      CREATE INDEX idx_blocked_times_start_time ON blocked_times(start_time)
    `);

		// Create providers table
		await this.pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='providers' AND xtype='U')
      CREATE TABLE providers (
        id NVARCHAR(255) PRIMARY KEY,
        name NVARCHAR(255) NOT NULL,
        metadata NVARCHAR(MAX)
      )
    `);
	}

	/**
	 * Disconnect from SQL Server and close pool
	 */
	async disconnect(): Promise<void> {
		if (this.pool) {
			await this.pool.close();
			this.pool = null;
		}
	}

	/**
	 * Convert SQL Server row to Appointment
	 */
	private rowToAppointment(row: Record<string, any>): Appointment {
		return {
			id: row.id,
			providerId: row.provider_id,
			startTime: new Date(row.start_time).toISOString(),
			endTime: new Date(row.end_time).toISOString(),
			metadata: row.metadata ? JSON.parse(row.metadata) : {},
		};
	}

	/**
	 * Convert SQL Server row to BlockedTime
	 */
	private rowToBlockedTime(row: Record<string, any>): BlockedTime {
		return {
			id: row.id,
			providerId: row.provider_id,
			startTime: new Date(row.start_time).toISOString(),
			endTime: new Date(row.end_time).toISOString(),
			reason: row.reason,
		};
	}

	/**
	 * Convert SQL Server row to Provider
	 */
	private rowToProvider(row: Record<string, any>): Provider {
		return {
			id: row.id,
			name: row.name,
			metadata: row.metadata ? JSON.parse(row.metadata) : {},
		};
	}

	// Appointment operations

	async saveAppointment(appointment: Appointment): Promise<Appointment> {
		if (!this.pool) throw new Error('Pool not initialized');

		await this.pool
			.request()
			.input('id', appointment.id)
			.input('provider_id', appointment.providerId)
			.input('start_time', new Date(appointment.startTime))
			.input('end_time', new Date(appointment.endTime))
			.input('metadata', JSON.stringify(appointment.metadata || {}))
			.query(`
        INSERT INTO appointments (id, provider_id, start_time, end_time, metadata)
        VALUES (@id, @provider_id, @start_time, @end_time, @metadata)
      `);

		return appointment;
	}

	async getAppointment(id: string): Promise<Appointment | null> {
		if (!this.pool) throw new Error('Pool not initialized');

		const result = await this.pool
			.request()
			.input('id', id)
			.query('SELECT * FROM appointments WHERE id = @id');

		if (result.recordset.length === 0) return null;
		return this.rowToAppointment(result.recordset[0]);
	}

	async getAllAppointments(providerId?: string): Promise<Appointment[]> {
		if (!this.pool) throw new Error('Pool not initialized');

		const request = this.pool.request();
		let query = 'SELECT * FROM appointments';

		if (providerId) {
			query += ' WHERE provider_id = @provider_id';
			request.input('provider_id', providerId);
		}

		const result = await request.query(query);
		return result.recordset.map((row: Record<string, any>) => this.rowToAppointment(row));
	}

	async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
		if (!this.pool) throw new Error('Pool not initialized');

		const setClauses: string[] = [];
		const request = this.pool.request();

		if (updates.providerId !== undefined) {
			setClauses.push('provider_id = @provider_id');
			request.input('provider_id', updates.providerId);
		}
		if (updates.startTime !== undefined) {
			setClauses.push('start_time = @start_time');
			request.input('start_time', new Date(updates.startTime));
		}
		if (updates.endTime !== undefined) {
			setClauses.push('end_time = @end_time');
			request.input('end_time', new Date(updates.endTime));
		}
		if (updates.metadata !== undefined) {
			setClauses.push('metadata = @metadata');
			request.input('metadata', JSON.stringify(updates.metadata));
		}

		if (setClauses.length > 0) {
			request.input('id', id);
			await request.query(`
        UPDATE appointments
        SET ${setClauses.join(', ')}
        WHERE id = @id
      `);
		}

		const updated = await this.getAppointment(id);
		if (!updated) throw new Error(`Appointment ${id} not found`);

		return updated;
	}

	async deleteAppointment(id: string): Promise<void> {
		if (!this.pool) throw new Error('Pool not initialized');

		await this.pool
			.request()
			.input('id', id)
			.query('DELETE FROM appointments WHERE id = @id');
	}

	// Blocked time operations

	async saveBlockedTime(blockedTime: BlockedTime): Promise<BlockedTime> {
		if (!this.pool) throw new Error('Pool not initialized');

		await this.pool
			.request()
			.input('id', blockedTime.id)
			.input('provider_id', blockedTime.providerId)
			.input('start_time', new Date(blockedTime.startTime))
			.input('end_time', new Date(blockedTime.endTime))
			.input('reason', blockedTime.reason)
			.query(`
        INSERT INTO blocked_times (id, provider_id, start_time, end_time, reason)
        VALUES (@id, @provider_id, @start_time, @end_time, @reason)
      `);

		return blockedTime;
	}

	async getBlockedTime(id: string): Promise<BlockedTime | null> {
		if (!this.pool) throw new Error('Pool not initialized');

		const result = await this.pool
			.request()
			.input('id', id)
			.query('SELECT * FROM blocked_times WHERE id = @id');

		if (result.recordset.length === 0) return null;
		return this.rowToBlockedTime(result.recordset[0]);
	}

	async getAllBlockedTimes(providerId?: string): Promise<BlockedTime[]> {
		if (!this.pool) throw new Error('Pool not initialized');

		const request = this.pool.request();
		let query = 'SELECT * FROM blocked_times';

		if (providerId) {
			query += ' WHERE provider_id = @provider_id';
			request.input('provider_id', providerId);
		}

		const result = await request.query(query);
		return result.recordset.map((row: Record<string, any>) => this.rowToBlockedTime(row));
	}

	async deleteBlockedTime(id: string): Promise<void> {
		if (!this.pool) throw new Error('Pool not initialized');

		await this.pool
			.request()
			.input('id', id)
			.query('DELETE FROM blocked_times WHERE id = @id');
	}

	// Provider operations

	async saveProvider(provider: Provider): Promise<Provider> {
		if (!this.pool) throw new Error('Pool not initialized');

		await this.pool
			.request()
			.input('id', provider.id)
			.input('name', provider.name)
			.input('metadata', JSON.stringify(provider.metadata || {}))
			.query(`
        INSERT INTO providers (id, name, metadata)
        VALUES (@id, @name, @metadata)
      `);

		return provider;
	}

	async getProvider(id: string): Promise<Provider | null> {
		if (!this.pool) throw new Error('Pool not initialized');

		const result = await this.pool
			.request()
			.input('id', id)
			.query('SELECT * FROM providers WHERE id = @id');

		if (result.recordset.length === 0) return null;
		return this.rowToProvider(result.recordset[0]);
	}

	async getAllProviders(): Promise<Provider[]> {
		if (!this.pool) throw new Error('Pool not initialized');

		const result = await this.pool.request().query('SELECT * FROM providers');
		return result.recordset.map((row: Record<string, any>) => this.rowToProvider(row));
	}

	async deleteProvider(id: string): Promise<void> {
		if (!this.pool) throw new Error('Pool not initialized');

		await this.pool
			.request()
			.input('id', id)
			.query('DELETE FROM providers WHERE id = @id');
	}

	/**
	 * Clear all data (useful for testing)
	 */
	async clear(): Promise<void> {
		if (!this.pool) throw new Error('Pool not initialized');

		await this.pool.request().query('DELETE FROM appointments');
		await this.pool.request().query('DELETE FROM blocked_times');
		await this.pool.request().query('DELETE FROM providers');
	}
}
