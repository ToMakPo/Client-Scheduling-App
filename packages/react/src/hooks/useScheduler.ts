import { useMemo, useCallback, useState, useEffect } from 'react';
import { Scheduler, type SchedulerConfig } from '@thunguard/scheduler-core';

/**
 * React hook for using the Scheduler in a component
 * Handles async initialization and provides memoized scheduler methods
 */
export function useScheduler(config?: SchedulerConfig) {
	const [isInitialized, setIsInitialized] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	const scheduler = useMemo(() => new Scheduler(config), [config]);

	// Initialize scheduler on mount
	useEffect(() => {
		let mounted = true;

		const init = async () => {
			try {
				await scheduler.initialize();
				if (mounted) {
					setIsInitialized(true);
				}
			} catch (err) {
				if (mounted) {
					setError(err instanceof Error ? err : new Error(String(err)));
				}
			}
		};

		init();

		// Cleanup on unmount
		return () => {
			mounted = false;
			scheduler.cleanup();
		};
	}, [scheduler]);

	const findAvailableSlots = useCallback(
		async (options: Parameters<Scheduler['findAvailableSlots']>[0]) => {
			return scheduler.findAvailableSlots(options);
		},
		[scheduler]
	);

	const createAppointment = useCallback(
		async (options: Parameters<Scheduler['createAppointment']>[0]) => {
			return scheduler.createAppointment(options);
		},
		[scheduler]
	);

	const getAppointment = useCallback(
		async (id: string) => {
			return scheduler.getAppointment(id);
		},
		[scheduler]
	);

	const getAllAppointments = useCallback(
		async (providerId?: string) => {
			return scheduler.getAllAppointments(providerId);
		},
		[scheduler]
	);

	const updateAppointment = useCallback(
		async (id: string, options: Parameters<Scheduler['updateAppointment']>[1]) => {
			return scheduler.updateAppointment(id, options);
		},
		[scheduler]
	);

	const deleteAppointment = useCallback(
		async (id: string) => {
			return scheduler.deleteAppointment(id);
		},
		[scheduler]
	);

	const addBlockedTime = useCallback(
		async (block: Parameters<Scheduler['addBlockedTime']>[0]) => {
			return scheduler.addBlockedTime(block);
		},
		[scheduler]
	);

	const removeBlockedTime = useCallback(
		async (id: string) => {
			return scheduler.removeBlockedTime(id);
		},
		[scheduler]
	);

	const getAllBlockedTimes = useCallback(
		async (providerId?: string) => {
			return scheduler.getAllBlockedTimes(providerId);
		},
		[scheduler]
	);

	const addProvider = useCallback(
		async (provider: Parameters<Scheduler['addProvider']>[0]) => {
			return scheduler.addProvider(provider);
		},
		[scheduler]
	);

	const removeProvider = useCallback(
		async (id: string) => {
			return scheduler.removeProvider(id);
		},
		[scheduler]
	);

	const getAllProviders = useCallback(
		async () => {
			return scheduler.getAllProviders();
		},
		[scheduler]
	);

	const getProvider = useCallback(
		async (id: string) => {
			return scheduler.getProvider(id);
		},
		[scheduler]
	);

	return {
		scheduler,
		isInitialized,
		error,
		findAvailableSlots,
		createAppointment,
		getAppointment,
		getAllAppointments,
		updateAppointment,
		deleteAppointment,
		addBlockedTime,
		removeBlockedTime,
		getAllBlockedTimes,
		addProvider,
		removeProvider,
		getAllProviders,
		getProvider,
	};
}
