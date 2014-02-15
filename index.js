var fs = require('fs');
var path = require('path');

var cache = Object.create(null);

// get a lazy loading accessor method
function getLoader(v) {
	return function (id) {
		// allow override
		id = id || v;

		if (!id) {
			throw new Error('pass the id of a schema to get');
		}

		if (id in cache) {
			return cache[id];
		}
		var schema = JSON.parse(fs.readFileSync(path.join(id, 'schema.json'), 'utf8'));
		cache[id] = schema;
		return schema;
	};
}

module.exports = {
	get: getLoader('v1')
};
