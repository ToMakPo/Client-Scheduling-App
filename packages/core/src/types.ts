/** Core types for the scheduling library */

/** Abstract storage adapter interface for persisting scheduler data
 * Implementations support different databases (PostgreSQL, MySQL, MongoDB, etc.)
 */
export interface StorageAdapter {
	/** Initialize the storage adapter and verify connection. */
	connect(): Promise<void>;

	/** Close the storage connection and cleanup resources. */
	disconnect(): Promise<void>;

	// Appointment operations
	/** Save a new appointment.
	 * 
	 * @param appointment Appointment to save
	 * @returns Saved appointment
	 */
	saveAppointment(appointment: Appointment): Promise<Appointment>;

	/** Retrieve an appointment by id.
	 * 
	 * @param id Appointment id
	 * @returns Appointment or null if not found
	 */
	getAppointment(id: string): Promise<Appointment | null>;

	/** Get all appointments, optionally filtered by provider.
	 * 
	 * @param providerId Optional provider id to filter appointments
	 * @returns List of appointments
	 */
	getAllAppointments(providerId?: string): Promise<Appointment[]>;

	/** Update an existing appointment.
	 * 
	 * @param id Appointment id
	 * @param updates Partial appointment data to update
	 * @returns Updated appointment
	 */
	updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment>;

	/** Delete an appointment.
	 * 
	 * @param id Appointment id
	 */
	deleteAppointment(id: string): Promise<void>;

	// BlockedTime operations
	/** Save a new blocked time period.
	 * 
	 * @param blockedTime Blocked time to save
	 * @returns Saved blocked time
	 */
	saveBlockedTime(blockedTime: BlockedTime): Promise<BlockedTime>;

	/** Get all blocked times, optionally filtered by provider.
	 * 
	 * @param providerId Optional provider id to filter blocked times
	 * @returns List of blocked times
	 */
	getAllBlockedTimes(providerId?: string): Promise<BlockedTime[]>;

	/** Delete a blocked time period.
	 * 
	 * @param id Blocked time id
	 */
	deleteBlockedTime(id: string): Promise<void>;

	// Provider operations
	/** Save a new provider.
	 * 
	 * @param provider Provider to save
	 * @returns Saved provider
	 */
	saveProvider(provider: Provider): Promise<Provider>;

	/** Retrieve a provider by id.
	 * 
	 * @param id Provider id
	 * @returns Provider or null if not found
	 */
	getProvider(id: string): Promise<Provider | null>;

	/** Get all providers.
	 * 
	 * @returns List of providers
	 */
	getAllProviders(): Promise<Provider[]>;

	/** Delete a provider.
	 * 
	 * @param id Provider id
	 */
	deleteProvider(id: string): Promise<void>;

	/** Clear all data (for testing) */
	clear?(): Promise<void>;
}

/** Configuration for appointment duration and buffer time */
export interface AppointmentDuration {
	/** Total duration of the appointment window in minutes */
	totalMinutes: number;
	/** Buffer time for setup/cleanup in minutes (deducted from total) */
	bufferMinutes?: number;
}

/** Represents a scheduled appointment */
export interface Appointment {
	/** Unique identifier for the appointment */
	id: string;
	/** ISO 8601 date-time string for appointment start */
	startTime: string;
	/** ISO 8601 date-time string for appointment end */
	endTime: string;
	/** Provider/employee ID assigned to this appointment */
	providerId?: string;
	/** Optional metadata about the appointment */
	metadata?: Record<string, unknown>;
}

/** Represents a time period when appointments cannot be scheduled */
export interface BlockedTime {
	/** Unique identifier for the blocked time */
	id: string;
	/** ISO 8601 date-time string for block start */
	startTime: string;
	/** ISO 8601 date-time string for block end */
	endTime: string;
	/** Provider ID this block applies to (if undefined, applies to all) */
	providerId?: string;
	/** Reason for blocking (e.g., "lunch", "pto", "holiday") */
	reason?: string;
}

/** Represents an available time slot for booking */
export interface TimeSlot {
	/** ISO 8601 date-time string for slot start */
	startTime: string;
	/** ISO 8601 date-time string for slot end */
	endTime: string;
	/** Provider ID(s) available for this slot */
	providerIds: string[];
}

/** Provider/employee information */
export interface Provider {
	/** Unique identifier for the provider */
	id: string;
	/** Provider's name */
	name: string;
	/** Optional metadata about the provider */
	metadata?: Record<string, unknown>;
}

/** Configuration for the Scheduler */
export interface SchedulerConfig {
	/** List of appointments already scheduled */
	appointments?: Appointment[];
	/** List of blocked time periods */
	blockedTimes?: BlockedTime[];
	/** List of available providers */
	providers?: Provider[];
	/** Default increment for available slot searches (in minutes) */
	defaultIncrement?: number;
	/** Storage adapter for persistence (optional - defaults to in-memory) */
	storage?: StorageAdapter;
}

/** Options for finding available time slots */
export interface FindSlotsOptions {
	/** Appointment duration configuration */
	duration: AppointmentDuration;
	/** Start of the search range (ISO 8601 date-time) */
	startDate: string;
	/** End of the search range (ISO 8601 date-time) */
	endDate: string;
	/** Time increment for slot suggestions in minutes (default: 15) */
	incrementMinutes?: number;
	/** Filter to specific provider IDs (undefined = all providers) */
	providerIds?: string[];
}

/** Options for creating an appointment */
export interface CreateAppointmentOptions {
	/** ISO 8601 date-time string for appointment start */
	startTime: string;
	/** Appointment duration configuration */
	duration: AppointmentDuration;
	/** Provider ID to assign (optional) */
	providerId?: string;
	/** Optional metadata */
	metadata?: Record<string, unknown>;
}

/** Options for updating an appointment */
export interface UpdateAppointmentOptions {
	/** New start time (ISO 8601) */
	startTime?: string;
	/** New duration configuration */
	duration?: AppointmentDuration;
	/** New provider ID */
	providerId?: string;
	/** Updated metadata */
	metadata?: Record<string, unknown>;
}
