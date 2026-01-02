import type {
	Appointment,
	BlockedTime,
	Provider,
	SchedulerConfig,
	FindSlotsOptions,
	TimeSlot,
	CreateAppointmentOptions,
	UpdateAppointmentOptions,
	StorageAdapter,
} from './types';

/**
 * In-memory storage adapter fallback when no adapter is provided
 */
class MemoryStorageAdapter implements StorageAdapter {
	private appointments: Map<string, Appointment> = new Map();
	private blockedTimes: Map<string, BlockedTime> = new Map();
	private providers: Map<string, Provider> = new Map();

	async connect(): Promise<void> {
		// No-op for memory storage
	}

	async disconnect(): Promise<void> {
		// No-op for memory storage
	}

	async saveAppointment(appointment: Appointment): Promise<Appointment> {
		this.appointments.set(appointment.id, appointment);
		return appointment;
	}

	async getAppointment(id: string): Promise<Appointment | null> {
		return this.appointments.get(id) ?? null;
	}

	async getAllAppointments(providerId?: string): Promise<Appointment[]> {
		const appointments = Array.from(this.appointments.values());
		if (providerId) {
			return appointments.filter(a => a.providerId === providerId);
		}
		return appointments;
	}

	async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
		const existing = this.appointments.get(id);
		if (!existing) throw new Error(`Appointment ${id} not found`);

		const updated = { ...existing, ...updates };
		this.appointments.set(id, updated);
		return updated;
	}

	async deleteAppointment(id: string): Promise<void> {
		this.appointments.delete(id);
	}

	async saveBlockedTime(blockedTime: BlockedTime): Promise<BlockedTime> {
		this.blockedTimes.set(blockedTime.id, blockedTime);
		return blockedTime;
	}

	async getAllBlockedTimes(providerId?: string): Promise<BlockedTime[]> {
		const blocks = Array.from(this.blockedTimes.values());
		if (providerId) {
			return blocks.filter(b => b.providerId === providerId);
		}
		return blocks;
	}

	async deleteBlockedTime(id: string): Promise<void> {
		this.blockedTimes.delete(id);
	}

	async saveProvider(provider: Provider): Promise<Provider> {
		this.providers.set(provider.id, provider);
		return provider;
	}

	async getProvider(id: string): Promise<Provider | null> {
		return this.providers.get(id) ?? null;
	}

	async getAllProviders(): Promise<Provider[]> {
		return Array.from(this.providers.values());
	}

	async deleteProvider(id: string): Promise<void> {
		this.providers.delete(id);
	}

	async clear(): Promise<void> {
		this.appointments.clear();
		this.blockedTimes.clear();
		this.providers.clear();
	}
}

/**
 * Stateful scheduler for managing appointments, availability, and providers
 * Supports both in-memory and persistent storage via StorageAdapter
 */
export class Scheduler {
	private storage: StorageAdapter;
	private defaultIncrement: number = 15;
	private initialized: boolean = false;

	constructor(config: SchedulerConfig = {}) {
		// Use provided storage adapter or fall back to in-memory
		this.storage = config.storage ?? new MemoryStorageAdapter();

		// Set default increment
		if (config.defaultIncrement) {
			this.defaultIncrement = config.defaultIncrement;
		}
	}

	/**
	 * Initialize the scheduler (connects storage adapter)
	 * Must be called before using the scheduler
	 */
	async initialize(): Promise<void> {
		if (!this.initialized) {
			await this.storage.connect();
			this.initialized = true;
		}
	}

	/**
	 * Clean up resources (closes storage connection)
	 */
	async cleanup(): Promise<void> {
		if (this.initialized) {
			await this.storage.disconnect();
			this.initialized = false;
		}
	}

