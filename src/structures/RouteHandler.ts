import { RequestHandler } from 'express';
import { Handler } from './Handler';
import { Route } from './Route';
import { Server } from './Server';

export class RouteHandler extends Handler<Route> {
	public server: Server;
	public endpoints: { [key: string]: Map<string, string> };

	public constructor(server: Server) {
		super();
		this.server = server;
		this.endpoints = {
			GET: new Map(),
			POST: new Map(),
			PUT: new Map(),
			PATCH: new Map(),
			DELETE: new Map(),
			ALL: new Map()
		};
	}

	public load(path: string): Route {
		const module = super.load(path);
		if (module.endpoint) {
			for (const endpoint of module.endpoint) {
				if (this.endpoints[module.type.toUpperCase()].has(endpoint)) {
					throw new Error(
						`Duplicate endpoint "${endpoint}" - id: ${module.id}`
					);
				}
			}
		}
		module.init(this.server);
		return module;
	}

	public sortFunction(a: Route, b: Route): number {
		return a.order - b.order;
	}

	public init() {
		const modules: Route[] = Object.values(this.modules)
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
}
