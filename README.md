# package.json-schema

[![Build Status](https://secure.travis-ci.org/Bartvds/package.json-schema.png?branch=master)](http://travis-ci.org/Bartvds/package.json-schema) [![NPM version](https://badge.fury.io/js/package.json-schema.png)](http://badge.fury.io/js/package.json-schema)

--

JSON Schema for node/npm package.json

There are a few sub-schemas defined at the following JSON Pointers:

- `#/definitions/structure`	- describes the structure but specifies no required fields.
- `#/definitions/minimal` - minimum fields (`name`, `version` etc) for node + npm.
- `#/definitions/standard` - common fields, recommended for FOSS.

The root schema is `#/definitions/standard`.

