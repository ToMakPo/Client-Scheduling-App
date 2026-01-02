import type { Pool, PoolOptions } from 'mysql2/promise';
import type { StorageAdapter, Appointment, BlockedTime, Provider } from '../types';

/** Configuration options for MySQL connection pool */
export interface MySQLPoolConfig {
	/** MySQL server host (default: localhost) */
	host?: string;

	/** MySQL server port (default: 3306) */
	port?: number;

	/** Database name */
	database: string;

	/** Database username */
	user: string;

	/** Database password */
	password: string;

	/** Maximum number of connections in pool (default: 10) */
	connectionLimit?: number;

	/** Wait for connections if pool is exhausted (default: true) */
	waitForConnections?: boolean;

	/** Queue limit for waiting connections (default: 0 - unlimited) */
	queueLimit?: number;
}

/** MySQL storage adapter implementation.
 * 
 * Provides persistent storage using MySQL with connection pooling.
 */
export class MySQLAdapter implements StorageAdapter {
	private config: MySQLPoolConfig;
	private pool: Pool | null = null;

	constructor(config: MySQLPoolConfig) {
		this.config = {
			host: 'localhost',
			port: 3306,
			connectionLimit: 10,
			waitForConnections: true,
			queueLimit: 0,
			...config,
		};
	}

	/** Connect to MySQL and create tables if they don't exist. */
	async connect(): Promise<void> {
		const mysql = await import('mysql2/promise');

		const poolConfig: PoolOptions = {
			host: this.config.host,
			port: this.config.port,
			user: this.config.user,
			password: this.config.password,
			database: this.config.database,
			connectionLimit: this.config.connectionLimit,
			waitForConnections: this.config.waitForConnections,
			queueLimit: this.config.queueLimit,
		};

		this.pool = mysql.createPool(poolConfig);

		// Create tables if they don't exist
		await this.createTables();
	}

	/** Create database tables with proper indexes. */
	private async createTables(): Promise<void> {
		if (!this.pool) throw new Error('Pool not initialized');

		// Create appointments table
		await this.pool.execute(`
			CREATE TABLE IF NOT EXISTS appointments (
				id VARCHAR(255) PRIMARY KEY,
				provider_id VARCHAR(255),
				start_time DATETIME NOT NULL,
				end_time DATETIME NOT NULL,
				metadata JSON,
				INDEX idx_provider_id (provider_id),
				INDEX idx_start_time (start_time)
			)
		`);

		// Create blocked_times table
		await this.pool.execute(`
			CREATE TABLE IF NOT EXISTS blocked_times (
				id VARCHAR(255) PRIMARY KEY,
				provider_id VARCHAR(255),
				start_time DATETIME NOT NULL,
				end_time DATETIME NOT NULL,
				reason VARCHAR(255),
				INDEX idx_provider_id (provider_id),
				INDEX idx_start_time (start_time)
			)
		`);

		// Create providers table
		await this.pool.execute(`
			CREATE TABLE IF NOT EXISTS providers (
				id VARCHAR(255) PRIMARY KEY,
				name VARCHAR(255) NOT NULL,
				metadata JSON
			)
		`);
	}

	/** Disconnect from MySQL and close pool. */
	async disconnect(): Promise<void> {
		if (this.pool) {
			await this.pool.end();
			this.pool = null;
		}
	}

	/** Convert MySQL row to Appointment. */
	private rowToAppointment(row: Record<string, any>): Appointment {
		return {
			id: row.id,
			providerId: row.provider_id,
			startTime: new Date(row.start_time).toISOString(),
			endTime: new Date(row.end_time).toISOString(),
			metadata: row.metadata ? JSON.parse(row.metadata) : {},
		};
	}

	/** Convert MySQL row to BlockedTime. */
	private rowToBlockedTime(row: Record<string, any>): BlockedTime {
		return {
			id: row.id,
			providerId: row.provider_id,
			startTime: new Date(row.start_time).toISOString(),
			endTime: new Date(row.end_time).toISOString(),
			reason: row.reason,
		};
	}

	/** Convert MySQL row to Provider. */
	private rowToProvider(row: Record<string, any>): Provider {
		return {
			id: row.id,
			name: row.name,
			metadata: row.metadata ? JSON.parse(row.metadata) : {},
		};
	}

	// Appointment operations

	/** Save a new appointment.
	 * 
	 * @param appointment Appointment to save
	 * @returns Saved appointment
	 */
	async saveAppointment(appointment: Appointment): Promise<Appointment> {
		if (!this.pool) throw new Error('Pool not initialized');

		await this.pool.execute(
			`INSERT INTO appointments (id, provider_id, start_time, end_time, metadata) VALUES (?, ?, ?, ?, ?)`,
			[
				appointment.id,
				appointment.providerId,
				new Date(appointment.startTime),
				new Date(appointment.endTime),
				JSON.stringify(appointment.metadata || {}),
			]
		);

		return appointment;
	}

	/** Retrieve an appointment by id.
	 * 
	 * @param id Appointment id
	 * @returns Appointment or null if not found
	 */
	async getAppointment(id: string): Promise<Appointment | null> {
		if (!this.pool) throw new Error('Pool not initialized');

		const [rows] = await this.pool.execute('SELECT * FROM appointments WHERE id = ?', [id]) as any;

		if (rows.length === 0) return null;
		return this.rowToAppointment(rows[0]);
	}

	/** Get all appointments, optionally filtered by provider.
	 * 
	 * @param providerId Optional provider id to filter by.
	 * @returns List of appointments.
	 */
	async getAllAppointments(providerId?: string): Promise<Appointment[]> {
		if (!this.pool) throw new Error('Pool not initialized');

		let query = 'SELECT * FROM appointments';
		const params: any[] = [];

		if (providerId) {
			query += ' WHERE provider_id = ?';
			params.push(providerId);
		}

		const [rows] = await this.pool.execute(query, params) as any;
		return rows.map((row: Record<string, any>) => this.rowToAppointment(row));
	}

