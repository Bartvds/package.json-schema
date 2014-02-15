# package.json-schema

JSON Schema for node/npm package.json

There are a few sub-schemas defined at the following JSON Pointers:

- `#/definitions/structure`	- describes the structure but specifies no required fields.
- `#/definitions/minimal` - minimum fields (`name`, `version` etc) for node + npm.
- `#/definitions/standard` - common fields, recommended for FOSS.

The root schema is `#/definitions/standard`.

