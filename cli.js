#!/usr/bin/env node
'use strict';

const browserResolveNodeback = require('browser-resolve');
const denodeify = require('denodeify');
const camelCase = require('lodash').camelCase;
const kebabCase = require('lodash').kebabCase;
const mapKeys = require('lodash').mapKeys;
const omit = require('lodash').omit;
const omitBy = require('lodash').omitBy;
const meow = require('meow');

const browserResolve = denodeify(browserResolveNodeback);

const aliases = {
	b: 'browser',
	d: 'basedir',
	e: 'extensions',
	m: 'module-directory',
	p: 'paths'
};

const cli = meow(`
	Usage
		$ browser-resolve [options] <input>
	
	Options
		-b, --browser           Property to use from package.json for lookups, defaults to browser
		-d, --basedir           Directory to resolve from, defaults to CWD
		-e, --extensions        Extensions to search in order, repeat for mulitple paths
		-m, --module-directory  Directories to use for module lookups, defaults to node_modules, repeat for multiple directories
		-p, --paths             Paths to search if nothing is found in modules directory, repeat for multiple paths

	Examples
		# Check on the entry file of React
		browser-resolve patternplate
		node_modules/react/react.js

		# Force node resolving
		browser-resolve --browser=main isomorphic-fetch
		node_modules/isomorphic-fetch/fetch-npm-node.js

		# Resolve for rollup
		browser-resolve --browser=jsnext:main redux
		node_modules/redux/es/index.js

		# Create a standalone bundle for a library
		browserify -s jogwheel $(browser-resolve jogwheel) > jogwheel.bundle.js
`, {
	alias: aliases,
	string: ['browser', 'basedir', 'extensions', 'module-directory', 'paths']
});

class CliError extends Error {
	constructor(message) {
		super(message);
		this.name = 'CliError';
	}
}

function normalizeToString(options, propertyName, flag) {
	if ((propertyName in options) === false) {
		return undefined;
	}

	const propertyValue = options[propertyName];
	const flagName = flag || kebabCase(propertyName);

	if (typeof propertyValue === 'string') {
		return propertyValue;
	}

	throw new CliError(`--${flagName} flag must be string, received ${typeof propertyValue}`);
}

function normalizeToArray(options, propertyName, flag) {
	if ((propertyName in options) === false) {
		return undefined;
	}

	const propertyValue = options[propertyName];
	const flagName = flag || kebabCase(propertyName);

	const arrayifed = Array.isArray(propertyValue) ?
		propertyValue :
		[propertyValue];

	const normalized = arrayifed.filter(Boolean);

	if (normalized.length > 0) {
		return normalized;
	}

	throw new CliError(`--${flagName} flag must be non-empty string or array`);
}

function normalizeOptions(options) {
	// omit short alias variants
	const purged = omit(options, Object.keys(aliases));

	// convert kebab- to camelCase keys
	const converted = mapKeys(purged, (_, propertName) => camelCase(propertName));

	// normalize all options
	const normalized = {
		browser: normalizeToString(converted, 'browser'),
		basedir: normalizeToString(converted, 'basedir'),
		extensions: normalizeToArray(converted, 'extensions'),
		moduleDirectory: normalizeToArray(converted, 'moduleDirectory'),
		paths: normalizeToArray(converted, 'paths')
	};

	// omit undefined properties
	return omitBy(normalized, propertyValue => {
		return typeof propertyValue === 'undefined';
	});
}

function main(id, options) {
	if (typeof id !== 'string') {
		return cli.showHelp(1);
	}

	return new Promise(resolve => {
		const normalized = normalizeOptions(options);
		const resolving = browserResolve(id, normalized);
		resolve(resolving);
	});
}

main(cli.input[0], cli.flags)
	.then(result => {
		console.log(result);
	})
	.catch(error => {
		if (error instanceof CliError) {
			console.error(`${error.name}: ${error.message}`);
			console.error(cli.help);
			process.exit(1);
			return;
		}
		setTimeout(() => {
			throw error;
		});
	});
