import path from 'path';
import type { Plugin } from 'rollup';
import fs from 'fs';

export const externalNativeImport = (): Plugin => {
	return {
		name: 'external-native-import',
		async resolveId(id, importer) {
			if (id.includes('/native')) {
				const resolved = await this.resolve(id, importer!, { skipSelf: true });
				const resolvedId = resolved!.id;
				return {
					external: 'relative',
					id: resolvedId.endsWith('.js') ? resolvedId : `${resolvedId}.js`
				};
			}
		}
	};
};

const copyFilesInDirectory = (dir: string) => {
	fs.readdir(dir, (err, files) => {
		if (err) {
			return console.error('Unable to scan directory: ' + err);
		}
		files.forEach(file => {
			const fullPath = path.join(dir, file);
			fs.stat(fullPath, (err, stat) => {
				if (err) {
					console.error('Error stating file: ' + err);
					return;
				}
				if (stat.isDirectory()) {
					copyFilesInDirectory(fullPath);
				} else if (path.extname(file) === '.ts') {
					const newPath = fullPath.replace('.d.ts', '.d.cts');
					fs.copyFile(fullPath, newPath, err => {
						if (err) console.error('Error copying file: ' + err);
					});
				}
			});
		});
	});
};

export const makeCTSdeclarationCopies = (): Plugin => {
	return {
		name: 'renameCjsTypeDeclaration',
		writeBundle: {
			sequential: true,
			order: 'post',
			handler({ dir, format }) {
				if (format === 'cjs' && dir) {
					const directoryPath = path.join(process.cwd(), 'dist', 'types');
					copyFilesInDirectory(directoryPath);
				}
			}
		}
	};
};
