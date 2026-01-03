import { Optional, Replace, Queryable, FlattenChild } from "../lib/customUtilityTypes"
import { Address, AddressInit, Email, EmailInit, Phone, PhoneInit } from "../lib/contact"
import Location from "./location"
import { UUID } from "../lib/utils"

export interface CompanyInfo {
	/** The unique identifier for the company. */
	id: UUID
	/** The name of the company. */
	name: string
	/** The physical address of the company. */
	address: Address | null
	/** The phone number of the company. */
	phone: Phone | null
	/** The email address of the company. */
	email: Email | null
}

export type CompanyInit = Optional<Replace<CompanyInfo, { address: AddressInit, phone: PhoneInit, email: EmailInit}>, 'id' | 'phone' | 'email' | 'address'>

export type CompanyFilter = Partial<Queryable<FlattenChild<CompanyInfo, { address: 'address' }>, 'id' | 'address_city' | 'address_state' | 'address_zip' | 'address_country'>>

class Company implements CompanyInfo {
	private _id = null as unknown as CompanyInfo['id']
	private _name: string = null as unknown as CompanyInfo['name']
	private _address: Address | null = null as unknown as CompanyInfo['address']
	private _phone: Phone | null = null as unknown as CompanyInfo['phone']
	private _email: Email | null = null as unknown as CompanyInfo['email']

	/**
	 * Creates a new Company instance.
	 * 
	 * @param props Company properties.
	 * - `id`: `string` - The unique identifier for the company. If not provided, a unique id will be generated.
	 * - `name`: `string` - The name of the company.
	 * - `address`: `Address | AddressInfo | null` - The physical address of the company. Optional.
	 * - `phone`: `Phone | PhoneInfo | null` - The phone number of the company. Optional.
	 * - `email`: `Email | EmailInfo | null` - The email address of the company. Optional.
	 */
	constructor(props: CompanyInit) {
		this._id = props.id || UUID.generate()
		this.name = props.name
		this.address = props.address
		this.phone = props.phone
		this.email = props.email
	}

	/** The unique identifier for the company. */
	get id(): CompanyInfo['id'] { return this._id }

	/** The name of the company. */
	get name(): CompanyInfo['name'] { return this._name }
	set name(value: CompanyInit['name']) { 
		const name = value.trim()

		if (name.length === 0) {
			throw new Error("Company name cannot be empty.")
		}

		this._name = name
	}

	/** The physical address of the company. */
	get address(): CompanyInfo['address'] { return this._address }
	set address(value: CompanyInit['address']) { this._address = new Address(value) }

	/** The phone number of the company. */
	get phone(): CompanyInfo['phone'] { return this._phone }
	set phone(value: CompanyInit['phone']) { this._phone = new Phone(value) }

	/** The email address of the company. */
	get email(): CompanyInfo['email'] { return this._email }
	set email(value: CompanyInit['email']) { this._email = new Email(value) }

	/** Get all locations associated with the company. */
	async getLocations(): Promise<Location[]> {
		return await Location.find({ companyId: this._id })
	}

	/** Find companies based on filter criteria. 
	 * 
	 * @param filters Values to filter companies by.
	 * - `id`: `string | string[]` - company id(s).
	 * - `name`: `string` - company name; supports partial matches and is case-insensitive.
	 * - `phone`: `string` - company phone number; supports partial matches.
	 * - `email`: `string` - company email; supports partial matches and is case-insensitive.
	 * - `address_street`: `string` - street address; supports partial matches.
	 * - `address_city`: `string` - city; supports partial matches and is case-insensitive.
	 * - `address_state`: `string` - state or province; supports partial matches and is case-insensitive.
	 * - `address_zip`: `string` - zip code or postal code; supports partial matches.
	 * - `address_country`: `string` - country; supports partial matches and is case-insensitive.
	 * @returns An array of `Company` instances matching the filter criteria.
	 * @note If no filters are provided, all companies will be returned.
	 */
	static async find(filters: CompanyFilter = {}): Promise<Company[]> {
		// TODO: Implement actual data retrieval logic here.
		return [] as Company[]
	}
}

export default Company