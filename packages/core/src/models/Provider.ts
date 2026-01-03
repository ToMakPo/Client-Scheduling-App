import { Phone, Email, PhoneInit, EmailInit } from "../lib/contact"
import { Optional, Queryable, Replace } from "../lib/customUtilityTypes"
import { MyTimeZone } from "../lib/myDates"
import { UUID } from "../lib/utils"
import Appointment, { AppointmentFilter } from "./Appointment"
import Location from "./location"
import ProviderBlockedTime, { ProviderBlockedTimeFilter } from "./ProviderBlockedTime"
import ProviderLocation, { ProviderLocationFilter } from "./ProviderLocation"
import ProviderNormalHours, { ProviderNormalHoursFilter } from "./ProviderNormalHours"
import ProviderSpecialHours, { ProviderSpecialHoursFilter } from "./ProviderSpecialHours"

export interface ProviderInfo {
	/** The unique identifier for the provider. */
	id: UUID
	/** The title of the provider (e.g., Dr., Mr., Ms.). */
	title: string | null
	/** The first name of the provider. */
	firstName: string
	/** The last name of the provider. */
	lastName: string
	/** The credentials of the provider (e.g., MD, DO, NP). */
	credentials: string | null
	/** The phone number of the provider. */
	phone: Phone | null
	/** The email address of the provider. */
	email: Email | null
	/** The timezone of the provider. */
	timezone: MyTimeZone
}

export type ProviderInit = Optional<Replace<ProviderInfo, { phone: PhoneInit, email: EmailInit }>, 'id'>

export type ProviderFilter = Partial<Queryable<ProviderInfo, 'id' | 'title' | 'credentials' | 'phone' | 'email' | 'timezone'>>

class Provider {
	private _id = null as unknown as ProviderInfo['id']
	private _title = null as unknown as ProviderInfo['title']
	private _firstName = null as unknown as ProviderInfo['firstName']
	private _lastName = null as unknown as ProviderInfo['lastName']
	private _credentials = null as unknown as ProviderInfo['credentials']
	private _phone = null as unknown as ProviderInfo['phone']
	private _email = null as unknown as ProviderInfo['email']
	private _timezone = null as unknown as ProviderInfo['timezone']

	/** Creates a new Provider instance.
	 * 
	 * @param props Provider properties.
	 * - `id`: `string` - The unique identifier for the provider. If not provided, a unique id will be generated.
	 * - `title`: `string` - The title of the provider (e.g., Dr., Mr., Ms.).
	 * - `firstName`: `string` - The first name of the provider.
	 * - `lastName`: `string` - The last name of the provider.
	 * - `credentials`: `string` - The credentials of the provider (e.g., MD, DO, NP).
	 * - `phone`: `string` - The phone number of the provider.
	 * - `email`: `string` - The email address of the provider.
	 * - `timezone`: `string` - The timezone of the provider.
	 */
	constructor(props: ProviderInit) {
		this._id = props.id || UUID.generate()
		this.title = props.title
		this.firstName = props.firstName
		this.lastName = props.lastName
		this.credentials = props.credentials
		this.phone = props.phone
		this.email = props.email
		this.timezone = props.timezone
	}

	/** The unique identifier for the provider. */
	get id(): ProviderInfo['id'] { return this._id }

	/** The title of the provider (e.g., Dr., Mr., Ms.). */
	get title(): ProviderInfo['title'] { return this._title }
	set title(value: ProviderInit['title']) { this._title = value?.trim() || null }

	/** The first name of the provider. */
	get firstName(): ProviderInfo['firstName'] { return this._firstName }
	set firstName(value: ProviderInit['firstName']) { 
		const firstName = value.trim()

		if (firstName.length === 0) {
			throw new Error("Provider first name cannot be empty.")
		}

		this._firstName = firstName
	}

	/** The last name of the provider. */
	get lastName(): ProviderInfo['lastName'] { return this._lastName }
	set lastName(value: ProviderInit['lastName']) { 
		const lastName = value.trim()
		
		if (lastName.length === 0) {
			throw new Error("Provider last name cannot be empty.")
		}

		this._lastName = lastName
	}

