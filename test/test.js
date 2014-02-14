'use strict';
var Promise = require('bluebird');
var tvMod = require('tv4')
var fs = require('fs');
var path = require('path');
var util = require('util');
var pointer = require('json-pointer');

var reporter = require('tv4-reporter').getReporter(require('miniwrite').log(), require('ministyle').ansi());

var glob = Promise.promisify(require('glob'));

var readFile = Promise.promisify(fs.readFile);

function onError(err) {
	console.log(err);
}

var baseDir = path.dirname(module.filename);
console.log(baseDir);

var getExp = /^(.+?)[\\\/]([\w\.-]+)[\\\/]/;


function getPointer(ref) {
	switch (ref) {
		case 'root':
			return '#/definitions/root';
		case 'minimal':
			return '#/definitions/minimal';
		case 'standard':
			return '#/definitions/standard';
		default:
			return '';
	}
}

function loadJSON(target) {
	return readFile(target, 'utf8').then(function (data) {
		return JSON.parse(data);
	});
}

function run(schemaPath) {
	return loadJSON(schemaPath).then(function (schema) {
		var tv4 = tvMod.freshApi();
		tv4.addSchema('', schema);
		console.log(tv4.getSchemaMap());

		return glob(path.join('*/*/package.json'), {cwd: baseDir}).then(function (files) {
			return Promise.all(files.reduce(function (memo, file) {
				getExp.lastIndex = 0;
				var match = getExp.exec(file);
				if (!match) {
					return memo;
				}
				var base = path.dirname(path.join(baseDir, file));
				console.log(file);

				var job = {
					file: file,
					schema: null,
					type: match[1],
					name: match[2],
					label: match[1] + '/' + match[2],
					jsonPath: path.join(baseDir, file),
					optsPath: path.join(base, 'opts.json'),
					errorPath: path.join(base, 'error.json'),
					res: null,
					opts: null,
					error: null,
					success: true
				};
				job.label = job.type + '/' + job.name;

				memo.push(Promise.all([
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
					}),
				]).spread(function (json, opts, error) {
					job.json = json;
					job.opts = opts;
					job.error = error;

					job.schema = schema;
					job.pointer = getPointer(opts.schema);

					job.res = tv4.validateResult(json, job.pointer);
					if (job.type === 'pass') {
						if (!job.res.valid || job.res.missing.length > 0) {
							console.log('expected ' + job.label + ' to be valid');
							job.success = false;
						}
					}
					else if (job.type === 'fail') {
						if (job.res.valid || job.res.missing.length > 0) {
							console.log('expected ' + job.label + ' to be invalid');
							job.success = false;
						}
					}
					return job;
				}));
				return memo;
			}, []));
		});
	});
}

run('v1/schema').then(function (res) {
	console.log('done!');
	// console.log(util.inspect(res, false, 2));
	res.filter(function (job) {
		return (job.success !== true);
	}).forEach(function (job) {
		reporter.reportResult(reporter.createTest(job.schema, job.json, job.label, job.res, true), '   ');
	});
}).catch(function (err) {
	console.log('error!');
	console.log(err.stack);
});
