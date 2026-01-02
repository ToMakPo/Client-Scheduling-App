import type {
	Appointment,
	BlockedTime,
	Provider,
	SchedulerConfig,
	FindSlotsOptions,
	TimeSlot,
	CreateAppointmentOptions,
	UpdateAppointmentOptions,
} from './types';

/**
 * Stateful scheduler for managing appointments, availability, and providers
 */
export class Scheduler {
	private appointments: Map<string, Appointment> = new Map();
	private blockedTimes: Map<string, BlockedTime> = new Map();
	private providers: Map<string, Provider> = new Map();
	private defaultIncrement: number = 15;

	constructor(config: SchedulerConfig = {}) {
		// Initialize appointments
		if (config.appointments) {
			config.appointments.forEach(apt => {
				this.appointments.set(apt.id, apt);
			});
		}

		// Initialize blocked times
		if (config.blockedTimes) {
			config.blockedTimes.forEach(block => {
				this.blockedTimes.set(block.id, block);
			});
		}

		// Initialize providers
		if (config.providers) {
			config.providers.forEach(provider => {
				this.providers.set(provider.id, provider);
			});
		}

		// Set default increment
		if (config.defaultIncrement) {
			this.defaultIncrement = config.defaultIncrement;
		}
	}

    /**
     * Find available time slots for booking
     */
    findAvailableSlots(options: FindSlotsOptions): TimeSlot[] {
        const increment = options.incrementMinutes ?? this.defaultIncrement;
        const usableDuration = options.duration.totalMinutes - (options.duration.bufferMinutes ?? 0);
        
        if (increment <= 0 || usableDuration <= 0 || new Date(options.startDate) >= new Date(options.endDate)) {
            return [];
        }

        const allProviders = Array.from(this.providers.values());
        const availableProviders = options.providerIds 
            ? allProviders.filter(p => options.providerIds!.includes(p.id))
            : allProviders;

        if (availableProviders.length === 0) {
            return [];
        }

        const slots: TimeSlot[] = [];
        let current = new Date(options.startDate);
        const end = new Date(options.endDate);

        while (current < end) {
            const slotEnd = new Date(current.getTime() + options.duration.totalMinutes * 60000);
            
            if (slotEnd > end) break;

            const validProviders = availableProviders.filter(provider => {
                // Check appointments (provider-specific or global)
                for (const apt of this.appointments.values()) {
                    if (apt.providerId !== provider.id && apt.providerId !== undefined) continue;
                    const aptStart = new Date(apt.startTime);
                    const aptEnd = new Date(apt.endTime);
                    if (!(slotEnd <= aptStart || current >= aptEnd)) return false;
                }

                // Check blocked times (provider-specific or global)
                for (const block of this.blockedTimes.values()) {
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
	createAppointment(options: CreateAppointmentOptions): Appointment {
		const id = this.generateId();
		const endTime = this.calculateEndTime(options.startTime, options.duration);

		const appointment: Appointment = {
			id,
			startTime: options.startTime,
			endTime,
			providerId: options.providerId,
			metadata: options.metadata,
		};

		this.appointments.set(id, appointment);
		return appointment;
	}

	/**
	 * Get an appointment by ID
	 */
	getAppointment(id: string): Appointment | undefined {
		return this.appointments.get(id);
	}

	/**
	 * Get all appointments
	 */
	getAllAppointments(): Appointment[] {
		return Array.from(this.appointments.values());
	}

	/**
	 * Update an existing appointment
	 */
	updateAppointment(id: string, options: UpdateAppointmentOptions): Appointment | null {
		const existing = this.appointments.get(id);
		if (!existing) return null;

		const updated: Appointment = {
			...existing,
			startTime: options.startTime ?? existing.startTime,
			providerId: options.providerId ?? existing.providerId,
			metadata: options.metadata ?? existing.metadata,
		};

		// Recalculate end time if start time or duration changed
		if (options.startTime || options.duration) {
			const duration = options.duration ?? {
				totalMinutes: this.calculateDurationMinutes(existing.startTime, existing.endTime),
			};
			updated.endTime = this.calculateEndTime(updated.startTime, duration);
		}

		this.appointments.set(id, updated);
		return updated;
	}

	/**
	 * Delete an appointment
	 */
	deleteAppointment(id: string): boolean {
		return this.appointments.delete(id);
	}

	/**
	 * Add a blocked time period
	 */
	addBlockedTime(block: Omit<BlockedTime, 'id'>): BlockedTime {
		const id = this.generateId();
		const blockedTime: BlockedTime = { id, ...block };
		this.blockedTimes.set(id, blockedTime);
		return blockedTime;
	}

	/**
	 * Remove a blocked time period
	 */
	removeBlockedTime(id: string): boolean {
		return this.blockedTimes.delete(id);
	}

	/**
	 * Get all blocked times
	 */
	getAllBlockedTimes(): BlockedTime[] {
		return Array.from(this.blockedTimes.values());
	}

	/**
	 * Add a provider
	 */
	addProvider(provider: Provider): void {
		this.providers.set(provider.id, provider);
	}

	/**
	 * Remove a provider
	 */
	removeProvider(id: string): boolean {
		return this.providers.delete(id);
	}

	/**
	 * Get all providers
	 */
	getAllProviders(): Provider[] {
		return Array.from(this.providers.values());
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
