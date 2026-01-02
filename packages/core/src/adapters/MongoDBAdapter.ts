import { MongoClient, Db, Collection } from 'mongodb';
import type { StorageAdapter, Appointment, BlockedTime, Provider } from '../types';

/** Configuration options for MongoDB connection. */
export interface MongoDBConfig {
	/** MongoDB connection URI (e.g., "mongodb://localhost:27017") */
	uri: string;

	/** Database name
	 * 
	 * The database will be created if it does not exist.
	 */
	database: string;

	/** Optional: Maximum pool size (default: 10) 
	 * 
	 * Controls the maximum number of connections in the connection pool.
	 */
	maxPoolSize?: number;

	/** Optional: Minimum pool size (default: 0) 
	 * 
	 * Controls the minimum number of connections in the connection pool.
	 */
	minPoolSize?: number;

	/** Optional: Connection timeout in milliseconds (default: 10000) 
	 * 
	 * Specifies how long to wait when connecting before timing out.
	 */
	connectTimeoutMS?: number;
}

/** MongoDB storage adapter implementation.
 * 
 * Provides persistent storage using MongoDB with connection pooling.
 */
export class MongoDBAdapter implements StorageAdapter {
	private config: MongoDBConfig;
	private client: MongoClient | null = null;
	private db: Db | null = null;

	constructor(config: MongoDBConfig) {
		this.config = {
			maxPoolSize: 10,
			minPoolSize: 0,
			connectTimeoutMS: 10000,
			...config,
		};
	}

	/** Connect to MongoDB and create indexes.
	 * 
	 * The database and collections will be created if they do not exist.
	 */
	async connect(): Promise<void> {
		this.client = new MongoClient(this.config.uri, {
			maxPoolSize: this.config.maxPoolSize,
			minPoolSize: this.config.minPoolSize,
			connectTimeoutMS: this.config.connectTimeoutMS,
		});

		await this.client.connect();
		this.db = this.client.db(this.config.database);

		// Create indexes for performance
		await this.createIndexes();
	}

	/** Create indexes on collections for better query performance.
	 * 
	 * Indexes are created on appointments, blocked times, and providers collections.
	 */
	private async createIndexes(): Promise<void> {
		if (!this.db) return;

		const appointments = this.db.collection('appointments');
		const blockedTimes = this.db.collection('blocked_times');
		const providers = this.db.collection('providers');

		// Appointments indexes
		await appointments.createIndex({ provider_id: 1 });
		await appointments.createIndex({ start_time: 1 });
		await appointments.createIndex({ created_at: 1 });
		await appointments.createIndex({ updated_at: 1 });

		// Blocked times indexes
		await blockedTimes.createIndex({ provider_id: 1 });
		await blockedTimes.createIndex({ start_time: 1 });

		// Providers indexes
		await providers.createIndex({ id: 1 }, { unique: true });
	}

	/** Disconnect from MongoDB. */
	async disconnect(): Promise<void> {
		if (this.client) {
			await this.client.close();
			this.client = null;
			this.db = null;
		}
	}

	/** Get the appointments collection. */
	private getAppointmentsCollection(): Collection {
		if (!this.db) throw new Error('Database not connected');
		return this.db.collection('appointments');
	}

	/** Get the blocked times collection. */
	private getBlockedTimesCollection(): Collection {
		if (!this.db) throw new Error('Database not connected');
		return this.db.collection('blocked_times');
	}

	/** Get the providers collection. */
	private getProvidersCollection(): Collection {
		if (!this.db) throw new Error('Database not connected');
		return this.db.collection('providers');
	}

	/** Convert MongoDB document to Appointment */
	private docToAppointment(doc: Record<string, any>): Appointment {
		return {
			id: doc.id,
			providerId: doc.provider_id,
			startTime: new Date(doc.start_time).toISOString(),
			endTime: new Date(doc.end_time).toISOString(),
			metadata: doc.metadata || {},
		};
	}

	/** Convert MongoDB document to BlockedTime */
	private docToBlockedTime(doc: Record<string, any>): BlockedTime {
		return {
			id: doc.id,
			providerId: doc.provider_id,
			startTime: new Date(doc.start_time).toISOString(),
			endTime: new Date(doc.end_time).toISOString(),
			reason: doc.reason,
		};
	}

	/** Convert MongoDB document to Provider */
	private docToProvider(doc: Record<string, any>): Provider {
		return {
			id: doc.id,
			name: doc.name,
			metadata: doc.metadata || {},
		};
	}

	// Appointment operations

	/** Save an appointment.
	 * 
	 * @param appointment Appointment to save
	 * @returns Saved appointment
	 */
	async saveAppointment(appointment: Appointment): Promise<Appointment> {
		const collection = this.getAppointmentsCollection();

		await collection.insertOne({
			id: appointment.id,
			provider_id: appointment.providerId,
			start_time: new Date(appointment.startTime),
			end_time: new Date(appointment.endTime),
			metadata: appointment.metadata || {},
		});

		return appointment;
	}

