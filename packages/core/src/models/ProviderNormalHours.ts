import { Queryable, Ranged, Replace } from "../lib/customUtilityTypes"
import { MyDayOfWeek, MyTime } from "../lib/myDates"
import { UUID } from "../lib/utils"
import Provider from "./Provider"

export interface ProviderNormalHoursInfo {
	/** The provider id associated with the normal hours. */
	providerId: UUID
	/** The day of the week (0-6, where 0 = Sunday) . */
	dayOfWeek: MyDayOfWeek
	/** The start time  in "HH:MM" format (24-hour clock). */
	startTime: MyTime
	/** The end time  in "HH:MM" format (24-hour clock). */
	endTime: MyTime
}

export type ProviderNormalHoursInit = Replace<ProviderNormalHoursInfo, { 
	dayOfWeek: number | MyDayOfWeek 
}>

export type ProviderNormalHoursFilter = Partial<Queryable<Ranged<ProviderNormalHoursInfo, 'startTime' | 'endTime' | 'dayOfWeek'>, 'providerId' | 'dayOfWeek'>>

class ProviderNormalHours {
	private _providerId = null as unknown as ProviderNormalHoursInfo['providerId']
	private _dayOfWeek = null as unknown as ProviderNormalHoursInfo['dayOfWeek']
	private _startTime = null as unknown as ProviderNormalHoursInfo['startTime']
	private _endTime = null as unknown as ProviderNormalHoursInfo['endTime']

	/** Creates a new ProviderNormalHours instance.
	 * 
	 * @param props Provider normal hours properties.
	 * - `providerId`: `string` - The provider id associated with the normal hours.
	 * - `dayOfWeek`: `MyDayOfWeek` - The day of the week (0-6, where 0 = Sunday).
	 * - `startTime`: `string` - The start time  in "HH:MM" format (24-hour clock).
	 * - `endTime`: `string` - The end time  in "HH:MM" format (24-hour clock).
	 */
	constructor(props: ProviderNormalHoursInit) {
		this._providerId = props.providerId
		this.dayOfWeek = props.dayOfWeek
		this.startTime = props.startTime
		this.endTime = props.endTime
	}

	/** The provider id associated with the normal hours. */
	get providerId(): ProviderNormalHoursInfo['providerId'] { return this._providerId }

	/** Get the provider associated with the normal hours. */
	async getProvider(): Promise<Provider | null> {
		return await Provider.find({ id: this._providerId }).then(providers => providers.length ? providers[0] : null)
	}

	/** The day of the week (0-6, where 0 = Sunday) . */
	get dayOfWeek(): ProviderNormalHoursInfo['dayOfWeek'] { return this._dayOfWeek }
	set dayOfWeek(value: ProviderNormalHoursInit['dayOfWeek']) { this._dayOfWeek = MyDayOfWeek.get(value) }

	/** The start time  in "HH:MM" format (24-hour clock). */
	get startTime(): MyTime { return this._startTime }
	set startTime(value: MyTime) { this._startTime = value }

	/** The end time  in "HH:MM" format (24-hour clock). */
	get endTime(): MyTime { return this._endTime }
	set endTime(value: MyTime) { this._endTime = value }

	/** Find provider normal hours based on filter criteria. 
	 * 
	 * @param filters Values to filter provider normal hours by.
	 * - `providerId`: `string | string[]` - provider id(s).
	 * - `dayOfWeek`: `number | number[]` - day(s) of the week (0-6, where 0 = Sunday).
	 * - `minDayOfWeek`: `number` - minimum day of the week (0-6, where 0 = Sunday).
	 * - `maxDayOfWeek`: `number` - maximum day of the week (0-6, where 0 = Sunday).
	 * - `startTime`: `string` - exact start time in "HH:MM" format.
	 * - `minStartTime`: `string` - minimum start time in "HH:MM" format.
	 * - `maxStartTime`: `string` - maximum start time in "HH:MM" format.
	 * - `endTime`: `string` - exact end time in "HH:MM" format.
	 * - `minEndTime`: `string` - minimum end time in "HH:MM" format.
	 * - `maxEndTime`: `string` - maximum end time in "HH:MM" format.
	 * @returns An array of `ProviderNormalHours` instances matching the filter criteria.
	 * @note If no filters are provided, all provider normal hours will be returned.
	 */
	static async find(filters: ProviderNormalHoursFilter = {}) {
		// TODO: Implement actual data retrieval logic here.
		return [] as ProviderNormalHours[]
	}
}

export default ProviderNormalHours