import { Queryable, Ranged } from "../lib/customUtilityTypes"
import { MyDate, MyTime } from "../lib/myDates"
import { UUID } from "../lib/utils"
import Provider from "./Provider"

export interface ProviderBlockedTimeInfo {
	/** The provider id associated with the blocked time. */
	providerId: UUID
	/** The date in "YYYY-MM-DD" format. */
	date: MyDate
	/** The start time in "HH:MM" format (24-hour clock). */
	startTime: MyTime
	/** The end time in "HH:MM" format (24-hour clock). */
	endTime: MyTime
	/** The reason for the blocked time. */
	reason: 'Personal' | 'Meeting' | (string & {})
}

export type ProviderBlockedTimeInit = ProviderBlockedTimeInfo

export type ProviderBlockedTimeFilter = Partial<Queryable<Ranged<ProviderBlockedTimeInfo, 'date' | 'startTime' | 'endTime'>, 'providerId' | 'date'>>

class ProviderBlockedTime {
	private _providerId = null as unknown as ProviderBlockedTimeInfo['providerId']
	private _date = null as unknown as ProviderBlockedTimeInfo['date']
	private _startTime = null as unknown as ProviderBlockedTimeInfo['startTime']
	private _endTime = null as unknown as ProviderBlockedTimeInfo['endTime']
	private _reason = null as unknown as ProviderBlockedTimeInfo['reason']

	/** Creates a new ProviderBlockedTime instance.
	 * 
	 * @param props Provider blocked time properties.
	 * - `providerId`: `string` - The provider id associated with the blocked time.
	 * - `date`: `string` - The date in "YYYY-MM-DD" format.
	 * - `startTime`: `string` - The start time in "HH:MM" format (24-hour clock).
	 * - `endTime`: `string` - The end time in "HH:MM" format (24-hour clock).
	 * - `reason`: `string` - The reason for the blocked time.
	 */
	constructor(props: ProviderBlockedTimeInit) {
		this._providerId = props.providerId
		this._date = props.date
		this._startTime = props.startTime
		this._endTime = props.endTime
		this._reason = props.reason
	}

	/** The provider id associated with the blocked time. */
	get providerId(): ProviderBlockedTimeInfo['providerId'] { return this._providerId }

	/** Get the provider associated with the blocked time. */
	async getProvider(): Promise<Provider | null> {
		return await Provider.find({ id: this._providerId }).then(providers => providers.length ? providers[0] : null)
	}

	/** The date in "YYYY-MM-DD" format. */
	get date(): ProviderBlockedTimeInfo['date'] { return this._date }
	set date(value: ProviderBlockedTimeInit['date']) { this._date = value }

	/** The start time in "HH:MM" format (24-hour clock). */
	get startTime(): ProviderBlockedTimeInfo['startTime'] { return this._startTime }
	set startTime(value: ProviderBlockedTimeInit['startTime']) { this._startTime = value }

	/** The end time in "HH:MM" format (24-hour clock). */
	get endTime(): ProviderBlockedTimeInfo['endTime'] { return this._endTime }
	set endTime(value: ProviderBlockedTimeInit['endTime']) { this._endTime = value }

	/** The reason for the blocked time. */
	get reason(): ProviderBlockedTimeInfo['reason'] { return this._reason }
	set reason(value: ProviderBlockedTimeInit['reason']) { this._reason = value }

	/** Find provider blocked time based on filter criteria. 
	 * 
	 * @param filters Values to filter provider blocked time by.
	 * - `providerId`: `string | string[]` - provider id(s).
	 * - `date`: `string | string[]` - exact date(s) in "YYYY-MM-DD" format.
	 * - `minDate`: `string` - minimum date in "YYYY-MM-DD" format.
	 * - `maxDate`: `string` - maximum date in "YYYY-MM-DD" format.
	 * - `startTime`: `string` - exact start time in "HH:MM" format.
	 * - `minStartTime`: `string` - minimum start time in "HH:MM" format.
	 * - `maxStartTime`: `string` - maximum start time in "HH:MM" format.
	 * - `endTime`: `string` - exact end time in "HH:MM" format.
	 * - `minEndTime`: `string` - minimum end time in "HH:MM" format.
	 * - `maxEndTime`: `string` - maximum end time in "HH:MM" format.
	 * @returns An array of `ProviderBlockedTime` instances matching the filter criteria.
	 * 
	 * @note If no filters are provided, all provider blocked time will be returned.
	 */
	static async find(filters: ProviderBlockedTimeFilter = {}) {
		// TODO: Implement actual data retrieval logic here.
		return [] as ProviderBlockedTime[]
	}
}

export default ProviderBlockedTime