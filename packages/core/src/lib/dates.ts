// ////////////////
// /// DATETIME ///
// ////////////////
// // #region DateTime

// class MyDateTime {
// 	private _jsDate: Date
// 	private _date: MyDate
// 	private _time: Time
// 	private _timezone: TimeZone

// 	private constructor(year: number, month: number, day: number, hours: number, minutes: number, timezone: TimeZone) {
// 		this._date = MyDate.new(year, month, day)
// 		this._time = Time.new(hours, minutes)
// 		this._timezone = TimeZone.fromName(timezone)
// 		this._jsDate = new Date(year, month - 1, day, hours, minutes, 0, 0)
// 		// this._date._jsDate = this._jsDate
// 		// this._time._jsDate = this._jsDate
// 	}

// 	get MyDate(): MyDate { return this._date }
// 	get year(): number { return this._date.year }
// 	get month(): number { return this._date.month }
// 	get day(): number { return this._date.day }

// 	get time(): Time { return this._time }
// 	get hours(): number { return this._time.hours }
// 	get minutes(): number { return this._time.minutes }

// 	get timezone(): TimeZone { return this._timezone }
// 	get timezoneName(): string { return this._timezone.name }
// 	get offset(): number { return this._timezone.offset }

// 	get string(): string {
// 		return `${this._date.string} ${this._time.string} ${this._timezone.name}`
// 	}

// 	toString(): string {
// 		return this.string
// 	}

// 	toRepr(): string {
// 		return `DateTime(${this._date.year}, ${this._date.month}, ${this._date.day}, ${this._time.hours}, ${this._time.minutes}, '${this._timezone.name}')`
// 	}

// 	format(pattern: string): string {
// 		pattern = this._date.format(pattern)
// 		pattern = this._time.format(pattern)
// 		pattern = this._timezone.format(pattern)

// 		return pattern
// 	}

// 	// valueOf(): number {


// 	static new(year: number, month: number, day: number, hours: number, minutes: number, timezone: TimeZone): MyDateTime {
// 		return new MyDateTime(year, month, day, hours, minutes, timezone)
// 	}

// 	/** Parses a MyDate-time string in "YYYY-MM-DD HH:MM" or "YYYY-MM-DD HH:MM TZ" format.
// 	 * 
// 	 * Examples:
// 	 * - "2023-10-05 14:30" (assumes local timezone)
// 	 * - "2023-10-05 14:30 -05:00" (with timezone offset)
// 	 * - "2023-10-05 14:30 America/New_York" (with IANA timezone)
// 	 */
// 	static parse(dateTimeString: string): MyDateTime {
// 		const parts = dateTimeString.split(' ')

// 		const datePart = parts[0]
// 		const [yyyyStr, mmStr, ddStr] = datePart.split('-')
// 		const year = parseInt(yyyyStr, 10)
// 		const month = parseInt(mmStr, 10)
// 		const day = parseInt(ddStr, 10)

// 		const timePart = parts[1]
// 		const [hhStr, minStr] = timePart.split(':')
// 		const hours = parseInt(hhStr, 10)
// 		const minutes = parseInt(minStr, 10)

// 		const timezonePart = parts[2] || Intl.DateTimeFormat().resolvedOptions().timeZone
// 		const timezone = TimeZone.fromName(timezonePart)

// 		return new MyDateTime(year, month, day, hours, minutes, timezone)
// 	}

// 	static now(timezone?: TimeZone): MyDateTime {
// 		const now = new Date()
// 		const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
// 		return new MyDateTime(now.getFullYear(), now.getMonth() + 1, now.getDate(), now.getHours(), now.getMinutes(), tz)
// 	}
// }

// // #endregion DateTime



// ////////////
// /// MyDate ///
// ////////////
// // #region Data

// class MyDate {
// 	protected _jsDate: Date
// 	private _year: number
// 	private _month: number
// 	private _day: number

// 	private static _monthNames = [
// 		'January', 'February', 'March', 'April', 'May', 'June',
// 		'July', 'August', 'September', 'October', 'November', 'December'
// 	]

// 	private constructor(year: number, month: number, day: number) {
// 		this._year = year
// 		this._month = month
// 		this._day = day
// 		this._jsDate = new Date(year, month - 1, day)
// 	}

