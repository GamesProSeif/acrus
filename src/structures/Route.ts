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

export abstract class Route extends Module {
	public id: string;
	public server!: Server;
	public endpoint?: string[];
	public type: RequestType;
	public order: number;
	public root: boolean;

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

	public init(server: Server) {
		this.server = server;
		if (this.endpoint && this.endpoint.length && !this.root) {
			this.endpoint =
				this.endpoint.map(e => posix.join(this.server.baseEndpoint, e));
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public exec(req: Request, res: Response): void | Promise<void> {
		throw new Error(`Cannot call abstract method`);
	}
}
