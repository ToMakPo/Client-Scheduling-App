///////////////
/// ADDRESS ///
///////////////
// #region Address

export interface AddressInfo {
	/** The street address. */
	street: string
	/** The city. */
	city: string
	/** The state or province. */
	state: string
	/** The zip code or postal code. */
	zip: string
	/** The country. */
	country: string
}

export type AddressInit = Address | AddressInfo | null | undefined

export class Address implements AddressInfo {
	private _street: string = null as unknown as AddressInfo['street']
	private _city: string = null as unknown as AddressInfo['city']
	private _state: string = null as unknown as AddressInfo['state']
	private _zip: string = null as unknown as AddressInfo['zip']
	private _country: string = null as unknown as AddressInfo['country']

	/** Creates a new Address instance.
	 * 
	 * @param props Address properties
	 * - `street`: `string` - The street address.
	 * - `city`: `string` - The city.
	 * - `state`: `string` - The state or province.
	 * - `zip`: `string` - The zip code or postal code.
	 * - `country`: `string` - The country.
	 */
	constructor(props: AddressInit) {
		if (props == null) {
			return null as unknown as Address
		}

		this.street = props.street
		this.city = props.city
		this.state = props.state
		this.zip = props.zip
		this.country = props.country
	}

	/** The street address. */
	get street(): AddressInfo['street'] { return this._street }
	set street(value: AddressInfo['street']) { 
		const street = value.trim()
		if (street.length === 0) {
			throw new Error('Street address cannot be empty.')
		}
		this._street = street
	}

	/** The city. */
	get city(): AddressInfo['city'] { return this._city }
	set city(value: AddressInfo['city']) { 
		const city = value.trim()
		if (city.length === 0) {
			throw new Error('City cannot be empty.')
		}
		this._city = city
	}

	/** The state or province. */
	get state(): AddressInfo['state'] { return this._state }
	set state(value: AddressInfo['state']) { 
		const state = value.trim()
		if (state.length === 0) {
			throw new Error('State cannot be empty.')
		}
		this._state = state
	}

	/** The zip code or postal code. */
	get zip(): AddressInfo['zip'] { return this._zip }
	set zip(value: AddressInfo['zip']) { 
		const zip = value.trim()
		if (zip.length === 0) {
			throw new Error('Zip code cannot be empty.')
		}
		this._zip = zip
	}

	/** The country. */
	get country(): AddressInfo['country'] { return this._country }
	set country(value: AddressInfo['country']) { 
		const country = value.trim()
		if (country.length === 0) {
			throw new Error('Country cannot be empty.')
		}
		this._country = country
	}

	toString(): string {
		return `${this._street}, ${this._city}, ${this._state} ${this._zip}, ${this._country}`
	}

	toRepr(): string {
		return `Address(street="${this._street}", city="${this._city}", state="${this._state}", zip="${this._zip}", country="${this._country}")`
	}

	toJSON() {
		return {
			street: this._street,
			city: this._city,
			state: this._state,
			zip: this._zip,
			country: this._country
		} as AddressInfo
	}
}

// #endregion Address



/////////////
/// PHONE ///
/////////////
// #region Phone

export interface PhoneInfo {
	/** The phone number as a string of digits. */
	number: string
	/** A formatted display version of the phone number. */
	display: string
}

export type PhoneInit = Omit<PhoneInfo, 'display'> | Omit<PhoneInfo, 'display'> | null | undefined

export class Phone implements PhoneInfo {
	private _number: string = null as unknown as PhoneInfo['number']

	/** Creates a new Phone instance.
	 * 
	 * @param props Phone properties.
	 * - `number`: `string` - The phone number as a string of digits.
	 */
	constructor(props: PhoneInit) {
		if (props == null) {
			return null as unknown as Phone
		}

		this.number = props.number
	}

	/** The phone number as a string of digits. */
	get number(): PhoneInfo['number'] { return this._number }
	set number(value: PhoneInfo['number']) {
		const number = value.replace(/\D/g, '')

		// Basic validation: check if the number has 10 or 11 digits (with country code)
		if (!/^\d{10,11}$/.test(number)) {
			throw new Error('Invalid phone number format. Must contain 10 or 11 digits.')
		}

		this._number = number
	}

	/** A formatted display version of the phone number. 
	 * 
	 * @example
	 * ```ts
	 * const phone = Phone.set("+12345678900");
	 * console.log(phone.display); // Output: (234) 567-8900
	 * ```
	 */
	get display(): string {
		const match = this._number.match(/^(\d{1})(\d{3})(\d{3})(\d{4})$/)
		if (match) {
			return `(${match[2]}) ${match[3]}-${match[4]}`
		}
		return this._number
	}

	toString(): string {
		return this._number
	}

	toRepr(): string {
		return `Phone(number="${this._number}")`
	}

	toJSON() {
		return {
			number: this._number,
			display: this.display
		} as PhoneInfo
	}
}

// #endregion Phone



/////////////
/// EMAIL ///
/////////////
// #region Email

export interface EmailInfo {
	/** The email address. */
	address: string
}

export type EmailInit = Email | EmailInfo | null | undefined

export class Email implements EmailInfo {
	private _address: string = null as unknown as EmailInfo['address']

	/** Creates a new Email instance.
	 * 
	 * @param props Email properties.
	 * - `address`: `string` - The email address.
	 */
	constructor(props: EmailInit) {
		if (props == null) {
			return null as unknown as Email
		}

		this.address = props.address
	}

	get address(): EmailInfo['address'] { return this._address }
	set address(value: EmailInfo['address']) {
		const address = value.trim().toLowerCase()

		// Basic validation: check if the email address is in a valid format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		if (!emailRegex.test(address)) {
			throw new Error('Invalid email address format.')
		}

		this._address = address
	}

	toString(): string {
		return this._address
	}

	toRepr(): string {
		return `Email(address="${this._address}")`
	}

	toJSON() {
		return {
			address: this._address
		} as EmailInfo
	}
}

// #endregion Email