	/** Update an existing appointment.
	 * 
	 * @param id Appointment id
	 * @param updates Fields to update
	 * @returns Updated appointment
	 */
	async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
		if (!this.pool) throw new Error('Pool not initialized');

		const setClauses: string[] = [];
		const params: any[] = [];

		if (updates.providerId !== undefined) {
			setClauses.push('provider_id = ?');
			params.push(updates.providerId);
		}
		if (updates.startTime !== undefined) {
			setClauses.push('start_time = ?');
			params.push(new Date(updates.startTime));
		}
		if (updates.endTime !== undefined) {
			setClauses.push('end_time = ?');
			params.push(new Date(updates.endTime));
		}
		if (updates.metadata !== undefined) {
			setClauses.push('metadata = ?');
			params.push(JSON.stringify(updates.metadata));
		}

		if (setClauses.length > 0) {
			params.push(id);
			await this.pool.execute(
				`UPDATE appointments SET ${setClauses.join(', ')} WHERE id = ?`,
				params
			);
		}

		const updated = await this.getAppointment(id);
		if (!updated) throw new Error(`Appointment ${id} not found`);

		return updated;
	}

	/** Delete an appointment by id.
	 * 
	 * @param id Appointment id
	 */
	async deleteAppointment(id: string): Promise<void> {
		if (!this.pool) throw new Error('Pool not initialized');

		await this.pool.execute('DELETE FROM appointments WHERE id = ?', [id]);
	}

	// Blocked time operations

	/** Save a new blocked time period.
	 * 
	 * @param blockedTime Blocked time to save
	 * @returns Saved blocked time
	 */
	async saveBlockedTime(blockedTime: BlockedTime): Promise<BlockedTime> {
		if (!this.pool) throw new Error('Pool not initialized');

		await this.pool.execute(
			`INSERT INTO blocked_times (id, provider_id, start_time, end_time, reason) VALUES (?, ?, ?, ?, ?)`,
			[
				blockedTime.id,
				blockedTime.providerId,
				new Date(blockedTime.startTime),
				new Date(blockedTime.endTime),
				blockedTime.reason,
			]
		);

		return blockedTime;
	}

	/** Retrieve a blocked time period by id.
	 * 
	 * @param id Blocked time id
	 * @returns Blocked time or null if not found
	 */
	async getBlockedTime(id: string): Promise<BlockedTime | null> {
		if (!this.pool) throw new Error('Pool not initialized');

		const [rows] = await this.pool.execute(
			'SELECT * FROM blocked_times WHERE id = ?',
			[id]
		) as any;

		if (rows.length === 0) return null;
		return this.rowToBlockedTime(rows[0]);
	}

	/** Get all blocked times, optionally filtered by provider.
	 * 
	 * @param providerId Optional provider id to filter by.
	 * @returns List of blocked times.
	 */
	async getAllBlockedTimes(providerId?: string): Promise<BlockedTime[]> {
		if (!this.pool) throw new Error('Pool not initialized');

		let query = 'SELECT * FROM blocked_times';
		const params: any[] = [];

		if (providerId) {
			query += ' WHERE provider_id = ?';
			params.push(providerId);
		}

		const [rows] = await this.pool.execute(query, params) as any;
		return rows.map((row: Record<string, any>) => this.rowToBlockedTime(row));
	}

	/** Delete a blocked time period by id.
	 * 
	 * @param id Blocked time id
	 */
	async deleteBlockedTime(id: string): Promise<void> {
		if (!this.pool) throw new Error('Pool not initialized');

		await this.pool.execute('DELETE FROM blocked_times WHERE id = ?', [id]);
	}

	// Provider operations

	/** Save a new provider.
	 * 
	 * @param provider Provider to save
	 * @returns Saved provider
	 */
	async saveProvider(provider: Provider): Promise<Provider> {
		if (!this.pool) throw new Error('Pool not initialized');

		await this.pool.execute(
			`INSERT INTO providers (id, name, metadata) VALUES (?, ?, ?)`,
			[
				provider.id,
				provider.name,
				JSON.stringify(provider.metadata || {}),
			]
		);

		return provider;
	}

	/** Retrieve a provider by id.
	 * 
	 * @param id Provider id
	 * @returns Provider or null if not found
	 */
	async getProvider(id: string): Promise<Provider | null> {
		if (!this.pool) throw new Error('Pool not initialized');

		const [rows] = await this.pool.execute(
			'SELECT * FROM providers WHERE id = ?',
			[id]
		) as any;

		if (rows.length === 0) return null;
		return this.rowToProvider(rows[0]);
	}

	/** Get all providers.
	 * 
	 * @returns List of providers
	 */
	async getAllProviders(): Promise<Provider[]> {
		if (!this.pool) throw new Error('Pool not initialized');

		const [rows] = await this.pool.execute('SELECT * FROM providers') as any;
		return rows.map((row: Record<string, any>) => this.rowToProvider(row));
	}

	/** Delete a provider by id.
	 * 
	 * @param id Provider id
	 */
	async deleteProvider(id: string): Promise<void> {
		if (!this.pool) throw new Error('Pool not initialized');

		await this.pool.execute('DELETE FROM providers WHERE id = ?', [id]);
	}

	/** Clear all data (useful for testing) */
	async clear(): Promise<void> {
		if (!this.pool) throw new Error('Pool not initialized');

		await this.pool.execute('DELETE FROM appointments');
		await this.pool.execute('DELETE FROM blocked_times');
		await this.pool.execute('DELETE FROM providers');
	}
}
