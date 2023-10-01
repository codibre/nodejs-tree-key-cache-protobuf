import { TreeKeys } from 'tree-key-cache';
import protobuf from 'protobufjs';
import { join } from 'path';
import { gzipSync } from 'zlib';

describe('proto', () => {
	it('should convert tree to proto and the other way around', async () => {
		const tree = {
			[TreeKeys.value]: Buffer.from([1, 2]) as string | Buffer,
			[TreeKeys.children]: {
				a: {
					[TreeKeys.value]: Buffer.from([3, 4]) as string | Buffer,
					[TreeKeys.children]: {
						a1: {
							[TreeKeys.value]: Buffer.from([5, 6]) as string | Buffer,
						},
					},
				},
				b: {
					[TreeKeys.value]: Buffer.from([5, 6]) as string | Buffer,
					[TreeKeys.children]: {
						b1: {
							[TreeKeys.value]: Buffer.from([7, 8]) as string | Buffer,
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
		tree[TreeKeys.value] = '12';
		tree[TreeKeys.children].a[TreeKeys.value] = '34';
		tree[TreeKeys.children].b[TreeKeys.value] = '56';
		tree[TreeKeys.children].a[TreeKeys.children].a1[TreeKeys.value] = '56';
		tree[TreeKeys.children].b[TreeKeys.children].b1[TreeKeys.value] = '78';
		const originalLength = JSON.stringify(tree).length;
		expect(encoded.length).toBeLessThan(originalLength);
		const zippedLength = gzipSync(encoded).length;
		const originalZippedLength = gzipSync(JSON.stringify(tree)).length;
		expect(zippedLength).toBeLessThan(originalZippedLength);
	});
});
