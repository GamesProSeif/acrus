const MESSAGES: { [key: string]: any } = {
	NO_ROUTE_DEFAULT_EXEC: 'Cannot call abstract Route#exec method',
	DUPLICATE_ENDPOINT: (endpoint: string, id: string) =>
		`Duplicate endpoint "${endpoint}" - id: ${id}`,
	NO_ERROR_LISTENER: (error: Error) => `No error listener attached - ${error}`,
	INVALID_ROUTE_TYPE: (type: string, id: string) =>
		`Invalid route type "${type}" in "${id}"`,
	MODULE_NOT_FOUND: (classToHandle: string, id: string) =>
		`Could not find module "${id}" in "${classToHandle}" handler`,
	NO_DIRECTORY_SPECIFIED: (classToHandle: string) =>
		`No directory specified in "${classToHandle}" handler`
};

export default class AcrusError extends Error {
	public constructor(key: string, ...args: any[]) {
		if (MESSAGES[key] === null) throw new TypeError(`Error key '${key}' does not exist`);
		const message = typeof MESSAGES[key] === 'function'
			? MESSAGES[key](...args)
			: MESSAGES[key];

		super(message);
	}
}
