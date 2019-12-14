import { Server } from './Server';
import { AcrusHandler } from './AcrusHandler';

/**
 * Base Module loaded by handlers
 */
export class AcrusModule {
	/** id of module */
	public id: string;

	/** filepath of module */
	public filepath!: string | null;

	/** server used */
	public server!: Server;

	/** handler */
	public handler!: AcrusHandler;

	/**
	 * Create new module
	 * @param id id of module
	 */
	public constructor(id: string) {
		this.id = id;
	}
}
