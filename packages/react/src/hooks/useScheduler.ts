import { useMemo, useCallback } from 'react';
import { Scheduler, type SchedulerConfig } from '@thunguard/scheduler-core';

/**
 * React hook for using the Scheduler in a component
 */
export function useScheduler(config?: SchedulerConfig) {
	const scheduler = useMemo(() => new Scheduler(config), [config]);

	const findAvailableSlots = useCallback(
		(options: Parameters<Scheduler['findAvailableSlots']>[0]) => {
			return scheduler.findAvailableSlots(options);
		},
		[scheduler]
	);

	const createAppointment = useCallback(
		(options: Parameters<Scheduler['createAppointment']>[0]) => {
			return scheduler.createAppointment(options);
		},
		[scheduler]
	);

	const updateAppointment = useCallback(
		(id: string, options: Parameters<Scheduler['updateAppointment']>[1]) => {
			return scheduler.updateAppointment(id, options);
		},
		[scheduler]
	);

	const deleteAppointment = useCallback(
		(id: string) => {
			return scheduler.deleteAppointment(id);
		},
		[scheduler]
	);

	return {
		scheduler,
		findAvailableSlots,
		createAppointment,
		updateAppointment,
		deleteAppointment,
	};
}
