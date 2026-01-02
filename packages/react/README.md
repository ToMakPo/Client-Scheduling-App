# @makai/scheduler-react

React components and hooks for scheduling, built on top of [@makai/scheduler-core](../core).

## Installation

```bash
npm install @makai/scheduler-react @makai/scheduler-core
```

Note: React 18+ is required as a peer dependency.

## Quick Start

```tsx
import { useScheduler } from '@makai/scheduler-react';

function AppointmentBooking() {
  const { scheduler, createAppointment, findAvailableSlots } = useScheduler({
    providers: [
      { id: 'dr-a', name: 'Dr. A' },
      { id: 'dr-b', name: 'Dr. B' }
    ]
  });

  const handleBook = () => {
    const appointment = createAppointment({
      startTime: '2026-01-15T10:00:00Z',
      duration: { totalMinutes: 60, bufferMinutes: 10 },
      providerId: 'dr-a'
    });
    console.log('Booked:', appointment);
  };

  return (
    <button onClick={handleBook}>
      Book Appointment
    </button>
  );
}
```

## Hooks

### `useScheduler(config?)`

React hook that creates and manages a Scheduler instance.

**Returns:**
- `scheduler` - Scheduler instance
- `findAvailableSlots(options)` - Memoized function
- `createAppointment(options)` - Memoized function
- `updateAppointment(id, options)` - Memoized function
- `deleteAppointment(id)` - Memoized function

## License

MIT
