import { Optional, Queryable, FlattenChild, Replace } from "../lib/customUtilityTypes"
import { Phone, Email, Address, AddressInit, PhoneInit, EmailInit } from "../lib/contact"
import Company from "./company"
import LocationNormalHours from "./LocationNormalHours"
import LocationSpecialHours from "./LocationSpecialHours"
import { UUID } from "../lib/utils"
import { MyTimeZone } from "../lib/myDates"
import Appointment, { AppointmentFilter } from "./Appointment"

export interface LocationInfo {
	/** The unique identifier for the location. */
	id: UUID
	/** The name of the location. */
	name: string
	/** The company id associated with the location. */
	companyId: UUID
	/** The physical address of the location. */
	address: Address | null
	/** The phone number of the location. */
	phone: Phone | null
	/** The email address of the location. */
	email: Email | null
	/** The timezone of the location. */
	timezone: MyTimeZone
}

export type LocationInit = Optional<Replace<LocationInfo, { address: AddressInit, phone: PhoneInit, email: EmailInit }>, 'id'>

export type LocationFilter = Partial<Queryable<FlattenChild<LocationInfo, { address: 'address' }>, 'id' | 'companyId' | 'address_city' | 'address_state' | 'address_zip' | 'address_country' | 'timezone'>>

class Location implements LocationInfo {
	private _id = null as unknown as LocationInfo['id']
	private _name = null as unknown as LocationInfo['name']
	private _companyId = null as unknown as LocationInfo['companyId']
	private _address = null as unknown as LocationInfo['address']
	private _phone = null as unknown as LocationInfo['phone']
	private _email = null as unknown as LocationInfo['email']
	private _timezone = null as unknown as LocationInfo['timezone']

	/** Creates a new Location instance.
	 * 
	 * @param props Location properties.
	 * - `id`: `string` - The unique identifier for the location. If not provided, a unique id will be generated.
	 * - `name`: `string` - The name of the location.
	 * - `companyId`: `string` - The company id associated with the location.
	 * - `address`: `Address | AddressInfo | null` - The address of the location. Optional.
	 * - `phone`: `string | null` - The phone number of the location. Optional.
	 * - `email`: `string | null` - The email address of the location. Optional.
	 * - `timezone`: `string` - The timezone of the location.
	 */
	constructor(props: LocationInit) {
		this._id = props.id || UUID.generate()
		this.name = props.name
		this._companyId = props.companyId
		this.address = props.address
		this.phone = props.phone
		this.email = props.email
		this.timezone = props.timezone
	}

	/** The unique identifier for the location. */
	get id(): LocationInfo['id'] { return this._id }

	/** The name of the location. */
	get name(): LocationInfo['name'] { return this._name }
	set name(value: LocationInit['name']) {
		const name = value.trim()

		if (name.length === 0) {
			throw new Error("Location name cannot be empty.")
		}

		this._name = name
	}

	/** The company id associated with the location. */
	get companyId(): LocationInfo['companyId'] { return this._companyId }

	/** Get the company associated with the location. */
	async getCompany(): Promise<Company | null> {
		return await Company.find({ id: this._companyId }).then(companies => companies.length ? companies[0] : null)
	}

	/** The physical address of the company. */
	get address(): LocationInfo['address'] { return this._address }
	set address(value: LocationInit['address']) { this._address = new Address(value) }

	/** The phone number of the company. */
	get phone(): LocationInfo['phone'] { return this._phone }
	set phone(value: LocationInit['phone']) { this._phone = new Phone(value) }

	/** The email address of the company. */
	get email(): LocationInfo['email'] { return this._email }
	set email(value: LocationInit['email']) { this._email = new Email(value) }

	/** The timezone of the location. */
	get timezone(): LocationInfo['timezone'] { return this._timezone }
	set timezone(value: LocationInit['timezone']) { this._timezone = value }

	/** Get the normal hours for the location. */
	async getNormalHours(): Promise<LocationNormalHours[]> {
		return LocationNormalHours.find({ locationId: this._id })
	}

	/** Get the special hours for the location. */
	async getSpecialHours(): Promise<LocationSpecialHours[]> {
		return LocationSpecialHours.find({ locationId: this._id })
	}

	/** Get appointments associated with the location.
	 * 
	 * @param filters Values to filter appointments by.
	 * @returns An array of `Appointment` instances associated with the location.
	 */
	async getAppointments(filters: AppointmentFilter = {}): Promise<Appointment[]> {
		return await Appointment.find({ ...filters, locationId: this._id })
	}

	/** Find locations based on filter criteria. 
	 * 
	 * @param filters Values to filter locations by.
	 * - `id`: `string | string[]` - location id(s).
	 * - `name`: `string` - location name; supports partial matches and is case-insensitive.
	 * - `companyId`: `string | string[]` - company id(s).
	 * - `address_street`: `string` - street address; supports partial matches.
	 * - `address_city`: `string` - city; supports partial matches and is case-insensitive.
	 * - `address_state`: `string` - state or province; supports partial matches and is case-insensitive.
	 * - `address_zip`: `string` - zip code or postal code; supports partial matches.
	 * - `address_country`: `string` - country; supports partial matches and is case-insensitive.
	 * - `timezone`: `string` - timezone; supports partial matches and is case-insensitive.
	 * @returns An array of `Location` instances matching the filter criteria.
	 * @note If no filters are provided, all locations will be returned.
	 */
	static async find(filters: LocationFilter = {}): Promise<Location[]> {
		// TODO: Implement actual data retrieval logic here.
		return [] as Location[]
	}
}

export default Location