// 	get year(): number { return this._year }
// 	get month(): number { return this._month }
// 	get day(): number { return this._day }
// 	get string(): string {
// 		const yyyy = this._year.toString().padStart(4, '0')
// 		const mm = this._month.toString().padStart(2, '0')
// 		const dd = this._day.toString().padStart(2, '0')
// 		return `${yyyy}-${mm}-${dd}`
// 	}

// 	toString(): string {
// 		return this.string
// 	}

// 	toRepr(): string {
// 		return `MyDate(${this._year}, ${this._month}, ${this._day})`
// 	}

// 	format(pattern: string): string {
// 		if (pattern.includes('YYYY')) {
// 			pattern = pattern.replace('YYYY', this._year.toString().padStart(4, '0'))
// 		} else if (pattern.includes('YY')) {
// 			pattern = pattern.replace('YY', (this._year % 100).toString().padStart(2, '0'))
// 		}

// 		if (pattern.includes('MMMM')) {
// 			pattern = pattern.replace('MMMM', MyDate._monthNames[this._month - 1])
// 		} else if (pattern.includes('MMM')) {
// 			pattern = pattern.replace('MMM', MyDate._monthNames[this._month - 1].substring(0, 3))
// 		} else if (pattern.includes('MM')) {
// 			pattern = pattern.replace('MM', this._month.toString().padStart(2, '0'))
// 		} else if (pattern.includes('M')) {
// 			pattern = pattern.replace('M', this._month.toString())
// 		}

// 		if (pattern.includes('DD')) {
// 			pattern = pattern.replace('DD', this._day.toString().padStart(2, '0'))
// 		} else if (pattern.includes('Do')) {
// 			const suffix = this._day % 10 === 1 && this._day !== 11 ? 'st' :
// 				this._day % 10 === 2 && this._day !== 12 ? 'nd' :
// 					this._day % 10 === 3 && this._day !== 13 ? 'rd' : 'th'
// 			pattern = pattern.replace('Do', this._day.toString() + suffix)
// 		} else if (pattern.includes('D')) {
// 			pattern = pattern.replace('D', this._day.toString())
// 		}

// 		if (pattern.includes('wwww')) {
// 			pattern = pattern.replace('www', DayOfWeek.fromDate(this).name)
// 		} else if (pattern.includes('www')) {
// 			pattern = pattern.replace('www', DayOfWeek.fromDate(this).shortName)
// 		} else if (pattern.includes('ww')) {
// 			pattern = pattern.replace('ww', DayOfWeek.fromDate(this).value.toString().padStart(2, '0'))
// 		} else if (pattern.includes('w')) {
// 			pattern = pattern.replace('w', DayOfWeek.fromDate(this).value.toString())
// 		}

// 		return pattern
// 	}

// 	addDays(days: number): MyDate {
// 		this._jsDate.setDate(this._jsDate.getDate() + days)
// 		return new MyDate(this._jsDate.getFullYear(), this._jsDate.getMonth() + 1, this._jsDate.getDate())
// 	}
// 	addMonths(months: number): MyDate {
// 		this._jsDate.setMonth(this._jsDate.getMonth() + months)
// 		return new MyDate(this._jsDate.getFullYear(), this._jsDate.getMonth() + 1, this._jsDate.getDate())
// 	}
// 	addYears(years: number): MyDate {
// 		this._jsDate.setFullYear(this._jsDate.getFullYear() + years)
// 		return new MyDate(this._jsDate.getFullYear(), this._jsDate.getMonth() + 1, this._jsDate.getDate())
// 	}
// 	addWeeks(weeks: number): MyDate {
// 		return this.addDays(weeks * 7)
// 	}

