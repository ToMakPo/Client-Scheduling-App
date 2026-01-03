import { Queryable, Ranged, Replace } from "../lib/customUtilityTypes"
import { MyDayOfWeek, MyTime } from "../lib/myDates"
import { UUID } from "../lib/utils"
import Location from "./location"

export interface LocationNormalHoursInfo {
	/** The location id. */
	locationId: UUID
	/** The day of the week (0-6, where 0 = Sunday). */
	dayOfWeek: MyDayOfWeek
	/** The start time in "HH:MM" format (24-hour clock). */
	startTime: MyTime
	/** The end time in "HH:MM" format (24-hour clock). */
	endTime: MyTime
}

export type LocationNormalHoursInit = Replace<LocationNormalHoursInfo, { 
	dayOfWeek: number | MyDayOfWeek 
}>

export type LocationNormalHoursFilter = Partial<Queryable<Ranged<LocationNormalHoursInfo, 'startTime' | 'endTime' | 'dayOfWeek'>, 'locationId' | 'dayOfWeek'>>

class LocationNormalHours {
	private _locationId = null as unknown as LocationNormalHoursInfo['locationId']
	private _dayOfWeek = null as unknown as LocationNormalHoursInfo['dayOfWeek']
	private _startTime = null as unknown as LocationNormalHoursInfo['startTime']
	private _endTime = null as unknown as LocationNormalHoursInfo['endTime']

	/** Creates a new LocationNormalHours instance.
	 * 
	 * @param props Location normal hours properties.
	 * - `locationId`: `string` - The location id.
	 * - `dayOfWeek`: `DayOfWeek` - The day of the week (0-6, where 0 = Sunday) for the normal hours.
	 * - `startTime`: `string` - The start time in "HH:MM" format (24-hour clock).
	 * - `endTime`: `string` - The end time in "HH:MM" format (24-hour clock).
	 */
	constructor(props: LocationNormalHoursInit) {
		this._locationId = props.locationId
		this.dayOfWeek = props.dayOfWeek
		this.startTime = props.startTime
		this.endTime = props.endTime
	}

	/** The location id. */
	get locationId(): LocationNormalHoursInfo['locationId'] { return this._locationId }

	/** Get the location. */
	async getLocation(): Promise<Location | null> {
		return await Location.find({ id: this._locationId }).then(locations => locations.length ? locations[0] : null)
	}

	/** The day of the week (0-6, where 0 = Sunday) for the normal hours. */
	get dayOfWeek(): LocationNormalHoursInfo['dayOfWeek'] { return this._dayOfWeek }
	set dayOfWeek(value: LocationNormalHoursInit['dayOfWeek']) { this._dayOfWeek = MyDayOfWeek.get(value) }

	/** The start time in "HH:MM" format (24-hour clock). */
	get startTime(): LocationNormalHoursInfo['startTime'] { return this._startTime }
	set startTime(value: LocationNormalHoursInit['startTime']) { this._startTime = value }

	/** The end time in "HH:MM" format (24-hour clock). */
	get endTime(): LocationNormalHoursInfo['endTime'] { return this._endTime }
	set endTime(value: LocationNormalHoursInit['endTime']) { this._endTime = value }

	/** Find location normal hours based on filter criteria. 
	 * 
	 * @param filters Values to filter location normal hours by.
	 * - `locationId`: `string | string[]` - location id(s).
	 * - `dayOfWeek`: `number | number[]` - day(s) of the week (0-6, where 0 = Sunday).
	 * - `minDayOfWeek`: `number` - minimum day of the week (0-6, where 0 = Sunday).
	 * - `maxDayOfWeek`: `number` - maximum day of the week (0-6, where 0 = Sunday).
	 * - `startTime`: `string` - exact start time in "HH:MM" format.
	 * - `minStartTime`: `string` - minimum start time in "HH:MM" format.
	 * - `maxStartTime`: `string` - maximum start time in "HH:MM" format.
	 * - `endTime`: `string` - exact end time in "HH:MM" format.
	 * - `minEndTime`: `string` - minimum end time in "HH:MM" format.
	 * - `maxEndTime`: `string` - maximum end time in "HH:MM" format.
	 * @returns An array of `LocationNormalHours` instances matching the filter criteria.
	 * @note If no filters are provided, all location normal hours will be returned.
	 */
	static async find(filters: LocationNormalHoursFilter = {}): Promise<LocationNormalHours[]> {
		// TODO: Implement actual data retrieval logic here.
		return [] as LocationNormalHours[]
	}
}

export default LocationNormalHours