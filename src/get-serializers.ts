import { Type } from 'protobufjs';
import { KeyTreeCacheOptions } from 'tree-key-cache';
import { ProtobufjsTreeSerializer } from './tree-serializer';
import { ProtobufjsValueSerializer } from './value-serializer';

export type ProtobufjsTreeKeyCacheOptions<TValue extends object> = Pick<
	KeyTreeCacheOptions<TValue, Uint8Array>,
	'treeSerializer' | 'valueSerializer'
>;

export function getProtobufjsSerializers<TValue extends object>(
	path: string,
	lookup: string,
): Promise<ProtobufjsTreeKeyCacheOptions<TValue>>;
export function getProtobufjsSerializers<TValue extends object>(
	type: Type,
): Promise<ProtobufjsTreeKeyCacheOptions<TValue>>;
export async function getProtobufjsSerializers<TValue extends object>(
	pathOrType: string | Type,
	lookup?: string,
): Promise<ProtobufjsTreeKeyCacheOptions<TValue>> {
	return {
		treeSerializer: await ProtobufjsTreeSerializer.getInstance(),
		valueSerializer: await ProtobufjsValueSerializer.getInstance(
			pathOrType,
			lookup,
		),
	};
}
