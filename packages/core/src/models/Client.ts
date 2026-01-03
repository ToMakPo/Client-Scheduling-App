import { Phone, Email, Address } from "../lib/contact"
import { Optional, Queryable, Replace } from "../lib/customUtilityTypes"
import { Notes, UUID } from "../lib/utils"
import Appointment, { AppointmentFilter } from "./Appointment"

export interface ClientInfo {
	/** The unique identifier for the client. */
	id: UUID
	/** The title of the client (e.g., Mr., Ms., Dr.). */
	title: string | null
	/** The first name of the client. */
	firstName: string
	/** The last name of the client. */
	lastName: string
	/** The full name of the client (first and last). */
	name: string
	/** The physical address of the client. */
	address: Address | null
	/** The phone number of the client. */
	phone: Phone
	/** The email address of the client. */
	email: Email
	/** Additional notes about the client. */
	notes: Notes
}

export type ClientInit = Optional<Replace<ClientInfo, { notes: string | Notes }>, 'id' | 'title' | 'address'>

export type ClientFilter = Partial<Queryable<ClientInfo, 'id'>>

class Client {
	private _id = null as unknown as ClientInfo['id']
	private _title = null as unknown as ClientInfo['title']
	private _firstName = null as unknown as ClientInfo['firstName']
	private _lastName = null as unknown as ClientInfo['lastName']
	private _address = null as unknown as ClientInfo['address']
	private _phone = null as unknown as ClientInfo['phone']
	private _email = null as unknown as ClientInfo['email']
	private _notes = null as unknown as ClientInfo['notes']

	/** Creates a new Client instance.
	 * 
	 * @param props Client properties.
	 * - `id`: `string` - The unique identifier for the client. If not provided, a unique id will be generated.
	 * - `title`: `string | null` - The title of the client (e.g., Mr., Ms., Dr.).
	 * - `firstName`: `string` - The first name of the client.
	 * - `lastName`: `string` - The last name of the client.
	 * - `phone`: `string` - The phone number of the client.
	 * - `email`: `string` - The email address of the client.
	 * - `notes`: `string` - Additional notes about the client.
	 */
	constructor(props: ClientInit) {
		this._id = props.id || UUID.generate()
		this.title = props.title
		this.firstName = props.firstName
		this.lastName = props.lastName
		this.address = props.address
		this.phone = props.phone
		this.email = props.email
		this.notes = props.notes
	}

	/** The unique identifier for the client. */
	get id(): ClientInfo['id'] { return this._id }

	/** The title of the client (e.g., Mr., Ms., Dr.). */
	get title(): ClientInfo['title'] { return this._title }
	set title(value: ClientInit['title']) { this._title = value || null }

	/** The first name of the client. */
	get firstName(): ClientInfo['firstName'] { return this._firstName }
	set firstName(value: ClientInit['firstName']) { this._firstName = value }

	/** The last name of the client. */
	get lastName(): ClientInfo['lastName'] { return this._lastName }
	set lastName(value: ClientInit['lastName']) { this._lastName = value }

	/** The name of the client (first and last). */
	get name(): ClientInfo['name'] {
		return `${this._firstName} ${this._lastName}`
	}

	/** The physical address of the client. */
	get address(): ClientInfo['address'] { return this._address }
	set address(value: ClientInit['address']) { this._address = new Address(value) }

	/** The phone number of the client. */
	get phone(): ClientInfo['phone'] { return this._phone }
	set phone(value: ClientInit['phone']) { this._phone = new Phone(value) }

	/** The email address of the client. */
	get email(): ClientInfo['email'] { return this._email }
	set email(value: ClientInit['email']) { this._email = new Email(value) }

	/** Additional notes about the client. */
	get notes(): ClientInfo['notes'] { return this._notes }
	set notes(value: ClientInit['notes']) { this._notes = Notes.parse(value) }

	/** Get appointments associated with the client.
	 * 
	 * @param filters Values to filter appointments by.
	 * @returns An array of `Appointment` instances associated with the client.
	 */
	async getAppointments(filters: AppointmentFilter = {}): Promise<Appointment[]> {
		return await Appointment.find({ ...filters, clientId: this._id })
	}

	/** Find clients based on filter criteria. 
	 * 
	 * @param filters Values to filter clients by.
	 * - `id`: `string | string[]` - client id(s).
	 * - `firstName`: `string` - client first name; supports partial matches and is case-insensitive.
	 * - `lastName`: `string` - client last name; supports partial matches and is case-insensitive.
	 * - `phone`: `string` - client phone number; supports partial matches.
	 * - `email`: `string` - client email; supports partial matches and is case-insensitive.
	 * - `notes`: `string` - client notes; supports partial matches and is case-insensitive.
	 * @returns An array of `Client` instances matching the filter criteria.
	 * 
	 * @note If no filters are provided, all clients will be returned.
	 */
	static async find(filters: ClientFilter = {}) {
		// TODO: Implement actual data retrieval logic here.
		return [] as Client[]
	}
}

export default Client