/**
 * Base Module loaded by handlers
 */
export class Module {
	/** id of module */
	public id: string;

	/**
	 * Create new module
	 * @param id id of module
	 */
	public constructor(id: string) {
		this.id = id;
	}
}
