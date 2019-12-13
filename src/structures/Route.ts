/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response } from 'express';
import { posix } from 'path';
import { Module } from './Module';
import { Server } from './Server';

export type RequestType = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'ALL';

export interface RouteOptions {
	endpoint?: string | string[];
	type?: RequestType;
	order?: number;
	root?: boolean;
}

/**
 * Route module
 * @extends {Module}
 */
export abstract class Route extends Module {
	/** id of route */
	public id: string;

	/** server used */
	public server!: Server;

	/** endpoint(s) of route */
	public endpoint?: string[];

	/** request type */
	public type: RequestType;

	/** order of loading */
	public order: number;

	/** whether to ignore baseEndpoint and set endpoint to be at root level */
	public root: boolean;

	/**
	 * Create new route
	 * @param id id of route
	 * @param options route options
	 */
	public constructor(id: string, options: RouteOptions = {}) {
		super(id);
		this.id = id;
		this.endpoint = typeof options.endpoint === 'string'
			? [options.endpoint]
			: options.endpoint;

		this.type = options.type || 'GET';
		this.order = options.order || 1;
		this.root = options.root || false;
	}

	/**
	 * Initialise route
	 * @param server server used
	 */
	public init(server: Server) {
		this.server = server;
		if (this.endpoint && this.endpoint.length && !this.root) {
			this.endpoint =
				this.endpoint.map(e => posix.join(this.server.baseEndpoint, e));
		}
	}

	/**
	 * Function to be executed at endpoint hit
	 * @param req request instance
	 * @param res response instance
	 */
	public exec(req: Request, res: Response): void | Promise<void> {
		throw new Error(`Cannot call abstract method`);
	}
}
