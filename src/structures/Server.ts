import { join } from 'path';
import * as EventEmitter from 'events';
import * as express from 'express';
import * as onFinshed from 'on-finished';
import { RouteHandler } from './RouteHandler';

export interface ServerOptions {
	app?: express.Express;
	baseEndpoint?: string;
	routesDirectory?: string;
	port?: number;
}

/**
 * Main server of the application
 */
export class Server extends EventEmitter {
	/** Express app */
	public app: express.Express;

	/** port to use */
	public port: number;

	/** baseEndpoint to use */
	public baseEndpoint: string;

	/** the route handler */
	public routeHandler: RouteHandler;

	/** directory of routes */
	public routesDirectory: string;

	/**
	 * Create new Server
	 * @param options server options
	 */
	public constructor(options: ServerOptions = {}) {
		super();
		this.app = options.app || express();
		this.port = options.port || 5000;
		this.routeHandler = new RouteHandler(this);
		this.routesDirectory = options.routesDirectory || join(process.cwd(), 'api');
		this.baseEndpoint = options.baseEndpoint || '/';

		this.app.use((req, res, next) => {
			this.emit('routeStart', req, res);
			onFinshed(res, () => this.emit('routeEnd', req, res));

			next();
		});
	}

	/**
	 * Initialise server
	 */
	public init() {
		this.routeHandler.loadAll(this.routesDirectory);
		this.routeHandler.init();
		this.app.listen(this.port, () => this.emit('ready'));
	}
}
