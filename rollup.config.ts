import typescript from 'rollup-plugin-typescript2';
import terser from '@rollup/plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { defineConfig } from 'rollup';
import { babel } from '@rollup/plugin-babel';
import { externalNativeImport, makeCTSdeclarationCopies } from './build-utils/index.js';

const commonBaseConfig = {
	input: 'src/main.ts',
	watch: {
		buildDelay: 500
	}
};

const commonOutputConfig = {
	preserveModules: true,
	preserveModulesRoot: 'src'
};

const getPlugins = (outDir: string, format?: 'esm' | 'cjs' | 'umd') => {
	return [
		resolve({ browser: true }), // tells Rollup how to find modules in node_modules
		typescript({
			tsconfig: 'tsconfig.json',
			useTsconfigDeclarationDir: true,
			tsconfigDefaults: {
				compilerOptions: {
					plugins: [{ transform: 'typescript-transform-paths' }, { transform: 'typescript-transform-paths', afterDeclarations: true }]
				}
			},
			tsconfigOverride: {
				compilerOptions: {
					rootDir: 'src',
					declaration: true,
					declarationDir: outDir,
					noUnusedLocals: process.env.NODE_ENV !== 'development',
					outDir: 'temp' // Temporarily set to another directory
				},
				exclude: ['rollup.config.ts']
			}
		}), // compiles TypeScript to JavaScript
		...(format === 'cjs' ? [makeCTSdeclarationCopies()] : []), // copies .d.ts files to .d.cts files
		commonjs({
			ignoreTryCatch: false,
			include: 'node_modules/**'
		}), // converts CommonJS modules to ES6, so they can be included in a Rollup bundle
		externalNativeImport(), // replaces `import 'external-module'` with `import 'external-module/index.js'`
		babel({
			babelHelpers: 'bundled',
			exclude: 'node_modules/**',
			presets: ['@babel/preset-env']
		}), // transpiles your JavaScript code to ensure compatibility with older browsers
		terser({ module: true, output: { comments: 'some' } }) // minifies the output, removing whitespace and shortening variable names
	];
};

export default defineConfig([
	{
		/**
		 * NPM bundles. They have all the dependencies excluded for end code size optimization.
		 */
		...commonBaseConfig,
		output: [
			// ESM for usage with `import` or `import type`
			{
				...commonOutputConfig,
				format: 'esm',
				dir: 'dist/esm',
				entryFileNames: chunkInfo => {
					if (chunkInfo.name.includes('node_modules')) {
						return chunkInfo.name.replace('node_modules', 'external') + '.js';
					}

					return '[name].js';
				}
			}
		],
		plugins: getPlugins('dist/types')
	},
	{
		...commonBaseConfig,
		output: [
			// CJS for usage with `require()`
			{
				...commonOutputConfig,
				format: 'cjs',
				dir: 'dist/cjs',
				entryFileNames: chunkInfo => {
					if (chunkInfo.name.includes('node_modules')) {
						return chunkInfo.name.replace('node_modules', 'external') + '.cjs';
					}

					return '[name].cjs';
				}
			}
		],
		plugins: [...getPlugins('dist/types', 'cjs')]
	},
	/**
	 * Browser bundles. They have all the dependencies included for convenience.
	 */
	{
		...commonBaseConfig,
		output: [
			// UMD for users who use Require.js or Electron and want to leverage them
			{
				dir: 'dist/umd',
				format: 'umd',
				entryFileNames: ({ name }) => `${name}.js`,
				name: 'GlobalMasonry'
			}
		],
		plugins: getPlugins('dist/types')
	}
]);
