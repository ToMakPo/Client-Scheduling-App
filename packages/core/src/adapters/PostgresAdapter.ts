import type {
	Appointment,
	BlockedTime,
	Provider,
	StorageAdapter,
} from '../types';

interface PostgresPoolConfig {
	host: string;
	port?: number;
	database: string;
	user: string;
	password: string;
	max?: number;
	idleTimeoutMillis?: number;
	connectionTimeoutMillis?: number;
}

/** PostgreSQL adapter with connection pooling support
 * Works with pg (node-postgres) library
 */
export class PostgresAdapter implements StorageAdapter {
	private pool: any;
	private poolConfig: PostgresPoolConfig;
	private isConnected: boolean = false;

	constructor(poolConfig: PostgresPoolConfig) {
		this.poolConfig = {
			max: 20,
			idleTimeoutMillis: 30000,
			connectionTimeoutMillis: 2000,
			port: 5432,
			...poolConfig,
		};
	}

	/** Initialize connection pool and create tables if they don't exist */
	async connect(): Promise<void> {
		try {
			// Lazy import pg to avoid requiring it as a dependency
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const pg = require('pg');
			this.pool = new pg.Pool(this.poolConfig);

			// Verify connection
			await this.pool.query('SELECT 1');

			// Create tables if they don't exist
			await this.initializeTables();

			this.isConnected = true;
		} catch (error) {
			throw new Error(`Failed to connect to PostgreSQL: ${error}`);
		}
	}

	/** Close all pool connections */
	async disconnect(): Promise<void> {
		if (this.pool && this.isConnected) {
			await this.pool.end();
			this.isConnected = false;
		}
	}

	/** Create necessary tables */
	private async initializeTables(): Promise<void> {
		const queries = [
			`
			CREATE TABLE IF NOT EXISTS appointments (
				id VARCHAR(255) PRIMARY KEY,
				start_time TIMESTAMPTZ NOT NULL,
				end_time TIMESTAMPTZ NOT NULL,
				provider_id VARCHAR(255),
				metadata JSONB,
				created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
			);
			CREATE INDEX IF NOT EXISTS idx_appointments_provider_id ON appointments(provider_id);
			CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON appointments(start_time);
			`,
			`
			CREATE TABLE IF NOT EXISTS blocked_times (
				id VARCHAR(255) PRIMARY KEY,
				start_time TIMESTAMPTZ NOT NULL,
				end_time TIMESTAMPTZ NOT NULL,
				provider_id VARCHAR(255),
				reason VARCHAR(255),
				created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
			);
			CREATE INDEX IF NOT EXISTS idx_blocked_times_provider_id ON blocked_times(provider_id);
			CREATE INDEX IF NOT EXISTS idx_blocked_times_start_time ON blocked_times(start_time);
			`,
			`
			CREATE TABLE IF NOT EXISTS providers (
				id VARCHAR(255) PRIMARY KEY,
				name VARCHAR(255) NOT NULL,
				metadata JSONB,
				created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
			);
			`,
		];

		for (const query of queries) {
			await this.pool.query(query);
		}
	}

	// Appointment operations
	async saveAppointment(appointment: Appointment): Promise<Appointment> {
		const query = `
			INSERT INTO appointments (id, start_time, end_time, provider_id, metadata)
			VALUES ($1, $2, $3, $4, $5)
			ON CONFLICT (id) DO UPDATE SET
				start_time = $2,
				end_time = $3,
				provider_id = $4,
				metadata = $5,
				updated_at = CURRENT_TIMESTAMP
			RETURNING id, start_time, end_time, provider_id, metadata;
		`;

		const result = await this.pool.query(query, [
			appointment.id,
			appointment.startTime,
			appointment.endTime,
			appointment.providerId || null,
			appointment.metadata ? JSON.stringify(appointment.metadata) : null,
		]);

		return this.rowToAppointment(result.rows[0]);
	}

	async getAppointment(id: string): Promise<Appointment | null> {
		const query = 'SELECT id, start_time, end_time, provider_id, metadata FROM appointments WHERE id = $1;';
		const result = await this.pool.query(query, [id]);
		return result.rows.length > 0 ? this.rowToAppointment(result.rows[0]) : null;
	}

	async getAllAppointments(providerId?: string): Promise<Appointment[]> {
		let query = 'SELECT id, start_time, end_time, provider_id, metadata FROM appointments';
		const params: any[] = [];

		if (providerId) {
			query += ' WHERE provider_id = $1';
			params.push(providerId);
		}

		query += ' ORDER BY start_time;';

		const result = await this.pool.query(query, params);
		return result.rows.map((row: Record<string, any>) => this.rowToAppointment(row));
	}

	async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
		const setClauses: string[] = [];
		const values: any[] = [];
		let paramCount = 1;