// 	daysBetween(other: MyDate): number {
// 		const diffTime = Math.abs(other._jsDate.getTime() - this._jsDate.getTime())
// 		return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
// 	}
// 	/**
// 	 * Calculates the number of weeks between this MyDate and another MyDate.
// 	 * 
// 	 * @param other The other MyDate to compare with.
// 	 * @returns The number of weeks between the two dates.
// 	 */
// 	weeksBetween(other: MyDate): number {
// 		return Math.floor(this.daysBetween(other) / 7)
// 	}
// 	/** Calculates the number of months between this MyDate and another MyDate.
// 	 * 
// 	 * @param other The other MyDate to compare with.
// 	 * @returns The number of months between the two dates.
// 	 */
// 	monthsBetween(other: MyDate): number {
// 		const yearDiff = other._year - this._year
// 		const monthDiff = other._month - this._month
// 		const totalMonths = yearDiff * 12 + monthDiff
// 		const thisJsDate = this._jsDate
// 		const otherJsDate = other._jsDate
// 		const thisEndOfMonth = new Date(this._year, this._month, 0)
// 		const daysInThisMonth = thisEndOfMonth.getDate()
// 		const daysBetween = Math.abs(otherJsDate.getTime() - thisJsDate.getTime()) / (1000 * 60 * 60 * 24)
// 		const fractionalMonth = daysBetween / daysInThisMonth
// 		return totalMonths + fractionalMonth
// 	}
// 	/** Calculates the number of years between this MyDate and another MyDate.
// 	 * 
// 	 * @param other The other MyDate to compare with.
// 	 * @returns The number of years between the two dates.
// 	 */
// 	yearsBetween(other: MyDate): number {
// 		return this.monthsBetween(other) / 12
// 	}

// 	/** Checks if this MyDate is before another MyDate.
// 	 * 
// 	 * @param other The other MyDate to compare with.
// 	 * @param inclusive If true, returns true when dates are equal.
// 	 * @returns True if this MyDate is before (or equal to, if inclusive) the other MyDate.
// 	 */
// 	isBefore(other: MyDate, inclusive: boolean = false): boolean {
// 		return inclusive ? this < other : this <= other
// 	}
// 	/** Checks if this MyDate is after another MyDate.
// 	 * 
// 	 * @param other The other MyDate to compare with.
// 	 * @param inclusive If true, returns true when dates are equal.
// 	 * @returns True if this MyDate is after (or equal to, if inclusive) the other MyDate.
// 	 */
// 	isAfter(other: MyDate, inclusive: boolean = false): boolean {
// 		return inclusive ? this > other : this >= other
// 	}
// 	/** Checks if this MyDate is equal to another MyDate. 
// 	 * 
// 	 * @param other The other MyDate to compare with.
// 	 * @returns True if dates are equal. 
// 	 */
// 	isEqual(other: MyDate): boolean {
// 		return this == other
// 	}

// 	/** Returns numeric value for the MyDate for comparison operators. */
// 	valueOf(): number {
// 		return this._jsDate.valueOf()
// 	}

// 	static new(year: number, month: number, day: number): MyDate {
// 		return new MyDate(year, month, day)
// 	}

// 	static parse(dateString: string): MyDate {
// 		const [yyyyStr, mmStr, ddStr] = dateString.split('-')
// 		const year = parseInt(yyyyStr, 10)
// 		const month = parseInt(mmStr, 10)
// 		const day = parseInt(ddStr, 10)
// 		return new MyDate(year, month, day)
// 	}

// 	static today(): MyDate {
// 		const now = new Date()
// 		return new MyDate(now.getFullYear(), now.getMonth() + 1, now.getDate())
// 	}
// }

// // #endregion Data



// ////////////
// /// TIME ///
// ////////////
// // #region Time

// class Time {
// 	protected _jsDate: Date
// 	private _hours: number
// 	private _minutes: number

// 	private constructor(hours: number, minutes: number) {
// 		this._hours = hours
// 		this._minutes = minutes
// 		this._jsDate = new Date(1970, 0, 1, hours, minutes, 0, 0)
// 	}

// 	get hours(): number { return this._hours }
// 	get minutes(): number { return this._minutes }
// 	get string(): string {
// 		const hh = this._hours.toString().padStart(2, '0')
// 		const mm = this._minutes.toString().padStart(2, '0')
// 		return `${hh}:${mm}`
// 	}

// 	toString(): string {
// 		return this.string
// 	}

// 	toRepr(): string {
// 		return `Time(${this._hours}, ${this._minutes})`
// 	}

// 	format(pattern: string): string {
// 		if (pattern.includes('HH')) {
// 			pattern = pattern.replace('HH', this._hours.toString().padStart(2, '0'))
// 		} else if (pattern.includes('H')) {
// 			pattern = pattern.replace('H', this._hours.toString())
// 		}

