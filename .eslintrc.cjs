module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
	plugins: ['@typescript-eslint', 'import'],
	ignorePatterns: ['*.cjs', '.temp/**/*'],
	env: {
		browser: true,
		es2017: true,
		node: true
	},
	rules: {
		'@typescript-eslint/no-empty-function': ['error', { allow: ['arrowFunctions'] }],
		'@typescript-eslint/array-type': ['error', { default: 'array' }],
		'@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'as' }],
		'@typescript-eslint/no-empty-function': ['error', { allow: ['arrowFunctions'] }],
		'@typescript-eslint/no-unused-vars': [
			'warn', // or "error"
			{
				argsIgnorePattern: '_',
				varsIgnorePattern: '_',
				caughtErrorsIgnorePattern: '_'
			}
		],
		'@typescript-eslint/no-restricted-imports': [
			'error',
			{
				patterns: [
					{
						group: ['$app', '$app/*', '!./*', '!../*'],
						message: 'Please only use RELATIVE import paths instead.'
					}
				]
			}
		],
		'import/extensions': [
			'error',
			'always',
			{
				ignorePackages: true,
				js: 'always',
				ts: 'never'
			}
		],
		'no-console': ['error', { allow: ['warn', 'error'] }],
		'no-restricted-imports': [
			'warn',
			{
				paths: [
					{
						name: '.',
						message: 'Usage of local index imports is not allowed.'
					},
					{
						name: './index',
						message: 'Import from the source file instead.'
					}
				]
			}
		]
	}
};
