import * as EventEmitter from 'events';
import * as express from 'express';
import { EVENTS } from '../util/Constants';

export interface ServerOptions {
	app?: express.Express;
	baseEndpoint?: string;
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

	/** base endpoint to use */
	public baseEndpoint: string;

	/**
	 * Create new Server
	 * @param options server options
	 */
	public constructor({
		app = express(),
		port = 5000,
		baseEndpoint = '/'
	}: ServerOptions = {}) {
		super();
		this.app = app;
		this.port = port;
		this.baseEndpoint = baseEndpoint;
	}

	/**
	 * Starts the server
	 * @param port port to listen to
	 */
	public listen(port = this.port) {
		this.app.listen(port, () => this.emit(EVENTS.SERVER.READY));
	}
}