		if (updates.startTime !== undefined) {
			setClauses.push(`start_time = $${paramCount++}`);
			values.push(updates.startTime);
		}
		if (updates.endTime !== undefined) {
			setClauses.push(`end_time = $${paramCount++}`);
			values.push(updates.endTime);
		}
		if (updates.providerId !== undefined) {
			setClauses.push(`provider_id = $${paramCount++}`);
			values.push(updates.providerId || null);
		}
		if (updates.metadata !== undefined) {
			setClauses.push(`metadata = $${paramCount++}`);
			values.push(updates.metadata ? JSON.stringify(updates.metadata) : null);
		}

		if (setClauses.length === 0) {
			const appointment = await this.getAppointment(id);
			if (!appointment) throw new Error(`Appointment ${id} not found`);
			return appointment;
		}

		setClauses.push(`updated_at = CURRENT_TIMESTAMP`);
		const query = `
			UPDATE appointments SET ${setClauses.join(', ')}
			WHERE id = $${paramCount}
			RETURNING id, start_time, end_time, provider_id, metadata;
		`;

		values.push(id);
		const result = await this.pool.query(query, values);

		if (result.rows.length === 0) throw new Error(`Appointment ${id} not found`);
		return this.rowToAppointment(result.rows[0]);
	}

	async deleteAppointment(id: string): Promise<void> {
		const query = 'DELETE FROM appointments WHERE id = $1;';
		await this.pool.query(query, [id]);
	}

	// BlockedTime operations
	async saveBlockedTime(blockedTime: BlockedTime): Promise<BlockedTime> {
		const query = `
			INSERT INTO blocked_times (id, start_time, end_time, provider_id, reason)
			VALUES ($1, $2, $3, $4, $5)
			ON CONFLICT (id) DO UPDATE SET
				start_time = $2,
				end_time = $3,
				provider_id = $4,
				reason = $5
			RETURNING id, start_time, end_time, provider_id, reason;
		`;

		const result = await this.pool.query(query, [
			blockedTime.id,
			blockedTime.startTime,
			blockedTime.endTime,
			blockedTime.providerId || null,
			blockedTime.reason || null,
		]);

		return this.rowToBlockedTime(result.rows[0]);
	}

	async getAllBlockedTimes(providerId?: string): Promise<BlockedTime[]> {
		let query = 'SELECT id, start_time, end_time, provider_id, reason FROM blocked_times';
		const params: any[] = [];

		if (providerId) {
			query += ' WHERE provider_id = $1';
			params.push(providerId);
		}

		query += ' ORDER BY start_time;';

		const result = await this.pool.query(query, params);
		return result.rows.map((row: Record<string, any>) => this.rowToBlockedTime(row));
	}

	async deleteBlockedTime(id: string): Promise<void> {
		const query = 'DELETE FROM blocked_times WHERE id = $1;';
		await this.pool.query(query, [id]);
	}

	// Provider operations
	async saveProvider(provider: Provider): Promise<Provider> {
		const query = `
			INSERT INTO providers (id, name, metadata)
			VALUES ($1, $2, $3)
			ON CONFLICT (id) DO UPDATE SET
				name = $2,
				metadata = $3,
				updated_at = CURRENT_TIMESTAMP
			RETURNING id, name, metadata;
		`;

		const result = await this.pool.query(query, [
			provider.id,
			provider.name,
			provider.metadata ? JSON.stringify(provider.metadata) : null,
		]);

		return this.rowToProvider(result.rows[0]);
	}

	async getProvider(id: string): Promise<Provider | null> {
		const query = 'SELECT id, name, metadata FROM providers WHERE id = $1;';
		const result = await this.pool.query(query, [id]);
		return result.rows.length > 0 ? this.rowToProvider(result.rows[0]) : null;
	}

	async getAllProviders(): Promise<Provider[]> {
		const query = 'SELECT id, name, metadata FROM providers ORDER BY name;';
		const result = await this.pool.query(query);
		return result.rows.map((row: Record<string, any>) => this.rowToProvider(row));
	}

	async deleteProvider(id: string): Promise<void> {
		const query = 'DELETE FROM providers WHERE id = $1;';
		await this.pool.query(query, [id]);
	}

	// Utility methods
	async clear(): Promise<void> {
		await this.pool.query('DELETE FROM appointments;');
		await this.pool.query('DELETE FROM blocked_times;');
		await this.pool.query('DELETE FROM providers;');
	}

	private rowToAppointment(row: Record<string, any>): Appointment {
		return {
			id: row.id,
			startTime: row.start_time,
			endTime: row.end_time,
			providerId: row.provider_id || undefined,
			metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
		};
	}

	private rowToBlockedTime(row: Record<string, any>): BlockedTime {
		return {
			id: row.id,
			startTime: row.start_time,
			endTime: row.end_time,
			providerId: row.provider_id || undefined,
			reason: row.reason || undefined,
		};
	}

	private rowToProvider(row: Record<string, any>): Provider {
		return {
			id: row.id,
			name: row.name,
			metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
		};
	}
}
