# package.json-schema

[![Build Status](https://secure.travis-ci.org/Bartvds/package.json-schema.png?branch=master)](http://travis-ci.org/Bartvds/package.json-schema) [![NPM version](https://badge.fury.io/js/package.json-schema.png)](http://badge.fury.io/js/package.json-schema)

> JSON Schema for node/npm package.json


There are a few sub-schemas defined at the following JSON Pointers:


| uri | description
| :-- | :--
| `lib://package.json#/definitions/structure` | describes the structure but specifies no required fields.
| `lib://package.json#/definitions/minimal` | require minimum fields (`name`, `version` etc) for node + npm.
| `lib://package.json#/definitions/standard` | common fields, recommended for FOSS.

The root schema linked to `lib://package.json#/definitions/standard`.

The JSON Schema is [draft v4](http://json-schema.org/).

## Usage

The schema are JSON files are located in the `/v#` folders in the repo.

### npm

Most convenient way is to access is as a module:

````shell
$ npm install package.json-schema
````

Get the schema object (lazy)
````js
var schema = require('package.json-schema').get();

````

Use the schema in any standard compliant JSON Schema validator, for example using [tv4](https://npmjs.org/package/tv4):
````js
var res = tv4.validateResult(myObject, schema);
if (!res.valid) {
	// nooo..
````

If a projects uses [grunt](http://gruntjs.com) it could run [grunt-tv4](https://npmjs.org/package/grunt-tv4) in the test suite, a git hook or npm prepublish script:

````js
grunt.initConfig({
    tv4: {
        packjson: {
            options: {
                root: function() {
				    // lazy load when task is actually run
    				return require('package.json-schema').get();
	    		}
            }
            src: ['./package.json']
        }
    }
})
````


### local

Copy the JSON files from the repo and save in your project.

### remote

Ideally I'd put the JSON Schema on their own domain and use valid URIs and `$ref`-erences. But it could be bigger and add other schemas, extract the common types and setup a library of interdependent definitions.. maybe one day.

## Contributing

This is an ongoing project and contributions are very welcome. Especially fixes to tighten the schema and of course all interesting test cases.

Note combining values into micro-encoding strings is discouraged (because it makes it necessary complicated for tools to parse).

Also I'm game if anyone wants to cooperate on other similar schema's (bower etc), and maybe setup a github organisation which could also serve the http uris on github.io.

## License

Copyright (c) 2013 by [Bart van der Schoor](https://github.com/Bartvds).

Licensed under the [MIT License](https://raw.github.com/Bartvds/package.json-schema
/master/LICENSE-MIT.txt). 

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/Bartvds/package.json-schema/trend.png)](https://bitdeli.com/free "Bitdeli Badge")