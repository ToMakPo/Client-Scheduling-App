import { Optional, Replace, Queryable, Ranged } from "../lib/customUtilityTypes"
import { UUID } from "../lib/utils"
import Appointment, { AppointmentFilter } from "./Appointment"

export interface ServiceInfo {
	/** The unique identifier for the service. */
	id: UUID
	/** The name of the service. */
	name: string
	/** The description of the service. */
	description: string | null
	/** The duration of the service in minutes. */
	duration: number
	/** The price of the service. */
	price: number
}

export type ServiceInit = Optional<Replace<ServiceInfo, { description: string }>, 'id' | 'description' | 'price'>

export type ServiceFilter = Partial<Queryable<Ranged<ServiceInfo, 'duration' | 'price'>, 'id'>>

class Service {
	private _id = null as unknown as ServiceInfo['id']
	private _name = null as unknown as ServiceInfo['name']
	private _description = null as unknown as ServiceInfo['description']
	private _duration = null as unknown as ServiceInfo['duration']
	private _price = null as unknown as ServiceInfo['price']

	/** Creates a new Service instance.
	 * 
	 * @param props Service properties.
	 * - `id`: `string` - The unique identifier for the service. If not provided, a unique id will be generated.
	 * - `name`: `string` - The name of the service.
	 * - `description`: `string` - The description of the service. Optional.
	 * - `duration`: `number` - The duration of the service in minutes.
	 * - `price`: `number | null` - The price of the service. Optional.
	 */
	constructor(props: ServiceInit) {
		this._id = props.id || UUID.generate()
		this.name = props.name
		this.description = props.description
		this.duration = props.duration
		this.price = props.price
	}

	/** The unique identifier for the service. */
	get id(): ServiceInfo['id'] { return this._id }

	/** The name of the service. */
	get name(): ServiceInfo['name'] { return this._name }
	set name(value: ServiceInit['name']) {
		const name = value.trim()

		if (name.length === 0) {
			throw new Error("Service name cannot be empty.")
		}

		this._name = name
	}

	/** The description of the service. */
	get description(): ServiceInfo['description'] { return this._description }
	set description(value: ServiceInit['description']) { this._description = value?.trim() || null }

	/** The duration of the service in minutes. */
	get duration(): ServiceInfo['duration'] { return this._duration }
	set duration(value: ServiceInit['duration']) {
		if (value < 0) {
			throw new Error("Service duration cannot be negative.")
		}

		this._duration = value
	}

	/** The price of the service. */
	get price(): ServiceInfo['price'] { return this._price }
	set price(value: ServiceInit['price']) { this._price = value || 0 }

	/** Get all appointments associated with this service.
	 * 
	 * @param filters Values to filter appointments by.
	 * @returns An array of `Appointment` instances associated with this service.
	 */
	async getAppointments(filters: AppointmentFilter = {}): Promise<Appointment[]> {
		return await Appointment.find({ ...filters, serviceId: this._id })
	}

	/** Find services based on filter criteria. 
	 * 
	 * @param filters Values to filter services by.
	 * - `id`: `string | string[]` - service id(s).
	 * @returns An array of `Service` instances matching the filter criteria.
	 *
	 * @note If no filters are provided, all services will be returned.
	 */
	static async find(filters: ServiceFilter = {}): Promise<Service[]> {
		// TODO: Implement actual data retrieval logic here.
		return [] as Service[]
	}
}

export default Service
