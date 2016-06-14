import path from 'path';
import test from 'ava';
import expect from 'unexpected';
import execa from 'execa';

const cwd = process.cwd();
const cli = path.resolve(cwd, './cli.js');

test('main browser', async () => {
	const {stdout: actual} = await execa(cli, ['./fixtures/browser-package']);
	const expected = 'browser-package/browser.js';
	expect(actual, 'to end with', expected);
});

test('main node', async () => {
	const {stdout: actual} = await execa(cli, ['./fixtures/package']);
	const expected = 'package/index.js';
	expect(actual, 'to end with', expected);
});

test('--browser', async () => {
	const {stdout: actual} = await execa(cli, ['./fixtures/browser-package', '-b', 'jsnext:main']);
	const expected = 'browser-package/index.js';
	expect(actual, 'to end with', expected);
});

test('--basedir', async () => {
	const {stdout: actual} = await execa(cli, ['./browser-package', '-d', './fixtures']);
	const expected = 'browser-package/browser.js';
	expect(actual, 'to end with', expected);
});

test('--extensions', async () => {
	const {stdout: actual} = await execa(cli, ['./fixtures/browser-package', '-e', '.mjs']);
	const expected = 'browser-package/browser.mjs';
	expect(actual, 'to end with', expected);
});

test('--module-directory', async () => {
	const {stdout: actual} = await execa(cli, ['browser-package', '-m', './fixtures']);
	const expected = 'fixtures/browser-package/browser.js';
	expect(actual, 'to end with', expected);
});

test('--paths', async () => {
	const {stdout: actual} = await execa(cli, ['browser-package', '-p', './fixtures']);
	const expected = 'fixtures/browser-package/browser.js';
	expect(actual, 'to end with', expected);
});

test('--extensions and --browser flag', async () => {
	const {stdout: actual} = await execa(cli, ['./fixtures/browser-package', '-e', '.mjs', '-b', 'jsnext:main']);
	const expected = 'browser-package/index.mjs';
	expect(actual, 'to end with', expected);
});

test('--module-directory and --paths', async () => {
	const {stdout: actual} = await execa(cli, ['browser-package', '-m', './non-existing', '-p', './fixtures']);
	const expected = 'fixtures/browser-package/browser.js';
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
		expect(error.code, 'to be', 1);
	}
});

test('faulty --basedir flag', async t => {
	try {
		await execa(cli, ['./fixtures/browser-package', '-d', 'foo', '-d', 'bar']);
		t.fail('is expected to fail');
	} catch (error) {
		const expected = '--basedir flag must be string';
		const [actual] = error.stderr.split('\n');
		expect(actual, 'to contain', expected);
		expect(error.stdout, 'to be empty');
		expect(error.code, 'to be', 1);
	}
});

test('faulty --extensions flag', async t => {
	try {
		await execa(cli, ['./fixtures/browser-package', '-e']);
		t.fail('is expected to fail');
	} catch (error) {
		const expected = '--extensions flag must be non-empty string or array';
		const [actual] = error.stderr.split('\n');
		expect(actual, 'to contain', expected);
		expect(error.stdout, 'to be empty');
		expect(error.code, 'to be', 1);
	}
});

test('faulty --module-directory flag', async t => {
	try {
		await execa(cli, ['./fixtures/browser-package', '-m']);
		t.fail('is expected to fail');
	} catch (error) {
		const expected = '--module-directory flag must be non-empty string or array';
		const [actual] = error.stderr.split('\n');
		expect(actual, 'to contain', expected);
		expect(error.stdout, 'to be empty');
		expect(error.code, 'to be', 1);
	}
});

test('faulty --paths flag', async t => {
	try {
		await execa(cli, ['./fixtures/browser-package', '-p']);
		t.fail('is expected to fail');
	} catch (error) {
		const expected = '--paths flag must be non-empty string or array';
		const [actual] = error.stderr.split('\n');
		expect(error.stdout, 'to be empty');
		expect(actual, 'to contain', expected);
		expect(error.code, 'to be', 1);
	}
});
