import { Optional, Queryable, Ranged, Replace } from "../lib/customUtilityTypes"
import { MyDate, MyTime } from "../lib/myDates"
import { NoteEntry, Notes, UUID } from "../lib/utils"
import Client from "./Client"
import Location from "./location"
import Provider from "./Provider"
import Service from "./Service"

export interface AppointmentInfo {
	/** The unique identifier for the appointment. */
	id: UUID
	/** The client id associated with the appointment. */
	clientId: UUID
	/** The provider id associated with the appointment. */
	providerId: UUID
	/** The location id associated with the appointment. */
	locationId: UUID
	/** The service id associated with the appointment. */
	serviceId: UUID
	/** The date of the appointment in "YYYY-MM-DD" format. */
	date: MyDate
	/** The start time of the appointment in "HH:MM" format (24-hour clock). */
	startTime: MyTime
	/** The end time of the appointment in "HH:MM" format (24-hour clock). */
	endTime: MyTime
	/** The agreed upon price of the service for the appointment. */
	price: number
	/** The status of the appointment. */
	status: 'scheduled' | 'completed' | 'canceled' | 'no-show' | (string & {})
	/** Additional notes about the appointment. */
	notes: Notes
}

export type AppointmentInit = Optional<Replace<AppointmentInfo, { notes: string | NoteEntry[] | Notes }>, 'id' | 'status' | 'notes'>

export type AppointmentFilter = Partial<Queryable<Ranged<AppointmentInfo, 'startTime' | 'endTime' | 'date' | 'price'>, 'id' | 'clientId' | 'providerId' | 'locationId' | 'serviceId' | 'date' | 'status'>>

class Appointment {
	private _id = null as unknown as AppointmentInfo['id']
	private _clientId = null as unknown as AppointmentInfo['clientId']
	private _providerId = null as unknown as AppointmentInfo['providerId']
	private _locationId = null as unknown as AppointmentInfo['locationId']
	private _serviceId = null as unknown as AppointmentInfo['serviceId']
	private _date = null as unknown as AppointmentInfo['date']
	private _startTime = null as unknown as AppointmentInfo['startTime']
	private _endTime = null as unknown as AppointmentInfo['endTime']
	private _price = null as unknown as AppointmentInfo['price']
	private _status = null as unknown as AppointmentInfo['status']
	private _notes = null as unknown as AppointmentInfo['notes']

	/** Creates a new Appointment instance.
	 * 
	 * @param props Appointment properties.
	 * - `id`: `string` - The unique identifier for the appointment. If not provided, a unique id will be generated.
	 * - `clientId`: `string` - The client id associated with the appointment.
	 * - `providerId`: `string` - The provider id associated with the appointment.
	 * - `locationId`: `string` - The location id associated with the appointment.
	 * - `serviceId`: `string` - The service id associated with the appointment.
	 * - `date`: `string` - The date of the appointment in "YYYY-MM-DD" format.
	 * - `startTime`: `string` - The start time of the appointment in "HH:MM" format (24-hour clock).
	 * - `endTime`: `string` - The end time of the appointment in "HH:MM" format (24-hour clock).
	 * - `price`: `number` - The agreed upon price of the service for the appointment.
	 * - `status`: `string` - The status of the appointment.
	 * - `notes`: `string` - Additional notes about the appointment.
	 */
	constructor(props: AppointmentInit) {
		this._id = props.id || UUID.generate()
		this._clientId = props.clientId
		this.providerId = props.providerId
		this.locationId = props.locationId
		this.serviceId = props.serviceId
		this.date = props.date
		this.startTime = props.startTime
		this.endTime = props.endTime
		this.price = props.price
		this.status = props.status
		this.notes = props.notes
	}

	/** The unique identifier for the appointment. */
	get id(): AppointmentInfo['id'] { return this._id }

	/** The client id associated with the appointment. */
	get clientId(): AppointmentInfo['clientId'] { return this._clientId }

