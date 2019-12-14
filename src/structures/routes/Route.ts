/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, RequestHandler } from 'express';
import { AcrusModule } from '../AcrusModule';
import AcrusError from '../../util/AcrusError';

export type RequestType = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'ALL';

export interface RouteOptions {
	endpoint?: string | string[];
	type?: RequestType;
	order?: number;
	root?: boolean;
	middlewares?: RequestHandler[];
}

/**
 * Route module
 * @extends {AcrusModule}
 */
export abstract class Route extends AcrusModule {
	/** endpoint(s) of route */
	public endpoint?: string[];

	/** request type */
	public type: RequestType;

	/** order of loading */
	public order: number;

	/** whether to ignore baseEndpoint and set endpoint to be at root level */
	public root: boolean;

	/** middleware to run before exec function */
	public middlewares: RequestHandler[];

	/**
	 * Create new route
	 * @param id id of route
	 * @param {RouteOptions} options route options
	 */
	public constructor(id: string, {
		endpoint,
		type = 'GET',
		order = 1,
		root = false,
		middlewares = []
	}: RouteOptions = {}) {
		super(id);
		this.id = id;
		this.endpoint = typeof endpoint === 'string'
			? [endpoint]
			: endpoint;

		this.type = type || 'GET';
		this.order = order || 1;
		this.root = root || false;
		this.middlewares = middlewares;
	}

	/**
	 * Function to be executed at endpoint hit
	 * @param req request instance
	 * @param res response instance
	 */
	public exec(req: Request, res: Response): void | Promise<void> {
		throw new AcrusError('NO_ROUTE_DEFAULT_EXEC');
	}
}
