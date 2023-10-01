import { Tree, TreeKeys } from 'tree-key-cache';
import protobuf from 'protobufjs';
import { join } from 'path';

describe('proto', () => {
	it('should convert tree to proto and the other way around', async () => {
		const tree: Tree<Buffer> = {
			[TreeKeys.value]: Buffer.from([1, 2]),
			[TreeKeys.children]: {
				a: {
					[TreeKeys.value]: Buffer.from([3, 4]),
					[TreeKeys.children]: {
						a1: {
							[TreeKeys.value]: Buffer.from([5, 6]),
						},
					},
				},
				b: {
					[TreeKeys.value]: Buffer.from([5, 6]),
					[TreeKeys.children]: {
						b1: {
							[TreeKeys.value]: Buffer.from([7, 8]),
						},
					},
				},
			},
		};
		const type = await protobuf
			.load(join(process.cwd(), 'proto/tree-cache.proto'))
			.then((root) => root.lookupType('codibre.tree_cache.Tree'));

		const encoded = type.encode(type.fromObject(tree)).finish();
		const decoded = type.toObject(type.decode(encoded));

		expect(tree).toEqual(decoded);
		expect(encoded.length).toBeLessThan(JSON.stringify(tree).length);
	});
});
