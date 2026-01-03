import { Queryable } from "../lib/customUtilityTypes"
import { UUID } from "../lib/utils"
import Provider from "./Provider"
import Service from "./Service"

interface ServiceProviderInfo {
	/** The unique identifier for the service provider. */
	providerId: UUID
	/** The unique identifier for the service. */
	serviceId: UUID
}

export type ServiceProviderInit = ServiceProviderInfo
	
export type ServiceProviderFilter = Partial<Queryable<ServiceProviderInfo, 'providerId' | 'serviceId'>>

class ServiceProvider {
	private _providerId = null as unknown as ServiceProviderInfo['providerId']
	private _serviceId = null as unknown as ServiceProviderInfo['serviceId']

	/** Creates a new ServiceProvider instance.
	 * 
	 * @param props Service provider properties.
	 * - `providerId`: `string` - The unique identifier for the service provider.
	 * - `serviceId`: `string` - The unique identifier for the service.
	 */
	constructor(props: ServiceProviderInit) {
		this._providerId = props.providerId
		this._serviceId = props.serviceId
	}

	/** The unique identifier for the service provider. */
	get providerId(): ServiceProviderInfo['providerId'] { return this._providerId }

	/** Get the provider associated with the service. */
	async getProvider(): Promise<Provider | null> {
		return await Provider.find({ id: this._providerId }).then(providers => providers.length ? providers[0] : null)
	}

	/** The unique identifier for the service. */
	get serviceId(): ServiceProviderInfo['serviceId'] { return this._serviceId }

	/** Get the service associated with the provider. */
	async getService(): Promise<Service | null> {
		return await Service.find({ id: this._serviceId }).then(services => services.length ? services[0] : null)
	}

	/** Find service providers based on filter criteria.
	 * 
	 * @param filters Values to filter service providers by.
	 * - `providerId`: `string | string[]` - provider id(s).
	 * - `serviceId`: `string | string[]` - service id(s).
	 * @returns An array of `ServiceProvider` instances matching the filter criteria.
	 * @note If no filters are provided, all service providers will be returned.
	 */
	static async find(filters: ServiceProviderFilter = {}) {
		// TODO: Implement actual data retrieval logic here.
		return [] as ServiceProvider[]
	}
}

export default ServiceProvider