// 		if (pattern.includes('hh')) {
// 			pattern = pattern.replace('hh', (this._hours % 12 || 12).toString().padStart(2, '0'))
// 		} else if (pattern.includes('h')) {
// 			pattern = pattern.replace('h', (this._hours % 12 || 12).toString())
// 		}

// 		if (pattern.includes('mm')) {
// 			pattern = pattern.replace('mm', this._minutes.toString().padStart(2, '0'))
// 		} else if (pattern.includes('m')) {
// 			pattern = pattern.replace('m', this._minutes.toString())
// 		}

// 		if (pattern.includes('A')) {
// 			pattern = pattern.replace('A', this._hours >= 12 ? 'PM' : 'AM')
// 		} else if (pattern.includes('a')) {
// 			pattern = pattern.replace('a', this._hours >= 12 ? 'pm' : 'am')
// 		}

// 		return pattern
// 	}

// 	/** Checks if this time is before another time.
// 	 * @param other The other time to compare with.
// 	 * @param inclusive If true, returns true when times are equal.
// 	 * @returns True if this time is before (or equal to, if inclusive) the other time.
// 	 */
// 	isBefore(other: Time, inclusive: boolean = false): boolean {
// 		if (this._hours < other._hours) return true
// 		if (this._hours > other._hours) return false
// 		if (this._minutes < other._minutes) return true
// 		if (inclusive && this._minutes === other._minutes) return true
// 		return false
// 	}

// 	/** Checks if this time is after another time.
// 	 * @param other The other time to compare with.
// 	 * @param inclusive If true, returns true when times are equal.
// 	 * @returns True if this time is after (or equal to, if inclusive) the other time.
// 	 */
// 	isAfter(other: Time, inclusive: boolean = false): boolean {
// 		if (this._hours > other._hours) return true
// 		if (this._hours < other._hours) return false
// 		if (this._minutes > other._minutes) return true
// 		if (inclusive && this._minutes === other._minutes) return true
// 		return false
// 	}

// 	/** Checks if this time is equal to another time.
// 	 * @param other The other time to compare with.
// 	 * @returns True if times are equal.
// 	 */
// 	isEqual(other: Time): boolean {
// 		return this._hours === other._hours && this._minutes === other._minutes
// 	}

// 	/** Returns numeric value for comparison operators.
// 	 * Enables using <, >, <=, >= operators which will call isBefore/isAfter.
// 	 * @returns A numeric representation of the time (minutes since midnight).
// 	 */
// 	valueOf(): number {
// 		return this._jsDate.valueOf()
// 	}

// 	static new(hours: number, minutes: number): Time {
// 		return new Time(hours, minutes)
// 	}

// 	static parse(timeString: string): Time {
// 		const [hhStr, mmStr] = timeString.split(':')
// 		const hours = parseInt(hhStr, 10)
// 		const minutes = parseInt(mmStr, 10)
// 		return new Time(hours, minutes)
// 	}

// 	static now(): Time {
// 		const now = new Date()
// 		return new Time(now.getHours(), now.getMinutes())
// 	}
// }

// // #endregion Time



// /////////////////
// /// TIME ZONE ///
// /////////////////
// // #region Time Zone

// class TimeZone {
// 	private _name: string
// 	private _offset: number

// 	private constructor(name: string) {
// 		this._name = name
// 		this._offset = TimeZone.calculateOffset(name)
// 	}

// 	get name(): string { return this._name }
// 	get offset(): number { return this._offset }
// 	get string(): string {
// 		const sign = this._offset >= 0 ? '+' : '-'
// 		const absOffset = Math.abs(this._offset)
// 		const hours = Math.floor(absOffset)
// 		const minutes = Math.round((absOffset - hours) * 60)
// 		const hh = hours.toString().padStart(2, '0')
// 		const mm = minutes.toString().padStart(2, '0')
// 		return `UTC${sign}${hh}:${mm}`
// 	}

// 	toString(): string {
// 		return this.string
// 	}

// 	toRepr(): string {
// 		return `TimeZone('${this._name}')`
// 	}



