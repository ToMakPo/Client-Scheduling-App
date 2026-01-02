# Client-Scheduling-App

Monorepo for headless scheduling library and React components for building appointment booking systems.

## 📦 Packages

This monorepo contains two npm packages:

### [@thunguard/scheduler-core](./packages/core)
Framework-agnostic headless scheduling library that provides:
- ✅ Stateful appointment management
- ✅ Multi-provider scheduling
- ✅ Flexible duration with buffer time
- ✅ Smart availability slot finding
- ✅ Blocked time management (breaks, PTO, holidays)
- ✅ Full CRUD operations
- ✅ TypeScript support with zero dependencies

**Use this if:** You want maximum flexibility and plan to build your own UI.

### [@thunguard/scheduler-react](./packages/react)
React hooks and components built on top of `@thunguard/scheduler-core`:
- ✅ `useScheduler` hook for easy integration
- ✅ React 18+ compatible
- ✅ Fully typed with TypeScript

**Use this if:** You're building a React application and want quick integration.

## 🚀 Quick Start

### Using the Headless Core (Any Framework)

```bash
npm install @thunguard/scheduler-core
```

```typescript
import { Scheduler } from '@thunguard/scheduler-core';

const scheduler = new Scheduler({
	providers: [
		{ id: 'dr-a', name: 'Dr. A' },
		{ id: 'dr-b', name: 'Dr. B' }
	]
});

// Find available slots
const slots = scheduler.findAvailableSlots({
	duration: { totalMinutes: 60, bufferMinutes: 10 },
	startDate: '2026-01-15T08:00:00Z',
	endDate: '2026-01-15T17:00:00Z',
	incrementMinutes: 15
});

// Create appointment
const apt = scheduler.createAppointment({
	startTime: '2026-01-15T10:30:00Z',
	duration: { totalMinutes: 60, bufferMinutes: 10 },
	providerId: 'dr-a'
});
```

### Using with React

```bash
npm install @thunguard/scheduler-react @thunguard/scheduler-core
```

```tsx
import { useScheduler } from '@thunguard/scheduler-react';

function BookingApp() {
	const { createAppointment, findAvailableSlots } = useScheduler({
		providers: [{ id: 'dr-a', name: 'Dr. A' }]
	});

	// Use the scheduling functions...
}
```

## 🏗️ Architecture

```
client-scheduling-app/
├── packages/
│	 ├── core/							# @thunguard/scheduler-core (headless library)
│	 │	 ├── src/
│	 │	 │	 ├── Scheduler.ts
│	 │	 │	 ├── types.ts
│	 │	 │	 └── index.ts
│	 │	 └── package.json
│	 │
│	 └── react/						 # @thunguard/scheduler-react (React bindings)
│			 ├── src/
│			 │	 ├── hooks/
│			 │	 │	 └── useScheduler.ts
│			 │	 └── index.ts
│			 └── package.json
│
├── examples/							# Usage examples
└── package.json					 # Workspace root
```

## 🛠️ Development

This is an npm workspace monorepo. Both packages are developed together.

### Install Dependencies
```bash
npm install
```

### Build All Packages
```bash
npm run build
```

### Development Mode (Watch)
```bash
npm run dev
```

### Clean Build Artifacts
```bash
npm run clean
```

## 📋 Features Roadmap

### Core Features (v0.1.0)
- [x] Basic scheduler class
- [x] Appointment CRUD operations
- [x] Blocked time management
- [x] Multi-provider support
- [ ] **Available slot finding algorithm** (in progress)
- [ ] Timezone support
- [ ] Recurring appointments
- [ ] Conflict detection

### React Package (v0.1.0)
- [x] `useScheduler` hook
- [ ] UI components (Calendar, DatePicker, etc.)
- [ ] Storybook documentation

## 📝 License

MIT

## 👤 Author

Makai Post <post.makai@example.com>

---

For more information, please visit the [GitHub repository](https://github.com/ToMakPo/Client-Scheduling-App)
