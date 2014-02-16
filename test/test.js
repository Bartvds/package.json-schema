'use strict';

var Promise = require('bluebird');
var tvMod = require('tv4');
var fs = require('fs');
var path = require('path');

var reporter = require('tv4-reporter').getReporter(require('miniwrite').log(), require('ministyle').ansi());

var glob = Promise.promisify(require('glob'));
var readFile = Promise.promisify(fs.readFile);

var baseDir = __dirname;
console.log(baseDir);

var getExp = /^(.+?)[\\\/]([\w\.-]+)[\\\/]/;

var schema = require('../index');

function getPointer(definition, schema) {
	var uri = (schema && schema.id ? schema.id : '');
	if (definition) {
		return uri + '#/definitions/' + definition;
	}
	return uri ? uri : '';
}

function loadJSON(target) {
	return readFile(target, 'utf8').then(function (data) {
		return JSON.parse(data);
	});
}

function makeJob(tv4, schema, target, name, type) {
	type = type || 'pass';

	var base = path.dirname(target);
	var job = {
		tv4: tv4,
		schema: schema,
		target: target,
		type: type,
		name: name,
		label: type + '/' + name,
		jsonPath: target,
		optsPath: path.join(base, 'opts.json'),
		errorPath: path.join(base, 'error.json'),
		res: null,
		opts: null,
		error: null,
		msg: null,
		success: true
	};
	return job;
}

function runJob(job) {
	return Promise.all([
		loadJSON(job.jsonPath),
		loadJSON(job.optsPath).catch(function (err) {
			if (err.name === 'RejectionError') {
				return {};
			}
			throw err;
		}),
		loadJSON(job.errorPath).catch(function (err) {
			if (err.name === 'RejectionError') {
				return {};
			}
			throw err;
		})
	]).spread(function (json, opts, error) {
		job.json = json;
		job.opts = opts;
		job.error = error;
		job.pointer = getPointer(opts.schema, job.schema);

		console.log(job.label);

		job.res = job.tv4.validateResult(json, job.pointer, true);
		if (job.type === 'pass') {
			if (!job.res.valid || job.res.missing.length > 0) {
				job.msg = 'expected ' + job.label + ' to be valid';
				job.success = false;
			}
		}
		else if (job.type === 'fail') {
			if (job.res.valid || job.res.missing.length > 0) {
				job.msg = 'expected ' + job.label + ' to be invalid';
				job.success = false;
			}
		}
		return job;
	});
}

function run(schema) {
	var tv4 = tvMod.freshApi();
	tv4.addSchema(schema);

	return glob('*/*/package.json', {cwd: baseDir}).then(function (files) {
		return files.reduce(function (memo, file) {
			getExp.lastIndex = 0;
			var match = getExp.exec(file);
			if (!match) {
				return memo;
			}
			memo.push(makeJob(tv4, schema, path.join(baseDir, file), match[2], match[1]));
			return memo;
		}, []);
	}).then(function (jobs) {
		jobs.push(makeJob(tv4, schema, path.resolve(baseDir, '..', 'package.json'), 'self-test', 'pass'));
		return jobs;
	}).then(function (jobs) {
		return Promise.map(jobs, runJob);
	});
}

run(schema.get('v1')).then(function (res) {
	console.log('');
	var bad = res.filter(function (job) {
		return !job.success;
	});
	bad.forEach(function (job) {
		if (!job.success) {
			console.log(job.msg);
			console.log('');
			if (job.type === 'pass') {
				reporter.reportResult(reporter.createTest(job.schema, job.json, job.label, job.res, true), '   ');
				// console.log(util.inspect(job.res.error, false, 0));
			}
		}
		console.log('');
	});
	console.log('passed %d, failed %d', res.length - bad.length, bad.length);
	if (bad.length > 0) {
		process.exit(1);
	}
}).catch(function (err) {
	console.log('');
	console.log(err.stack);

	process.exit(1);
});
