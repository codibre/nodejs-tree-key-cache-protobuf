import { Type } from 'protobufjs';
import { Serializer } from 'tree-key-cache';

export class ProtobufjsSerializer<TValue extends object>
	implements Serializer<TValue, Uint8Array>
{
	protected constructor(private readonly type: Type) {}

	serialize(a: TValue): Uint8Array {
		return this.type.encode(this.type.fromObject(a)).finish();
	}

	deserialize(b: Uint8Array): TValue {
		return this.type.toObject(this.type.decode(b)) as TValue;
	}
}
