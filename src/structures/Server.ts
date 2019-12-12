import { join } from 'path';
import * as EventEmitter from 'events';
import * as express from 'express';
import { RouteHandler } from './RouteHandler';

export interface ServerOptions {
	app?: express.Express;
	baseEndpoint?: string;
	routesDirectory?: string;
	port?: number;
}

export class Server extends EventEmitter {
	public app: express.Express;
	public port: number;
	public baseEndpoint: string;
	public routeHandler: RouteHandler;
	public routesDirectory: string;

	public constructor(options: ServerOptions = {}) {
		super();
		this.app = options.app || express();
		this.port = options.port || 5000;
		this.routeHandler = new RouteHandler(this);
		this.routesDirectory = options.routesDirectory || join(process.cwd(), 'api');
		this.baseEndpoint = options.baseEndpoint || '/';

		this.app.use((req, res, next) => {
			this.emit('routeStart', req, res);

			req.on('data', () => {
				// do nothing
			});

			req.on('end', () => this.emit('routeEnd', req, res));
			next();
		});
	}

	public init() {
		this.routeHandler.loadAll(this.routesDirectory);
		this.routeHandler.init();
		this.app.listen(this.port, () => this.emit('ready'));
	}
}
