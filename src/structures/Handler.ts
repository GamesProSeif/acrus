import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import { Module } from './Module';

/**
 * Base Handler to load modules
 */
export abstract class Handler<T extends Module> {
	/** Modules loaded */
	public modules: Map<string, T>;

	/**
	 * Create new Handler
	 */
	public constructor() {
		this.modules = new Map();
	}

	/**
	 * Load a module
	 * @param path path of module to load
	 * @returns module loaded
	 */
	public load(path: string): T {
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const module: T = new (require(path))();
		this.modules.set(module.id, module);
		return module;
	}

	/**
	 * Load all modules in a directory
	 * @param dir directory of modules
	 */
	public loadAll(dir: string) {
		const paths = this.readdirRecursive(dir);
		for (const path of paths) {
			this.load(path);
		}
	}

	/**
	 * Reads files in a directory recursivly
	 * @param directory directory to get paths
	 * @returns Array of paths read
	 */
	public readdirRecursive(directory: string): string[] {
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
