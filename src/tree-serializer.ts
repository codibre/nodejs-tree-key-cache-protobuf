import { Tree } from 'tree-key-cache';
import { join } from 'path';
import { ProtobufjsSerializer } from './serializer';
import { loadProtoType } from './load-proto-type';

export class ProtobufjsTreeSerializer extends ProtobufjsSerializer<
	Tree<Uint8Array>
> {
	static async getInstance() {
		const type = await loadProtoType(
			join(__dirname, '../proto/tree-cache.proto'),
			'codibre.tree_cache.Tree',
		);

		return new ProtobufjsTreeSerializer(type);
	}
}