	/** The credentials of the provider (e.g., MD, DO, NP). */
	get credentials(): ProviderInfo['credentials'] { return this._credentials }
	set credentials(value: ProviderInit['credentials']) { this._credentials = value?.trim() || null }

	/** The name of the provider (first and last). */
	get name() {
		return `${this._firstName} ${this._lastName}`
	}

	/** The full name of the provider (title, first, last, credentials). */
	get fullName() {
		return `${this._title} ${this._firstName} ${this._lastName}, ${this._credentials}`
	}

	/** The phone number of the company. */
	get phone(): ProviderInfo['phone'] { return this._phone }
	set phone(value: ProviderInit['phone']) { this._phone = new Phone(value) }

	/** The email address of the company. */
	get email(): ProviderInfo['email'] { return this._email }
	set email(value: ProviderInit['email']) { this._email = new Email(value) }


	/** The timezone of the provider. */
	get timezone(): ProviderInfo['timezone'] { return this._timezone }
	set timezone(value: ProviderInit['timezone']) { this._timezone = value }

	/** Get the normal hours for the provider. */
	async getNormalHours(filters: ProviderNormalHoursFilter = {}): Promise<ProviderNormalHours[]> {
		return await ProviderNormalHours.find({ ...filters, providerId: this._id })
	}

	/** Get all special hours associated with the provider. 
	 * 
	 * @param filters Values to filter special hours by.
	 * @returns An array of `ProviderSpecialHours` instances associated with the provider.
	 */
	async getSpecialHours(filters: ProviderSpecialHoursFilter = {}): Promise<ProviderSpecialHours[]> {
		return await ProviderSpecialHours.find({ ...filters, providerId: this._id })
	}

	/** Get all blocked times associated with the provider. 
	 * 
	 * @param filters Values to filter blocked times by.
	 * @returns An array of `ProviderBlockedTime` instances associated with the provider.
	 */
	async getBlockedTimes(filters: ProviderBlockedTimeFilter = {}): Promise<ProviderBlockedTime[]> {
		return await ProviderBlockedTime.find({ ...filters, providerId: this._id })
	}

	/** Get all appointments associated with the provider. 
	 * 
	 * @param filters Values to filter appointments by.
	 * @returns An array of `Appointment` instances associated with the provider.
	 */
	async getAppointments(filters: AppointmentFilter = {}): Promise<Appointment[]> {
		return await Appointment.find({ ...filters, providerId: this._id })
	}

	/** Get all locations associated with the provider. 
	 * 
	 * @param filters Values to filter provider locations by.
	 * - `locationId`: `string | string[]` - location id(s).
	 * @returns An array of `Location` instances associated with the provider.
	 */
	async getLocations(filters: ProviderLocationFilter = {}): Promise<Location[]> {
		return await ProviderLocation.find({ ...filters, providerId: this._id })
			.then(async (pls: ProviderLocation[]) => await Promise.all(pls.map(pl => pl.getLocation())))
			.then((locations: (Location | null)[]) => locations.filter(Boolean) as Location[])
	}

	/** Find providers based on filter criteria. 
	 * 
	 * @param filters Values to filter providers by.
	 * - `id`: `string | string[]` - provider id(s).
	 * - `title`: `string` - provider title; supports partial matches and is case-insensitive.
	 * - `firstName`: `string` - provider first name; supports partial matches and is case-insensitive.
	 * - `lastName`: `string` - provider last name; supports partial matches and is case-insensitive.
	 * - `credentials`: `string` - provider credentials; supports partial matches and is case-insensitive.
	 * - `phone`: `string` - provider phone number; supports partial matches.
	 * - `email`: `string` - provider email; supports partial matches and is case-insensitive.
	 * - `timezone`: `string` - timezone; supports partial matches and is case-insensitive.
	 * @returns An array of `Provider` instances matching the filter criteria.
	 *
	 * @note If no filters are provided, all providers will be returned.
	 */
	static async find(filters: ProviderFilter = {}): Promise<Provider[]> {
		// TODO: Implement actual data retrieval logic here.
		return [] as Provider[]
	}
}

export default Provider