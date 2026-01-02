# @makai/scheduler-core

Framework-agnostic headless scheduling library for managing appointments, availability, and multi-provider scheduling.

## Installation

```bash
npm install @makai/scheduler-core
```

## Features

- ✅ **Stateful Scheduler** - Object-based API for easy state management
- ✅ **Flexible Duration** - Configurable appointment windows with buffer time
- ✅ **Smart Slot Finding** - Search available slots with custom increments
- ✅ **Multi-Provider Support** - Manage multiple providers/employees
- ✅ **Blocked Time Management** - Handle breaks, PTO, holidays, operating hours
- ✅ **Full CRUD** - Create, read, update, delete appointments
- ✅ **TypeScript** - Fully typed API
- ✅ **Zero Dependencies** - No external dependencies

## Quick Start

```typescript
import { Scheduler } from "@makai/scheduler-core"

// Create scheduler instance
const scheduler = new Scheduler({
  providers: [
    { id: "dr-a", name: "Dr. A" },
    { id: "dr-b", name: "Dr. B" },
  ],
  defaultIncrement: 15, // 15-minute slot increments
})

// Add blocked time (lunch break)
scheduler.addBlockedTime({
  startTime: "2026-01-15T12:00:00Z",
  endTime: "2026-01-15T13:00:00Z",
  reason: "lunch",
})

// Find available slots
const slots = scheduler.findAvailableSlots({
  duration: {
    totalMinutes: 60, // 1 hour total window
    bufferMinutes: 10, // 10 min buffer (50 min usable)
  },
  startDate: "2026-01-15T08:00:00Z",
  endDate: "2026-01-15T17:00:00Z",
  incrementMinutes: 15, // Check every 15 minutes
})

// Create appointment
const appointment = scheduler.createAppointment({
  startTime: "2026-01-15T10:30:00Z",
  duration: { totalMinutes: 60, bufferMinutes: 10 },
  providerId: "dr-a",
  metadata: { patientName: "John Doe" },
})

// Update appointment
scheduler.updateAppointment(appointment.id, {
  startTime: "2026-01-15T14:00:00Z",
})

// Delete appointment
scheduler.deleteAppointment(appointment.id)
```

## API Reference

### `Scheduler`

**Constructor:** `new Scheduler(config?: SchedulerConfig)`

**Methods:**

- `findAvailableSlots(options)` - Find available time slots
- `createAppointment(options)` - Create new appointment
- `getAppointment(id)` - Get appointment by ID
- `getAllAppointments()` - Get all appointments
- `updateAppointment(id, options)` - Update appointment
- `deleteAppointment(id)` - Delete appointment
- `addBlockedTime(block)` - Add blocked time period
- `removeBlockedTime(id)` - Remove blocked time
- `getAllBlockedTimes()` - Get all blocked times
- `addProvider(provider)` - Add provider
- `removeProvider(id)` - Remove provider
- `getAllProviders()` - Get all providers

## TypeScript Types

All types are exported from the package. See the [full type definitions](./src/types.ts) for details.

## License

MIT