// 	/** Calculates the UTC offset in hours for a given time zone name.
// 	 * 
// 	 * @param name The time zone name (e.g., "UTC", "America/New_York", "UTC-05:00").
// 	 * @param referenceDate Optional date to calculate offset for (handles DST).
// 	 * @returns The offset in hours from UTC.
// 	 */
// 	static calculateOffset(name: string, referenceDate?: Date): number {
// 		// Handle simple cases
// 		if (name === 'UTC' || name === 'GMT' || name === 'Z') {
// 			return 0
// 		}

// 		// Handle UTC±HH:MM format
// 		const offsetMatch = name.match(/^UTC([+-]?)(\d{1,2})(?::?(\d{2}))?$/)
// 		if (offsetMatch) {
// 			const sign = offsetMatch[1] === '-' ? -1 : 1
// 			const hours = parseInt(offsetMatch[2], 10)
// 			const minutes = offsetMatch[3] ? parseInt(offsetMatch[3], 10) : 0
// 			return sign * (hours + minutes / 60)
// 		}

// 		// For IANA time zones: get actual offset by comparing UTC vs local time
// 		try {
// 			const date = referenceDate || new Date()

// 			// Format the same date in UTC and in the target timezone
// 			const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }))
// 			const tzDate = new Date(date.toLocaleString('en-US', { timeZone: name }))

// 			// Calculate offset in hours
// 			const offsetMs = tzDate.getTime() - utcDate.getTime()
// 			return offsetMs / (1000 * 60 * 60)
// 		} catch (error) {
// 			console.warn(`Unable to calculate offset for timezone: ${name}`)
// 			return 0
// 		}
// 	}

// 	// get name(): TimeZone { return this._name }
// 	// get offset(): number {
// 	// 	const now = new Date()
// 	// 	const options: Intl.DateTimeFormatOptions = { timeZone: this._name, timeZoneName: 'short' }
// 	// 	const formatter = new Intl.DateTimeFormat([], options)
// 	// 	const parts = formatter.formatToParts(now)
// 	// 	const timeZonePart = parts.find(part => part.type === 'timeZoneName')
// 	// 	if (timeZonePart) {
// 	// 		const match = timeZonePart.value.match(/GMT([+-]\d{1,2})(?::?(\d{2}))?/)
// 	// 		if (match) {
// 	// 			const hours = parseInt(match[1], 10)
// 	// 			const minutes = match[2] ? parseInt(match[2], 10) : 0
// 	// 			return hours + minutes / 60
// 	// 		}
// 	// 	}
// 	// 	return 0
// 	// }
// 	// get offsetString(): string {
// 	// 	const offsetHours = Math.floor(this.offset)
// 	// 	const offsetMinutes = Math.round((this.offset - offsetHours) * 60)
// 	// 	const sign = offsetHours >= 0 ? '+' : '-'
// 	// 	const hh = Math.abs(offsetHours).toString().padStart(2, '0')
// 	// 	const mm = Math.abs(offsetMinutes).toString().padStart(2, '0')
// 	// 	return `${sign}${hh}:${mm}`
// 	// }

// 	// format(pattern: string): string {
// 	// 	if (pattern.includes('TZ')) {
// 	// 		pattern = pattern.replace('TZ', this._name)
// 	// 	} else if (pattern.includes('OS')) {
// 	// 		pattern = pattern.replace('OS', this.offsetString)
// 	// 	} else if (pattern.includes('os')) {
// 	// 		pattern = pattern.replace('os', this.offset.toString())
// 	// 	}

// 	// 	return pattern
// 	// }

// 	// static fromName(name: string): TimeZone {
// 	// 	name = name.trim()

// 	// 	if (name === 'UTC' || name === 'GMT' || name === 'Z') {
// 	// 		return new TimeZone('UTC')
// 	// 	}

// 	// 	const offsetMatch = name.match(/^([+-]?)(\d{1,2})(?::?(\d{2}))?$/)
// 	// 	if (offsetMatch) {
// 	// 		const sign = offsetMatch[1] === '-' ? -1 : 1
// 	// 		const hours = parseInt(offsetMatch[2], 10)
// 	// 		const minutes = offsetMatch[3] ? parseInt(offsetMatch[3], 10) : 0
// 	// 		const totalOffset = sign * (hours + minutes / 60)
// 	// 		const offsetString = `UTC${totalOffset >= 0 ? '+' : ''}${totalOffset}`
// 	// 		return new TimeZone(offsetString)
// 	// 	}

