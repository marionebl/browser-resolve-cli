import os from 'os';
import path, {sep} from 'path';
import test from 'ava';
import expect from 'unexpected';
import execa from 'execa';

const cwd = process.cwd();
const cli = path.resolve(cwd, './cli.js');

const browserPackage = `./fixtures/browser-package`;
const nodePackage = `./fixtures/package`;

function unipath(pieces, ...substitutions) {
	const result = pieces.reduce((registry, piece, index) => {
		return [...registry, piece, substitutions[index]];
	}, []);

	return result
		.filter(Boolean)
		.join('')
		.split(/[\/|\\]/)
		.join(sep);
}

function unierror(code) {
	const codes = {
		1: 'ENOENT'
	};
	if (os.platform() === 'win32') {
		return codes[code];
	}
	return code;
}

test('main browser', async () => {
	const {stdout: actual} = await execa(cli, [browserPackage]);
	const expected = unipath`browser-package/browser.js`;
	expect(actual, 'to end with', expected);
});

test('main node', async () => {
	const {stdout: actual} = await execa(cli, [nodePackage]);
	const expected = unipath`package/index.js`;
	expect(actual, 'to end with', expected);
});

test('--browser', async () => {
	const {stdout: actual} = await execa(cli, [browserPackage, '-b', 'jsnext:main']);
	const expected = unipath`browser-package/index.js`;
	expect(actual, 'to end with', expected);
});

test('--basedir', async () => {
	const {stdout: actual} = await execa(cli, [`./browser-package`, '-d', unipath`./fixtures`]);
	const expected = unipath`browser-package/browser.js`;
	expect(actual, 'to end with', expected);
});

test('--extensions', async () => {
	const {stdout: actual} = await execa(cli, [browserPackage, '-e', '.mjs']);
	const expected = unipath`browser-package/browser.mjs`;
	expect(actual, 'to end with', expected);
});

test('--module-directory', async () => {
	const {stdout: actual} = await execa(cli, ['browser-package', '-m', unipath`./fixtures`]);
	const expected = unipath`fixtures/browser-package/browser.js`;
	expect(actual, 'to end with', expected);
});

test('--paths', async () => {
	const {stdout: actual} = await execa(cli, ['browser-package', '-p', unipath`./fixtures`]);
	const expected = unipath`fixtures/browser-package/browser.js`;
	expect(actual, 'to end with', expected);
});

test('--extensions and --browser flag', async () => {
	const {stdout: actual} = await execa(cli, [browserPackage, '-e', '.mjs', '-b', 'jsnext:main']);
	const expected = unipath`fixtures/browser-package/index.mjs`;
	expect(actual, 'to end with', expected);
});

test('--module-directory and --paths', async () => {
	const {stdout: actual} = await execa(cli, ['browser-package', '-m', unipath`./non-existing`, '-p', unipath`./fixtures`]);
	const expected = unipath`fixtures/browser-package/browser.js`;
	expect(actual, 'to end with', expected);
});

test('faulty --browser flag', async t => {
	try {
		await execa(cli, ['./fixtures/browser-package', '-b', 'foo', '-b', 'bar']);
		t.fail('is expected to fail');
	} catch (error) {
		const expected = '--browser flag must be string';
		const [actual] = error.stderr.split('\n');
		expect(actual, 'to contain', expected);
		expect(error.stdout, 'to be empty');
		expect(error.code, 'to be', unierror(1));
	}
});

test('faulty --basedir flag', async t => {
	try {
		await execa(cli, [browserPackage, '-d', 'foo', '-d', 'bar']);
		t.fail('is expected to fail');
	} catch (error) {
		const expected = '--basedir flag must be string';
		const [actual] = error.stderr.split('\n');
		expect(actual, 'to contain', expected);
		expect(error.stdout, 'to be empty');
		expect(error.code, 'to be', unierror(1));
	}
});

test('faulty --extensions flag', async t => {
	try {
		await execa(cli, [browserPackage, '-e']);
		t.fail('is expected to fail');
	} catch (error) {
		const expected = '--extensions flag must be non-empty string or array';
		const [actual] = error.stderr.split('\n');
		expect(actual, 'to contain', expected);
		expect(error.stdout, 'to be empty');
		expect(error.code, 'to be', unierror(1));
	}
});

test('faulty --module-directory flag', async t => {
	try {
		await execa(cli, [browserPackage, '-m']);
		t.fail('is expected to fail');
	} catch (error) {
		const expected = '--module-directory flag must be non-empty string or array';
		const [actual] = error.stderr.split('\n');
		expect(actual, 'to contain', expected);
		expect(error.stdout, 'to be empty');
		expect(error.code, 'to be', unierror(1));
	}
});

test('faulty --paths flag', async t => {
	try {
		await execa(cli, [browserPackage, '-p']);
		t.fail('is expected to fail');
	} catch (error) {
		const expected = '--paths flag must be non-empty string or array';
		const [actual] = error.stderr.split('\n');
		expect(error.stdout, 'to be empty');
		expect(actual, 'to contain', expected);
		expect(error.code, 'to be', unierror(1));
	}
});
