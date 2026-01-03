import { Moment } from 'moment'

export interface MyDayOfWeekInfo {
	day: number // 0 (Sunday) to 6 (Saturday)
	name: string
	short: string
}

export class MyDayOfWeek implements MyDayOfWeekInfo {
	static readonly Sunday = new MyDayOfWeek(0)
	static readonly Monday = new MyDayOfWeek(1)
	static readonly Tuesday = new MyDayOfWeek(2)
	static readonly Wednesday = new MyDayOfWeek(3)
	static readonly Thursday = new MyDayOfWeek(4)
	static readonly Friday = new MyDayOfWeek(5)
	static readonly Saturday = new MyDayOfWeek(6)

	private _day = null as unknown as number

	private constructor(day: number) {
		if (day < 0 || day > 6 || !Number.isInteger(day)) {
			throw new Error("Day of week must be an integer between 0 (Sunday) and 6 (Saturday).")
		}
		
		this._day = day
	}

	get day(): number { return this._day }

	get name(): string {
		return MyDayOfWeek._dayNames[this._day]
	}

	get short(): string {
		return MyDayOfWeek._dayNames[this._day].substring(0, 3)
	}

	toString(): string {
		return this._day.toString()
	}

	toRepr(): string {
		return `MyDayOfWeek(day=${this._day})`
	}

	toJSON() {
		return this._day
	}

	private static _dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
	private static _normalize = (day: number) => ((day % 7) + 7) % 7

	static get(day: string | number | MyDayOfWeek): MyDayOfWeek {
		if (day instanceof MyDayOfWeek) return day

		day = typeof day === "number" ? MyDayOfWeek._normalize(day).toString() : day.toLowerCase().trim()

		if (["0", "sun", "sunday"].includes(day.toString().toLowerCase())) return MyDayOfWeek.Sunday
		if (["1", "mon", "monday"].includes(day.toString().toLowerCase())) return MyDayOfWeek.Monday
		if (["2", "tue", "tuesday"].includes(day.toString().toLowerCase())) return MyDayOfWeek.Tuesday
		if (["3", "wed", "wednesday"].includes(day.toString().toLowerCase())) return MyDayOfWeek.Wednesday
		if (["4", "thu", "thursday"].includes(day.toString().toLowerCase())) return MyDayOfWeek.Thursday
		if (["5", "fri", "friday"].includes(day.toString().toLowerCase())) return MyDayOfWeek.Friday
		if (["6", "sat", "saturday"].includes(day.toString().toLowerCase())) return MyDayOfWeek.Saturday

		throw new Error(`Invalid day of week: ${day}`)
	}
}

export class MyDate extends Date {}
export class MyTime extends Date {}

export class MyTimeZone {
	private _date: Date

	constructor(offset?: number) {
		if (offset == null) {
			this._date = new Date()
			return
		}

		const now = new Date()
		this._date = new Date(now.getTime() + (offset - now.getTimezoneOffset()) * 60000)
	}

	get offset(): number {
		return this._date.getTimezoneOffset()
	}
	get name(): string {
		return Intl.DateTimeFormat().resolvedOptions().timeZone
	}
	toString(): string {
		return 'UTC' + (this.offset <= 0 ? '+' : '-') + String(Math.abs(this.offset) / 60).padStart(2, '0') + ':00'
	}

	toRepr(): string {
		return `MyTimeZone(name="${this.name}", offset=${this.offset})`
	}

	toJSON() {
		return {
			name: this.name,
			offset: this.offset
		}
	}
}