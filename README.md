[![Actions Status](https://github.com/Codibre/nodejs-tree-key-cache-protobuf/workflows/build/badge.svg)](https://github.com/Codibre/nodejs-tree-key-cache-protobuf/actions)
[![Actions Status](https://github.com/Codibre/nodejs-tree-key-cache-protobuf/workflows/test/badge.svg)](https://github.com/Codibre/nodejs-tree-key-cache-protobuf/actions)
[![Actions Status](https://github.com/Codibre/nodejs-tree-key-cache-protobuf/workflows/lint/badge.svg)](https://github.com/Codibre/nodejs-tree-key-cache-protobuf/actions)
[![Test Coverage](https://api.codeclimate.com/v1/badges/bd00aed89b99e06f01fb/test_coverage)](https://codeclimate.com/github/Codibre/nodejs-tree-key-cache-protobuf/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/bd00aed89b99e06f01fb/maintainability)](https://codeclimate.com/github/Codibre/nodejs-tree-key-cache-protobuf/maintainability)
[![Packages](https://david-dm.org/Codibre/nodejs-tree-key-cache-protobuf.svg)](https://david-dm.org/Codibre/nodejs-tree-key-cache-protobuf)
[![npm version](https://badge.fury.io/js/%40tree-key-cache%2Fprotobuf.svg)](https://badge.fury.io/js/%40tree-key-cache%2Fprotobuf)

Protobuf tree serializer fot tree-key-cache

## How to Install

```
npm i @tree-key-cache/protobuf
```


## How to use it

First, declare the proto file for the object you want to be the cache value:

```proto
syntax = "proto3";
package codibre.test_value;

message Value {
  int32 value = 1;
}
```

Then, instantiate TreeKeyCache passing the proto path to **getProtobufjsSerializers** with the full lookup type path:

```ts
const protoPath = join(process.cwd(), 'proto/value.proto');
const lookupType = 'codibre.test_value.Value';

target = new TreeKeyCache<{ value: number }, Uint8Array>(
			map,
			{
				keyLevelNodes: 4,
				...(await getProtobufjsSerializers(protoPath, lookupType)),
			},
		);
```

And that's it! You now have a TreeKeyCache instance that serializes and deserializes using protobuf, which will save you a lot of space!

## License

Licensed under [MIT](https://en.wikipedia.org/wiki/MIT_License).
