import { Queryable, Ranged } from "../lib/customUtilityTypes"
import { MyDate, MyTime } from "../lib/myDates"
import { UUID } from "../lib/utils"
import Provider from "./Provider"

export interface ProviderSpecialHoursInfo {
	/** The provider id associated with the special hours. */
	providerId: UUID
	/** The date in "YYYY-MM-DD" format. */
	date: MyDate
	/** The start time in "HH:MM" format (24-hour clock). */
	startTime: MyTime
	/** The end time in "HH:MM" format (24-hour clock). */
	endTime: MyTime
	/** The reason for the special hours. */
	reason: 'Holiday' | 'PTO' | 'Conference' | (string & {})
}

export type ProviderSpecialHoursInit = ProviderSpecialHoursInfo

export type ProviderSpecialHoursFilter = Partial<Queryable<Ranged<ProviderSpecialHoursInfo, 'date' | 'startTime' | 'endTime'>, 'providerId' | 'date'>>

class ProviderSpecialHours {
	private _providerId = null as unknown as ProviderSpecialHoursInfo['providerId']
	private _date = null as unknown as ProviderSpecialHoursInfo['date']
	private _startTime = null as unknown as ProviderSpecialHoursInfo['startTime']
	private _endTime = null as unknown as ProviderSpecialHoursInfo['endTime']
	private _reason = null as unknown as ProviderSpecialHoursInfo['reason']

	/** Creates a new ProviderSpecialHours instance.
	 * 
	 * @param props Provider special hours properties.
	 * - `providerId`: `string` - The provider id associated with the special hours.
	 * - `date`: `string` - The date in "YYYY-MM-DD" format.
	 * - `startTime`: `string` - The start time in "HH:MM" format (24-hour clock).
	 * - `endTime`: `string` - The end time in "HH:MM" format (24-hour clock).
	 * - `reason`: `string` - The reason for the special hours.
	 */
	constructor(props: ProviderSpecialHoursInit) {
		this._providerId = props.providerId
		this.date = props.date
		this.startTime = props.startTime
		this.endTime = props.endTime
		this.reason = props.reason
	}

	/** The provider id associated with the special hours. */
	get providerId(): UUID { return this._providerId }

	/** Get the provider associated with the special hours. */
	async getProvider(): Promise<Provider | null> {
		return await Provider.find({ id: this._providerId }).then(providers => providers.length ? providers[0] : null)
	}

	/** The date in "YYYY-MM-DD" format. */
	get date(): ProviderSpecialHoursInfo['date'] { return this._date }
	set date(value: ProviderSpecialHoursInit['date']) { this._date = value }

	/** The start time in "HH:MM" format (24-hour clock). */
	get startTime(): ProviderSpecialHoursInfo['startTime'] { return this._startTime }
	set startTime(value: ProviderSpecialHoursInit['startTime']) { this._startTime = value }

	/** The end time in "HH:MM" format (24-hour clock). */
	get endTime(): ProviderSpecialHoursInfo['endTime'] { return this._endTime }
	set endTime(value: ProviderSpecialHoursInit['endTime']) { this._endTime = value }

	/** The reason for the special hours. */
	get reason(): ProviderSpecialHoursInfo['reason'] { return this._reason }
	set reason(value: ProviderSpecialHoursInit['reason']) { this._reason = value }

	/** Find provider special hours based on filter criteria. 
	 * 
	 * @param filters Values to filter provider special hours by.
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
	 * @returns An array of `ProviderSpecialHours` instances matching the filter criteria.
	 * @note If no filters are provided, all provider special hours will be returned.
	 */
	static async find(filters: ProviderSpecialHoursFilter = {}) {
		// TODO: Implement actual data retrieval logic here.
		return [] as ProviderSpecialHours[]
	}
}

export default ProviderSpecialHours