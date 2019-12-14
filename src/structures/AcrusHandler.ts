/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
import * as EventEmitter from 'events';
import { readdirSync, statSync } from 'fs';
import { extname, join } from 'path';
import { Server } from './Server';
import { AcrusModule } from './AcrusModule';
import { EVENTS } from '../util/Constants';
import AcrusError from '../util/AcrusError';

export interface AcrusHandlerOptions {
	directory?: string;
	classToHandle?: Function;
	extentions?: string[];
}

/**
 * Base Handler to load modules
 */
export abstract class AcrusHandler extends EventEmitter {
	/** Server used */
	public server: Server;

	/** directory of modules */
	public directory?: string;

	/** class to be handled */
	public classToHandle: Function;

	/** set of extentions to load */
	public extensions: Set<string>;

	/** Modules loaded */
	public modules: Map<string, AcrusModule>;

	/**
	 * Create new Handler
	 */
	public constructor(server: Server, {
		directory = join(process.cwd(), 'api'),
		classToHandle = AcrusModule,
		extentions = ['.js', '.json', '.ts']
	}: AcrusHandlerOptions = {}) {
		super();

		this.server = server;
		this.directory = directory;
		this.classToHandle = classToHandle;
		this.extensions = new Set(extentions);
		this.modules = new Map();
	}

	private findExport(m: any): Function | any {
		if (!m) return null;
		if (typeof m === 'string') return this.findExport(require(m));
		if (m.prototype instanceof this.classToHandle) return m;
		if (m.default) return this.findExport(m.default);
		return null;
	}

	public register(mod: AcrusModule, filepath: string | null) {
		this.modules.set(mod.id, mod);
		mod.handler = this;
		mod.server = this.server;
		mod.filepath = filepath;
	}

	public deregister(mod: AcrusModule) {
		if (mod.filepath) delete require.cache[require.resolve(mod.filepath)];
		this.modules.delete(mod.id);
	}

	public remove(id: string): AcrusModule {
		const mod = this.modules.get(id.toString());
		if (!mod) throw new AcrusError('MODULE_NOT_FOUND', this.classToHandle.name, id);

		this.deregister(mod);

		this.emit(EVENTS.ACRUS_HANDLER.LOAD, mod);
		return mod;
	}

	/**
	 * Load a module
	 * @param path path of module to load
	 * @returns module loaded
	 */
	public load(thing: AcrusModule | string): void {
		const isClass = typeof thing === 'function';
		if (!isClass && !this.extensions.has(extname(thing as string))) return undefined;

		let mod: any = isClass ? thing : this.findExport(thing);

		if (mod && mod.prototype instanceof this.classToHandle) {
			// @ts-ignore
			mod = new mod();
		} else {
			if (!isClass) delete require.cache[require.resolve(thing as string)];
			return undefined;
		}

		this.register((mod as AcrusModule), isClass ? null : (thing as string));
		this.emit(EVENTS.ACRUS_HANDLER.LOAD, (mod as AcrusModule));
	}

	/**
	 * Load all modules in a directory
	 * @param dir directory of modules
	 */
	public loadAll(dir = this.directory) {
		if (!dir) {
			throw new AcrusError('NO_DIRECTORY_SPECIFIED', this.classToHandle.name);
		}
		const paths = AcrusHandler.readdirRecursive(dir);
		for (const path of paths) {
			if (this.extensions.has(extname(path))) this.load(path);
		}
	}

	/**
	 * Reads files in a directory recursivly
	 * @param directory directory to get paths
	 * @returns Array of paths read
	 */
	private static readdirRecursive(directory: string): string[] {
		const result: string[] = [];

		function read(dir: string) {
			const files = readdirSync(dir);

			for (const file of files) {
				const filepath = join(dir, file);

				if (statSync(filepath).isDirectory()) {
					read(filepath);
				} else {
					result.push(filepath);
				}
			}
		}

		read(directory);

		return result;
	}
}
