import { readdirSync, statSync } from 'fs';
import { join } from 'path';

export interface BaseModule {
	id: string;
}

export interface HandlerOptions<classToHandle> {
	classToHandle?: classToHandle;
}

export abstract class Handler<T extends BaseModule> {
	public modules: Map<string, T>;
	public classToHandle?: T;

	public constructor(options: HandlerOptions<T> = {}) {
		this.modules = new Map();
		this.classToHandle = options.classToHandle;
	}

	public load(path: string): T {
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const module: T = new (require(path))();
		this.modules.set(module.id, module);
		return module;
	}

	public loadAll(dir: string) {
		const paths = this.readdirRecursive(dir);
		for (const path of paths) {
			this.load(path);
		}
	}

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
