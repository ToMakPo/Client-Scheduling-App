import { Queryable, Ranged } from "../lib/customUtilityTypes"
import { MyDate, MyTime } from "../lib/myDates"
import { UUID } from "../lib/utils"
import Location from "./location"

export interface LocationSpecialHoursInfo {
	/** The unique identifier for the location associated with the special hours. */
	locationId: UUID
	/** The date in "YYYY-MM-DD" format. */
	date: MyDate
	/** The start time in "HH:MM" format (24-hour clock). */
	startTime: MyTime
	/** The end time in "HH:MM" format (24-hour clock). */
	endTime: MyTime
	/** The reason for the special hours. */
	reason: 'Holiday' | 'Maintenance' | 'Staff Training' | (string & {})
}

export type LocationSpecialHoursInit = LocationSpecialHoursInfo

export type LocationSpecialHoursFilter = Partial<Queryable<Ranged<LocationSpecialHoursInfo, 'date' | 'startTime' | 'endTime'>, 'locationId' | 'date'>>

class LocationSpecialHours {
	private _locationId = null as unknown as LocationSpecialHoursInfo['locationId']
	private _date = null as unknown as LocationSpecialHoursInfo['date']
	private _startTime = null as unknown as LocationSpecialHoursInfo['startTime']
	private _endTime = null as unknown as LocationSpecialHoursInfo['endTime']
	private _reason = null as unknown as LocationSpecialHoursInfo['reason']
	/** Creates a new LocationSpecialHours instance.
	 * 
	 * @param props Location special hours properties.
	 * - `locationId`: `string` - The location id associated with the special hours.
	 * - `date`: `string` - The date in "YYYY-MM-DD" format.
	 * - `startTime`: `string` - The start time in "HH:MM" format (24-hour clock).
	 * - `endTime`: `string` - The end time in "HH:MM" format (24-hour clock).
	 * - `reason`: `string` - The reason for the special hours.
	 */
	constructor(props: LocationSpecialHoursInit) {
		this._locationId = props.locationId
		this._date = props.date
		this._startTime = props.startTime
		this._endTime = props.endTime
		this._reason = props.reason
	}

	/** The location id. */
	get locationId(): LocationSpecialHoursInfo['locationId'] { return this._locationId }

	/** Get the location. */
	async getLocation(): Promise<Location | null> {
		return await Location.find({ id: this._locationId }).then(locations => locations.length ? locations[0] : null)
	}

	/** The date in "YYYY-MM-DD" format. */
	get date(): LocationSpecialHoursInfo['date'] { return this._date }
	set date(value: LocationSpecialHoursInit['date']) { this._date = value }

	/** The start time in "HH:MM" format (24-hour clock). */
	get startTime(): LocationSpecialHoursInfo['startTime'] { return this._startTime }
	set startTime(value: LocationSpecialHoursInit['startTime']) { this._startTime = value }

	/** The end time in "HH:MM" format (24-hour clock). */
	get endTime(): LocationSpecialHoursInfo['endTime'] { return this._endTime }
	set endTime(value: LocationSpecialHoursInit['endTime']) { this._endTime = value }

	/** The reason for the special hours. */
	get reason(): LocationSpecialHoursInfo['reason'] { return this._reason }
	set reason(value: LocationSpecialHoursInit['reason']) { this._reason = value }

	/** Find location special hours based on filter criteria. 
	 * 
	 * @param filters Values to filter location special hours by.
	 * - `locationId`: `string | string[]` - location id(s).
	 * - `date`: `string | string[]` - exact date(s) in "YYYY-MM-DD" format.
	 * - `minDate`: `string` - minimum date in "YYYY-MM-DD" format.
	 * - `maxDate`: `string` - maximum date in "YYYY-MM-DD" format.
	 * - `startTime`: `string` - exact start time in "HH:MM" format.
	 * - `minStartTime`: `string` - minimum start time in "HH:MM" format.
	 * - `maxStartTime`: `string` - maximum start time in "HH:MM" format.
	 * - `endTime`: `string` - exact end time in "HH:MM" format.
	 * - `minEndTime`: `string` - minimum end time in "HH:MM" format.
	 * - `maxEndTime`: `string` - maximum end time in "HH:MM" format.
	 * @returns An array of `LocationSpecialHours` instances matching the filter criteria.
	 * @note If no filters are provided, all location special hours will be returned.
	 */
	static async find(filters: LocationSpecialHoursFilter = {}): Promise<LocationSpecialHours[]> {
		// TODO: Implement actual data retrieval logic here.
		return [] as LocationSpecialHours[]
	}
}

export default LocationSpecialHours