    /**
     * Find available time slots for booking
     */
    async findAvailableSlots(options: FindSlotsOptions): Promise<TimeSlot[]> {
        const increment = options.incrementMinutes ?? this.defaultIncrement;
        const usableDuration = options.duration.totalMinutes - (options.duration.bufferMinutes ?? 0);
        
        if (increment <= 0 || usableDuration <= 0 || new Date(options.startDate) >= new Date(options.endDate)) {
            return [];
        }

        // Get all providers or filter to specific ones
        const allProviders = await this.storage.getAllProviders();
        const availableProviders = options.providerIds 
            ? allProviders.filter(p => options.providerIds!.includes(p.id))
            : allProviders;

        if (availableProviders.length === 0) {
            return [];
        }

        // Get all appointments and blocked times
        const appointments = await this.storage.getAllAppointments();
        const blockedTimes = await this.storage.getAllBlockedTimes();

        const slots: TimeSlot[] = [];
        let current = new Date(options.startDate);
        const end = new Date(options.endDate);

        while (current < end) {
            const slotEnd = new Date(current.getTime() + options.duration.totalMinutes * 60000);
            
            if (slotEnd > end) break;

            const validProviders = availableProviders.filter(provider => {
                // Check appointments (provider-specific or global)
                for (const apt of appointments) {
                    if (apt.providerId !== provider.id && apt.providerId !== undefined) continue;
                    const aptStart = new Date(apt.startTime);
                    const aptEnd = new Date(apt.endTime);
                    if (!(slotEnd <= aptStart || current >= aptEnd)) return false;
                }

                // Check blocked times (provider-specific or global)
                for (const block of blockedTimes) {
                    if (block.providerId !== provider.id && block.providerId !== undefined) continue;
                    const blockStart = new Date(block.startTime);
                    const blockEnd = new Date(block.endTime);
                    if (!(slotEnd <= blockStart || current >= blockEnd)) return false;
                }

                return true;
            });

            if (validProviders.length > 0) {
                slots.push({
                    startTime: current.toISOString(),
                    endTime: slotEnd.toISOString(),
                    providerIds: validProviders.map(p => p.id)
                });
            }

            current = new Date(current.getTime() + increment * 60000);
        }

        return slots;
    }

	/**
	 * Create a new appointment
	 */
	async createAppointment(options: CreateAppointmentOptions): Promise<Appointment> {
		const id = this.generateId();
		const endTime = this.calculateEndTime(options.startTime, options.duration);

		const appointment: Appointment = {
			id,
			startTime: options.startTime,
			endTime,
			providerId: options.providerId,
			metadata: options.metadata,
		};

		return this.storage.saveAppointment(appointment);
	}

	/**
	 * Get an appointment by ID
	 */
	async getAppointment(id: string): Promise<Appointment | null> {
		return this.storage.getAppointment(id);
	}

	/**
	 * Get all appointments
	 */
	async getAllAppointments(providerId?: string): Promise<Appointment[]> {
		return this.storage.getAllAppointments(providerId);
	}

	/**
	 * Update an existing appointment
	 */
	async updateAppointment(id: string, options: UpdateAppointmentOptions): Promise<Appointment | null> {
		const existing = await this.storage.getAppointment(id);
		if (!existing) return null;

		const updates: Partial<Appointment> = {
			startTime: options.startTime ?? existing.startTime,
			providerId: options.providerId ?? existing.providerId,
			metadata: options.metadata ?? existing.metadata,
		};

		// Recalculate end time if start time or duration changed
		if (options.startTime || options.duration) {
			const duration = options.duration ?? {
				totalMinutes: this.calculateDurationMinutes(existing.startTime, existing.endTime),
			};
			updates.endTime = this.calculateEndTime(updates.startTime!, duration);
		}

		return this.storage.updateAppointment(id, updates);
	}

	/**
	 * Delete an appointment
	 */
	async deleteAppointment(id: string): Promise<void> {
		await this.storage.deleteAppointment(id);
	}

	/**
	 * Add a blocked time period
	 */
	async addBlockedTime(block: Omit<BlockedTime, 'id'>): Promise<BlockedTime> {
		const id = this.generateId();
		const blockedTime: BlockedTime = { id, ...block };
		return this.storage.saveBlockedTime(blockedTime);
	}

	/**
	 * Remove a blocked time period
	 */
	async removeBlockedTime(id: string): Promise<void> {
		await this.storage.deleteBlockedTime(id);
	}

	/**
	 * Get all blocked times
	 */
	async getAllBlockedTimes(providerId?: string): Promise<BlockedTime[]> {
		return this.storage.getAllBlockedTimes(providerId);
	}

	/**
	 * Add a provider
	 */
	async addProvider(provider: Provider): Promise<void> {
		await this.storage.saveProvider(provider);
	}

	/**
	 * Remove a provider
	 */
	async removeProvider(id: string): Promise<void> {
		await this.storage.deleteProvider(id);
	}

	/**
	 * Get all providers
	 */
	async getAllProviders(): Promise<Provider[]> {
		return this.storage.getAllProviders();
	}

	/**
	 * Get a specific provider by ID
	 */
	async getProvider(id: string): Promise<Provider | null> {
		return this.storage.getProvider(id);
	}

	/**
	 * Calculate end time based on start time and duration
	 */
	private calculateEndTime(startTime: string, duration: { totalMinutes: number }): string {
		const start = new Date(startTime);
		const end = new Date(start.getTime() + duration.totalMinutes * 60000);
		return end.toISOString();
	}

	/**
	 * Calculate duration in minutes between two times
	 */
	private calculateDurationMinutes(startTime: string, endTime: string): number {
		const start = new Date(startTime);
		const end = new Date(endTime);
		return Math.floor((end.getTime() - start.getTime()) / 60000);
	}

	/**
	 * Generate a unique ID
	 */
	private generateId(): string {
		return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	}
}
