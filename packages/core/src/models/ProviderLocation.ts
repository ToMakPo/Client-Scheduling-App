import { Queryable } from "../lib/customUtilityTypes"
import { UUID } from "../lib/utils"
import Location from "./location"
import Provider from "./Provider"

export interface ProviderLocationInfo {
	/** The unique identifier for the provider. */
	providerId: UUID
	/** The unique identifier for the location. */
	locationId: UUID
}

export type ProviderLocationInit = ProviderLocationInfo

export type ProviderLocationFilter = Partial<Queryable<ProviderLocationInfo, 'providerId' | 'locationId'>>

class ProviderLocation {
	private _providerId = null as unknown as ProviderLocationInfo['providerId']
	private _locationId = null as unknown as ProviderLocationInfo['locationId']

	/** Creates a new ProviderLocation instance.
	 * 
	 * @param props Provider location properties.
	 * - `providerId`: `string` - The provider id associated with the location.
	 * - `locationId`: `string` - The location id associated with the provider.
	 */
	constructor(props: ProviderLocationInit) {
		this._providerId = props.providerId
		this._locationId = props.locationId
	}

	/** The provider id associated with the location. */
	get providerId(): ProviderLocationInfo['providerId'] { return this._providerId }

	/** Get the provider associated with the location. */
	async getProvider(): Promise<Provider | null> {
		return await Provider.find({ id: this._providerId }).then(providers => providers.length ? providers[0] : null)
	}

	/** The location id associated with the provider. */
	get locationId(): ProviderLocationInfo['locationId'] { return this._locationId }
	
	/** Get the location associated with the provider. */
	async getLocation(): Promise<Location | null> {
		return await Location.find({ id: this._locationId }).then(locations => locations.length ? locations[0] : null)
	}

	/** Find provider locations based on filter criteria.
	 * 
	 * @param filters Values to filter provider locations by.
	 * - `providerId`: `string | string[]` - provider id(s).
	 * - `locationId`: `string | string[]` - location id(s).
	 * @returns An array of `ProviderLocation` instances matching the filter criteria.
	 * 
	 * @note If no filters are provided, all provider locations will be returned.
	 */
	static async find(filters: ProviderLocationFilter = {}) {
		// TODO: Implement actual data retrieval logic here.
		return [] as ProviderLocation[]
	}
}

export default ProviderLocation