	/** Get an appointment by id. 
	 * 
	 * @param id Appointment id
	 * @returns Appointment or null if not found.
	 */
	async getAppointment(id: string): Promise<Appointment | null> {
		const collection = this.getAppointmentsCollection();
		const doc = await collection.findOne({ id });

		if (!doc) return null;
		return this.docToAppointment(doc);
	}

	/** Get all appointments, optionally filtered by providerId.
	 * 
	 * @param providerId Provider id to filter appointments
	 * @returns Array of appointments
	 */
	async getAllAppointments(providerId?: string): Promise<Appointment[]> {
		const collection = this.getAppointmentsCollection();
		const query = providerId ? { provider_id: providerId } : {};

		const docs = await collection.find(query).toArray();
		return docs.map((doc: Record<string, any>) => this.docToAppointment(doc));
	}

	/** Update an existing appointment.
	 * 
	 * @param id Appointment id
	 * @param updates Partial appointment fields to update
	 * @returns Updated appointment
	 */
	async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
		const collection = this.getAppointmentsCollection();

		const updateDoc: any = {};

		if (updates.providerId !== undefined) updateDoc.provider_id = updates.providerId;
		if (updates.startTime !== undefined) updateDoc.start_time = new Date(updates.startTime);
		if (updates.endTime !== undefined) updateDoc.end_time = new Date(updates.endTime);
		if (updates.metadata !== undefined) updateDoc.metadata = updates.metadata;

		await collection.updateOne(
			{ id },
			{ $set: updateDoc }
		);

		const updated = await collection.findOne({ id });
		if (!updated) throw new Error(`Appointment ${id} not found`);

		return this.docToAppointment(updated);
	}

	/** Delete an appointment by id.
	 * 
	 * @param id Appointment id
	 */
	async deleteAppointment(id: string): Promise<void> {
		const collection = this.getAppointmentsCollection();
		await collection.deleteOne({ id });
	}

	// Blocked time operations

	/** Save a blocked time.
	 * 
	 * @param blockedTime Blocked time to save
	 * @returns Saved blocked time
	 */
	async saveBlockedTime(blockedTime: BlockedTime): Promise<BlockedTime> {
		const collection = this.getBlockedTimesCollection();

		await collection.insertOne({
			id: blockedTime.id,
			provider_id: blockedTime.providerId,
			start_time: new Date(blockedTime.startTime),
			end_time: new Date(blockedTime.endTime),
			reason: blockedTime.reason,
		});

		return blockedTime;
	}

	/** Get a blocked time by id.
	 * 
	 * @param id Blocked time id
	 * @returns Blocked time or null if not found
	 */
	async getBlockedTime(id: string): Promise<BlockedTime | null> {
		const collection = this.getBlockedTimesCollection();
		const doc = await collection.findOne({ id });

		if (!doc) return null;
		return this.docToBlockedTime(doc);
	}

	/** Get all blocked times, optionally filtered by providerId.
	 * 
	 * @param providerId Provider id to filter blocked times
	 * @returns Array of blocked times
	 */
	async getAllBlockedTimes(providerId?: string): Promise<BlockedTime[]> {
		const collection = this.getBlockedTimesCollection();
		const query = providerId ? { provider_id: providerId } : {};

		const docs = await collection.find(query).toArray();
		return docs.map((doc: Record<string, any>) => this.docToBlockedTime(doc));
	}

	/** Delete a blocked time by id.
	 * 
	 * @param id Blocked time id
	 */
	async deleteBlockedTime(id: string): Promise<void> {
		const collection = this.getBlockedTimesCollection();
		await collection.deleteOne({ id });
	}

	// Provider operations

	/** Save a provider.
	 * 
	 * @param provider Provider to save
	 * @returns Saved provider
	 */
	async saveProvider(provider: Provider): Promise<Provider> {
		const collection = this.getProvidersCollection();

		await collection.insertOne({
			id: provider.id,
			name: provider.name,
			metadata: provider.metadata || {},
		});

		return provider;
	}

	/** Get a provider by id.
	 * 
	 * @param id Provider id
	 * @returns Provider or null if not found
	 */
	async getProvider(id: string): Promise<Provider | null> {
		const collection = this.getProvidersCollection();
		const doc = await collection.findOne({ id });

		if (!doc) return null;
		return this.docToProvider(doc);
	}

	/** Get all providers.
	 * 
	 * @returns Array of providers
	 */
	async getAllProviders(): Promise<Provider[]> {
		const collection = this.getProvidersCollection();
		const docs = await collection.find({}).toArray();
		return docs.map((doc: Record<string, any>) => this.docToProvider(doc));
	}

	/** Delete a provider by id.
	 * 
	 * @param id Provider id
	 */
	async deleteProvider(id: string): Promise<void> {
		const collection = this.getProvidersCollection();
		await collection.deleteOne({ id });
	}

	/** Clear all data (useful for testing) */
	async clear(): Promise<void> {
		if (!this.db) return;

		await this.db.collection('appointments').deleteMany({});
		await this.db.collection('blocked_times').deleteMany({});
		await this.db.collection('providers').deleteMany({});
	}
}
