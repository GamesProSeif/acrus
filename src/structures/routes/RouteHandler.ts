import { RequestHandler } from 'express';
import * as onFinshed from 'on-finished';
import { posix } from 'path';
import { AcrusHandler, AcrusHandlerOptions } from '../AcrusHandler';
import { Route } from './Route';
import { Server } from '../Server';
import AcrusError from '../../util/AcrusError';
import { EVENTS } from '../../util/Constants';

export interface RouteHandlerOptions extends AcrusHandlerOptions {
	routeErrorMessage?: (error: Error) => string;
	routeErrorStatus?: number;
	sortFunction?: (a: Route, b: Route) => number;
}

/**
 * Route handler responsible for loading routes
 * @extends {Handler}
 */
export class RouteHandler extends AcrusHandler {
	/** Modules loaded */
	public modules!: Map<string, Route>;

	/** all endpoints mapped to id of route */
	public endpoints: { [key: string]: Map<string, string> };

	/**
	 * function which returns a string that is sent to user when a route errors
	 * @param error the error triggered
	 * @returns {string} message to send to send to client as json
	*/
	public routeErrorMessage: (error: Error) => string;

	/** status to provide when a route errors */
	public routeErrorStatus: number;

	/**
	 * Sort function used to load routes
	 * @param a first route
	 * @param b second route
	 */
	public sortFunction: (a: Route, b: Route) => number;

	public constructor(server: Server, {
		routeErrorMessage = () => 'Internal server error',
		routeErrorStatus = 500,
		sortFunction = (a, b) => a.order - b.order,
		classToHandle = Route,
		...rest
	}: RouteHandlerOptions = {}) {
		super(server, {
			classToHandle,
			...rest
		});

		this.endpoints = {
			/** GET endpoints */
			GET: new Map(),
			/** POST endpoints */
			POST: new Map(),
			/** PUT endpoints */
			PUT: new Map(),
			/** PATCH endpoints */
			PATCH: new Map(),
			/** DELETE endpoints */
			DELETE: new Map(),
			/** ALL endpoints */
			ALL: new Map()
		};

		this.routeErrorMessage = routeErrorMessage;
		this.routeErrorStatus = routeErrorStatus;
		this.sortFunction = sortFunction;
	}

	public register(route: Route, filepath: string | null) {
		super.register(route, filepath);

		if (route.endpoint && route.endpoint.length && !route.root) {
			route.endpoint =
				route.endpoint.map(e => posix.join(route.server.baseEndpoint, e));
		}

		if (route.endpoint) {
			for (const endpoint of route.endpoint) {
				if (this.endpoints[route.type.toUpperCase()].has(endpoint)) {
					throw new AcrusError('DUPLICATE_ENDPOINT', endpoint, route.id);
				}
				this.endpoints[route.type.toUpperCase()].set(endpoint, route.id);
			}
		}
	}

	public deregister(mod: Route) {
		super.deregister(mod);

		this.server.emit(EVENTS.SERVER.WARN, 'endpoint cannot be unloaded from the express server');
	}

	/**
	 * Initialise route handler
	 */
	public init() {
		this.server.app.use((req, res, next) => {
			const start = Date.now();
			this.emit(EVENTS.ROUTE_HANDLER.ROUTE_START, req);
			onFinshed(res, () => {
				this.emit(EVENTS.ROUTE_HANDLER.ROUTE_END, req, res, Date.now() - start);
			});

			next();
		});

		const modules: Route[] = Array.from(this.modules.values())
			.sort(this.sortFunction)
			.filter((mod: Route) => mod.endpoint && mod.endpoint.length);

		const app = this.server.app;

		for (const mod of modules) {
			const handler: RequestHandler = async (req, res) => {
				try {
					await mod.exec(req, res);
				} catch (error) {
					if (this.listenerCount(EVENTS.ROUTE_HANDLER.ROUTE_ERROR) === 0) {
						throw new AcrusError('NO_ERROR_LISTENER', error);
					}

					this.emit(EVENTS.ROUTE_HANDLER.ROUTE_ERROR, error);

					try {
						res.status(500).json({ error: this.routeErrorMessage(error) });
					} catch {}
				}
			};

			switch (mod.type) {
				case 'GET':
					app.get(mod.endpoint!, ...mod.middlewares, handler);
					break;
				case 'POST':
					app.post(mod.endpoint!, ...mod.middlewares, handler);
					break;
				case 'PUT':
					app.put(mod.endpoint!, ...mod.middlewares, handler);
					break;
				case 'PATCH':
					app.patch(mod.endpoint!, ...mod.middlewares, handler);
					break;
				case 'DELETE':
					app.delete(mod.endpoint!, ...mod.middlewares, handler);
					break;
				case 'ALL':
					app.all(mod.endpoint!, ...mod.middlewares, handler);
					break;
				default:
					throw new AcrusError('INVALID_ROUTE_TYPE', mod.type, mod.id);
			}
		}
	}

	/**
	 * get endpoints count
	 * @readonly
	 */
	public get endpointCount(): number {
		return Object.values(this.endpoints).map(e => e.size).reduce((a, b) => a + b);
	}
}
