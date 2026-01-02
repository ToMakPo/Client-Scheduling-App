import type {
	Appointment,
	BlockedTime,
	Provider,
} from './types';

/**
 * Abstract storage adapter interface for persisting scheduler data
 * Implementations support different databases (PostgreSQL, MySQL, MongoDB, etc.)
 */
export interface StorageAdapter {
	/**
	 * Initialize the storage adapter and verify connection
	 */
	connect(): Promise<void>;

	/**
	 * Close the storage connection and cleanup resources
	 */
	disconnect(): Promise<void>;

	// Appointment operations
	/**
	 * Save a new appointment
	 */
	saveAppointment(appointment: Appointment): Promise<Appointment>;

	/**
	 * Retrieve an appointment by ID
	 */
	getAppointment(id: string): Promise<Appointment | null>;

	/**
	 * Get all appointments, optionally filtered by provider
	 */
	getAllAppointments(providerId?: string): Promise<Appointment[]>;

	/**
	 * Update an existing appointment
	 */
	updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment>;

	/**
	 * Delete an appointment
	 */
	deleteAppointment(id: string): Promise<void>;

	// BlockedTime operations
	/**
	 * Save a new blocked time period
	 */
	saveBlockedTime(blockedTime: BlockedTime): Promise<BlockedTime>;

	/**
	 * Get all blocked times, optionally filtered by provider
	 */
	getAllBlockedTimes(providerId?: string): Promise<BlockedTime[]>;

	/**
	 * Delete a blocked time period
	 */
	deleteBlockedTime(id: string): Promise<void>;

	// Provider operations
	/**
	 * Save a new provider
	 */
	saveProvider(provider: Provider): Promise<Provider>;

	/**
	 * Retrieve a provider by ID
	 */
	getProvider(id: string): Promise<Provider | null>;

	/**
	 * Get all providers
	 */
	getAllProviders(): Promise<Provider[]>;

	/**
	 * Delete a provider
	 */
	deleteProvider(id: string): Promise<void>;

	/**
	 * Clear all data (for testing)
	 */
	clear?(): Promise<void>;
}
