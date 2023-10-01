import { Type } from 'protobufjs';
import { loadProtoType } from './load-proto-type';
import { ProtobufjsSerializer } from './serializer';

export class ProtobufjsValueSerializer<
	TValue extends object,
> extends ProtobufjsSerializer<TValue> {
	static getInstance<TValue extends object>(
		type: Type,
	): ProtobufjsValueSerializer<TValue>;
	static async getInstance<TValue extends object>(
		path: string,
		lookup: string,
	): Promise<ProtobufjsValueSerializer<TValue>>;
	static async getInstance<TValue extends object>(
		pathOrType: string | Type,
		lookup?: string,
	): Promise<ProtobufjsValueSerializer<TValue>>;
	static getInstance(pathOrType: string | Type, lookup?: string) {
		if (typeof pathOrType === 'string') {
			if (!lookup) {
				throw new TypeError('Lookup not informed!');
			}
			return loadProtoType(pathOrType, lookup).then((type) =>
				this.getInstance(type),
			);
		}

		return new ProtobufjsValueSerializer(pathOrType);
	}
}