	/** Get the client associated with the appointment. */
	async getClient(): Promise<Client | null> {
		return await Client.find({ id: this._clientId }).then(clients => clients.length ? clients[0] : null)
	}

	/** The provider id associated with the appointment. */
	get providerId(): AppointmentInfo['providerId'] { return this._providerId }
	set providerId(value: AppointmentInit['providerId']) { this._providerId = value }

	/** Get the provider associated with the appointment. */
	async getProvider(): Promise<Provider | null> {
		return await Provider.find({ id: this._providerId }).then(providers => providers.length ? providers[0] : null)
	}

	/** The location id associated with the appointment. */
	get locationId(): AppointmentInfo['locationId'] { return this._locationId }
	set locationId(value: AppointmentInit['locationId']) { this._locationId = value }

	/** Get the location associated with the appointment. */
	async getLocation(): Promise<Location | null> {
		return await Location.find({ id: this._locationId }).then(locations => locations.length ? locations[0] : null)
	}

	/** The service id associated with the appointment. */
	get serviceId(): AppointmentInfo['serviceId'] { return this._serviceId }
	set serviceId(value: AppointmentInit['serviceId']) { this._serviceId = value }

	/** Get the service associated with the appointment. */
	async getService(): Promise<Service | null> {
		return await Service.find({ id: this._serviceId }).then(services => services.length ? services[0] : null)
	}

	/** The date of the appointment in "YYYY-MM-DD" format. */
	get date(): AppointmentInfo['date'] { return this._date }
	set date(value: AppointmentInit['date']) { this._date = value }

	/** The start time of the appointment in "HH:MM" format (24-hour clock). */
	get startTime(): AppointmentInfo['startTime'] { return this._startTime }
	set startTime(value: AppointmentInit['startTime']) { this._startTime = value }

	/** The end time of the appointment in "HH:MM" format (24-hour clock). */
	get endTime(): AppointmentInfo['endTime'] { return this._endTime }
	set endTime(value: AppointmentInit['endTime']) { this._endTime = value }

	/** The agreed upon price of the service for the appointment. */
	get price(): AppointmentInfo['price'] { return this._price }
	set price(value: AppointmentInit['price']) { this._price = value }

	/** The status of the appointment. */
	get status(): AppointmentInfo['status'] { return this._status }
	set status(value: AppointmentInit['status']) { this._status = value ?? 'scheduled' }

	/** Additional notes about the appointment. */
	get notes(): AppointmentInfo['notes'] { return this._notes }
	set notes(value: AppointmentInit['notes']) { this._notes = Notes.parse(value) }

	/** Find appointments based on filter criteria. 
	 * 
	 * @param filters Values to filter appointments by.
	 * - `id`: `string | string[]` - appointment id(s).
	 * - `clientId`: `string | string[]` - client id(s).
	 * - `providerId`: `string | string[]` - provider id(s).
	 * - `locationId`: `string | string[]` - location id(s).
	 * - `serviceId`: `string | string[]` - service id(s).
	 * - `date`: `string | string[]` - exact date(s) in "YYYY-MM-DD" format.
	 * - `minDate`: `string` - minimum date in "YYYY-MM-DD" format.
	 * - `maxDate`: `string` - maximum date in "YYYY-MM-DD" format.
	 * - `startTime`: `string` - exact start time in "HH:MM" format.
	 * - `minStartTime`: `string` - minimum start time in "HH:MM" format.
	 * - `maxStartTime`: `string` - maximum start time in "HH:MM" format.
	 * - `endTime`: `string` - exact end time in "HH:MM" format.
	 * - `minEndTime`: `string` - minimum end time in "HH:MM" format.
	 * - `maxEndTime`: `string` - maximum end time in "HH:MM" format.
	 * - `status`: `string | string[]` - appointment status(es).
	 * @returns An array of `Appointment` instances matching the filter criteria.
	 * @note If no filters are provided, all appointments will be returned.
	 */
	static async find(filters: AppointmentFilter = {}) {
		// TODO: Implement actual data retrieval logic here.
		return [] as Appointment[]
	}
}

export default Appointment