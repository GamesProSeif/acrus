import { RequestHandler } from 'express';
import { Handler } from './Handler';
import { Route } from './Route';
import { Server } from './Server';

/**
 * Route handler responsible for loading routes
 * @extends {Handler}
 */
export class RouteHandler extends Handler<Route> {
	/** server used */
	public server: Server;

	/** all endpoints mapped to id of route */
	public endpoints: { [key: string]: Map<string, string> };

	public constructor(server: Server) {
		super();
		this.server = server;
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
	}

	/**
	 * Load a route
	 * @param path path of route to load
	 * @returns route loaded
	 */
	public load(path: string): Route {
		const module = super.load(path);
		if (module.endpoint) {
			for (const endpoint of module.endpoint) {
				if (this.endpoints[module.type.toUpperCase()].has(endpoint)) {
					throw new Error(
						`Duplicate endpoint "${endpoint}" - id: ${module.id}`
					);
				}
				this.endpoints[module.type.toUpperCase()].set(endpoint, module.id);
			}
		}
		module.init(this.server);

		this.server.emit('routeLoad', module);
		return module;
	}

	/**
	 * Sort function used to load routes
	 * @param a first route
	 * @param b second route
	 */
	public sortFunction(a: Route, b: Route): number {
		return a.order - b.order;
	}

	/**
	 * Initialise route handler
	 */
	public init() {
		const modules: Route[] = Array.from(this.modules.values())
			.sort(this.sortFunction)
			.filter((module: Route) => module.endpoint && module.endpoint.length);

		const app = this.server.app;

		for (const module of modules) {
			const handler: RequestHandler = async (req, res) => {
				try {
					await module.exec(req, res);
				} catch (error) {
					if (this.server.listenerCount('routeError') === 0) {
						throw new Error(error);
					}
					this.server.emit('routeError', error);
				}
			};

			switch (module.type) {
				case 'GET':
					app.get(module.endpoint!, handler);
					break;
				case 'POST':
					app.post(module.endpoint!, handler);
					break;
				case 'PUT':
					app.put(module.endpoint!, handler);
					break;
				case 'PATCH':
					app.patch(module.endpoint!, handler);
					break;
				case 'DELETE':
					app.delete(module.endpoint!, handler);
					break;
				case 'ALL':
					app.all(module.endpoint!, handler);
					break;
				default:
					throw new Error(`Invalid route type "${module.type}"`);
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