// 	// 	return new TimeZone(name)
// 	// }

// 	// static local(): TimeZone {
// 	// 	const now = new Date()
// 	// 	const options: Intl.DateTimeFormatOptions = { timeZoneName: 'short' }
// 	// 	const formatter = new Intl.DateTimeFormat([], options)
// 	// 	const parts = formatter.formatToParts(now)
// 	// 	const timeZonePart = parts.find(part => part.type === 'timeZoneName')
// 	// 	if (timeZonePart) {
// 	// 		const match = timeZonePart.value.match(/GMT([+-]\d{1,2})(?::?(\d{2}))?/)
// 	// 		if (match) {
// 	// 			const hours = parseInt(match[1], 10)
// 	// 			const minutes = match[2] ? parseInt(match[2], 10) : 0
// 	// 			const offset = hours + minutes / 60
// 	// 			// Note: This does not give the IANA time zone name, but we can return a TimeZone with offset info.
// 	// 			return new TimeZone(`UTC${hours >= 0 ? '+' : ''}${hours}${minutes ? `:${minutes.toString().padStart(2, '0')}` : ''}`)
// 	// 		}
// 	// 	}
// 	// 	return new TimeZone('UTC')
// 	// }
// }

// // #endregion Time Zone



// ///////////////////
// /// DAY OF WEEK ///
// ///////////////////
// // #region Day of Week

// class DayOfWeek {
// 	static Sunday: DayOfWeek = new DayOfWeek(0)
// 	static Monday: DayOfWeek = new DayOfWeek(1)
// 	static Tuesday: DayOfWeek = new DayOfWeek(2)
// 	static Wednesday: DayOfWeek = new DayOfWeek(3)
// 	static Thursday: DayOfWeek = new DayOfWeek(4)
// 	static Friday: DayOfWeek = new DayOfWeek(5)
// 	static Saturday: DayOfWeek = new DayOfWeek(6)

// 	private constructor(private _value: number) { }

// 	get value(): number { return this._value }

// 	get name(): string {
// 		switch (this._value) {
// 			case 0: return 'Sunday'
// 			case 1: return 'Monday'
// 			case 2: return 'Tuesday'
// 			case 3: return 'Wednesday'
// 			case 4: return 'Thursday'
// 			case 5: return 'Friday'
// 			case 6: return 'Saturday'
// 			default: return 'Unknown'
// 		}
// 	}

// 	get shortName(): string {
// 		return this.name.substring(0, 3)
// 	}

// 	get abrv(): string {
// 		return this.name.substring(0, 2)
// 	}

// 	static fromValue(value: number): DayOfWeek | null {
// 		switch (value) {
// 			case 0: return DayOfWeek.Sunday
// 			case 1: return DayOfWeek.Monday
// 			case 2: return DayOfWeek.Tuesday
// 			case 3: return DayOfWeek.Wednesday
// 			case 4: return DayOfWeek.Thursday
// 			case 5: return DayOfWeek.Friday
// 			case 6: return DayOfWeek.Saturday
// 			default: return null
// 		}
// 	}

// 	static fromDate(MyDate: MyDate): DayOfWeek {
// 		const jsDate = new Date(MyDate.year, MyDate.month - 1, MyDate.day)
// 		return DayOfWeek.fromValue(jsDate.getDay())!
// 	}

// 	static fromName(name: string): DayOfWeek | null {
// 		name = name.trim().toLowerCase()

// 		if (['sunday', 'sun', 'su'].includes(name)) return DayOfWeek.Sunday
// 		if (['monday', 'mon', 'mo'].includes(name)) return DayOfWeek.Monday
// 		if (['tuesday', 'tue', 'tu'].includes(name)) return DayOfWeek.Tuesday
// 		if (['wednesday', 'wed', 'we'].includes(name)) return DayOfWeek.Wednesday
// 		if (['thursday', 'thu', 'th'].includes(name)) return DayOfWeek.Thursday
// 		if (['friday', 'fri', 'fr'].includes(name)) return DayOfWeek.Friday
// 		if (['saturday', 'sat', 'sa'].includes(name)) return DayOfWeek.Saturday
// 		return null
// 	}
// }

// // #endregion Day of Week