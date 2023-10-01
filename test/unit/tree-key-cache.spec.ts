import { getProtobufjsSerializers } from 'src/get-serializers';
import { Step, Tree, TreeKeyCache, TreeKeys } from 'tree-key-cache';
import { promisify } from 'util';
import { join } from 'path';
import { loadProtoType } from 'src/load-proto-type';
import { ProtobufjsValueSerializer } from 'src/value-serializer';
import { ProtobufjsTreeSerializer } from 'src/tree-serializer';

const delay = promisify(setTimeout);

const proto = TreeKeyCache.prototype;

const protoPath = join(__dirname, './value.proto');
const lookupType = 'codibre.test_value.Value';

class MyValueSerializer extends ProtobufjsValueSerializer<{ value: number }> {
	static async load() {
		const valueProto = await loadProtoType(protoPath, lookupType);
		return MyValueSerializer.getInstance<{ value: number }>(valueProto);
	}
}

describe(TreeKeyCache.name, () => {
	let target: TreeKeyCache<{ value: number }>;
	let map: Map<string, Uint8Array>;
	let valueSerializer: MyValueSerializer;
	let treeSerializer: ProtobufjsTreeSerializer;

	beforeEach(async () => {
		valueSerializer = await MyValueSerializer.load();
		treeSerializer = await ProtobufjsTreeSerializer.getInstance();
		map = new Map([
			['a', valueSerializer.serialize({ value: 10 })],
			['a:b', valueSerializer.serialize({ value: 20 })],
			['a:b:c', valueSerializer.serialize({ value: 30 })],
			[
				'a:b:c:d',
				treeSerializer.serialize({
					[TreeKeys.value]: valueSerializer.serialize({ value: 40 }),
					[TreeKeys.children]: {
						e: {
							v: valueSerializer.serialize({ value: 50 }),
							[TreeKeys.children]: {
								f: { v: valueSerializer.serialize({ value: 60 }) },
							},
						},
					},
				} as Tree<Uint8Array>),
			],
		]);

		target = new TreeKeyCache<{ value: number }, Uint8Array>(map, {
			keyLevelNodes: 4,
			...(await getProtobufjsSerializers(protoPath, lookupType)),
		});
	});

	describe(proto.iteratePath.name, () => {
		it('should return an iterable for the values stored in partial keys and in the tree-value', async () => {
			const result: Step<{ value: number }>[] = [];

			const iterable = target.iteratePath(['a', 'b', 'c', 'd', 'e', 'f']);
			for await (const item of iterable) {
				result.push(item);
			}

			expect(result).toEqual([
				{
					key: 'a',
					level: 1,
					value: { value: 10 },
					nodeRef: expect.any(Object),
				},
				{
					key: 'b',
					level: 2,
					value: { value: 20 },
					nodeRef: expect.any(Object),
				},
				{
					key: 'c',
					level: 3,
					value: { value: 30 },
					nodeRef: expect.any(Object),
				},
				{
					key: 'd',
					level: 4,
					value: { value: 40 },
					nodeRef: expect.any(Object),
				},
				{
					key: 'e',
					level: 5,
					value: { value: 50 },
					nodeRef: expect.any(Object),
				},
				{
					key: 'f',
					level: 6,
					value: { value: 60 },
					nodeRef: expect.any(Object),
				},
			]);
		});

		it('should return an iterable for the values stored in partial keys and in the tree-value up to the matching keys', async () => {
			const result: Step<{ value: number }>[] = [];

			const iterable = target.iteratePath(['a', 'b', 'c', 'd', 'e', 'g']);
			for await (const item of iterable) {
				result.push(item);
			}

			expect(result).toEqual([
				{
					key: 'a',
					level: 1,
					value: { value: 10 },
					nodeRef: expect.any(Object),
				},
				{
					key: 'b',
					level: 2,
					value: { value: 20 },
					nodeRef: expect.any(Object),
				},
				{
					key: 'c',
					level: 3,
					value: { value: 30 },
					nodeRef: expect.any(Object),
				},
				{
					key: 'd',
					level: 4,
					value: { value: 40 },
					nodeRef: expect.any(Object),
				},
				{
					key: 'e',
					level: 5,
					value: { value: 50 },
					nodeRef: expect.any(Object),
				},
			]);
		});

		it('should return an iterable for the values stored in partial keys and in the tree-value up to the last provided level key', async () => {
			const result: Step<{ value: number }>[] = [];

			const iterable = target.iteratePath(['a', 'b', 'c', 'd', 'e']);
			for await (const item of iterable) {
				result.push(item);
			}

			expect(result).toEqual([
				{
					key: 'a',
					level: 1,
					value: { value: 10 },
					nodeRef: expect.any(Object),
				},
				{
					key: 'b',
					level: 2,
					value: { value: 20 },
					nodeRef: expect.any(Object),
				},
				{
					key: 'c',
					level: 3,
					value: { value: 30 },
					nodeRef: expect.any(Object),
				},
				{
					key: 'd',
					level: 4,
					value: { value: 40 },
					nodeRef: expect.any(Object),
				},
				{
					key: 'e',
					level: 5,
					value: { value: 50 },
					nodeRef: expect.any(Object),
				},
			]);
		});

		it('should return an iterable for the values stored in partial keys and in the tree-value up to the root tree level', async () => {
			const result: Step<{ value: number }>[] = [];

			const iterable = target.iteratePath(['a', 'b', 'c', 'd']);
			for await (const item of iterable) {
				result.push(item);
			}

			expect(result).toEqual([
				{
					key: 'a',
					level: 1,
					value: { value: 10 },
					nodeRef: expect.any(Object),
				},
				{
					key: 'b',
					level: 2,
					value: { value: 20 },
					nodeRef: expect.any(Object),
				},
				{
					key: 'c',
					level: 3,
					value: { value: 30 },
					nodeRef: expect.any(Object),
				},
				{
					key: 'd',
					level: 4,
					value: { value: 40 },
					nodeRef: expect.any(Object),
				},
			]);
		});

		it('should return an iterable for the values stored in partial keys when the provided keys got just up to there', async () => {
			const result: Step<{ value: number }>[] = [];

			const iterable = target.iteratePath(['a', 'b', 'c']);
			for await (const item of iterable) {
				result.push(item);
			}

			expect(result).toEqual([
				{
					key: 'a',
					level: 1,
					value: { value: 10 },
					nodeRef: expect.any(Object),
				},
				{
					key: 'b',
					level: 2,
					value: { value: 20 },
					nodeRef: expect.any(Object),
				},
				{
					key: 'c',
					level: 3,
					value: { value: 30 },
					nodeRef: expect.any(Object),
				},
			]);
		});
	});

	describe(proto.getNode.name, () => {
		it('should return the step at the end of the path', async () => {
			const result = await target.getNode(['a', 'b', 'c', 'd', 'e', 'f']);

			expect(result).toEqual({
				key: 'f',
				nodeRef: expect.any(Object),
				level: 6,
				value: { value: 60 },
			} as Step<{ value: number }>);
		});

		it('should return the step at the end of the path when it ends at storage level', async () => {
			const result = await target.getNode(['a', 'b', 'c']);

			expect(result).toEqual({
				key: 'c',
				nodeRef: expect.any(Object),
				level: 3,
				value: { value: 30 },
			} as Step<{ value: number }>);
		});

		it('should return the step at the end of the path when it is at the start of tree level', async () => {
			const result = await target.getNode(['a', 'b', 'c', 'd']);

			expect(result).toEqual({
				key: 'd',
				nodeRef: expect.any(Object),
				level: 4,
				value: { value: 40 },
			} as Step<{ value: number }>);
		});

		it('should return the step at the end of the path when it us at in the middle of tree level', async () => {
			const result = await target.getNode(['a', 'b', 'c', 'd', 'e']);

			expect(result).toEqual({
				key: 'e',
				nodeRef: expect.any(Object),
				level: 5,
				value: { value: 50 },
			} as Step<{ value: number }>);
		});

		it('should return undefined when a node is not found at the start of tree level', async () => {
			const result = await target.getNode(['a', 'b', 'c', 'd2']);

			expect(result).toBeUndefined();
		});

		it('should return undefined when the path does not exist at the storage level', async () => {
			const result = await target.getNode(['a', 'b2', 'c', 'd', 'e', 'f']);

			expect(result).toBeUndefined();
		});

		it('should return undefined when the path does not exist at the tree level', async () => {
			const result = await target.getNode(['a', 'b', 'c', 'd', 'e2', 'f']);

			expect(result).toBeUndefined();
		});
	});

	describe(proto.deepTreeSet.name, () => {
		let acquire: jest.SpyInstance;
		let release: jest.SpyInstance;

		beforeEach(() => {
			release = jest.fn().mockResolvedValue(undefined);
			acquire = jest
				.spyOn(target['options'].semaphore, 'acquire')
				.mockResolvedValue(release as any);
		});

		it('should add the path when some node in the key level does not exist and path goes up to key level, saving values changed during iteration', async () => {
			const iterable = target.deepTreeSet(['a', 'c', 'b'], () => ({
				value: 0,
			}));
			let first = true;

			for await (const item of iterable) {
				if (item.value && !item.value.value) {
					if (first) first = false;
					else {
						item.value.value = 99;
					}
				}
			}

			expect(
				Array.from(map.entries()).sort((a, b) => (b[0] > a[0] ? 1 : -1)),
			).toEqual(
				[
					['a:c:b', valueSerializer.serialize({ value: 99 })],
					['a:c', valueSerializer.serialize({ value: 0 })],
					[
						'a:b:c:d',
						treeSerializer.serialize({
							[TreeKeys.value]: valueSerializer.serialize({ value: 40 }),
							[TreeKeys.children]: {
								e: {
									v: valueSerializer.serialize({ value: 50 }),
									[TreeKeys.children]: {
										f: { v: valueSerializer.serialize({ value: 60 }) },
									},
								},
							},
						} as Tree<Uint8Array>),
					],
					['a:b:c', valueSerializer.serialize({ value: 30 })],
					['a:b', valueSerializer.serialize({ value: 20 })],
					['a', valueSerializer.serialize({ value: 10 })],
				].sort((a, b) => (b[0]! > a[0]! ? 1 : -1)),
			);
			expect(acquire).toHaveCallsLike(['a'], ['a:c'], ['a:c:b']);
			await delay(1);
			expect(release).toHaveCallsLike([], [], []);
		});

		it('should add the path when some node in the key level does not exist and path goes up to start tree level, saving values changed during iteration', async () => {
			const iterable = target.deepTreeSet(['a', 'c', 'b', 'd'], () => ({
				value: 0,
			}));
			let first = true;

			for await (const item of iterable) {
				if (item.value && !item.value.value) {
					if (first) first = false;
					else {
						item.value.value = 99;
					}
				}
			}

			expect(
				Array.from(map.entries()).sort((a, b) => (b[0] > a[0] ? 1 : -1)),
			).toEqual(
				[
					['a:c:b', valueSerializer.serialize({ value: 99 })],
					['a:c', valueSerializer.serialize({ value: 0 })],
					[
						'a:b:c:d',
						treeSerializer.serialize({
							[TreeKeys.value]: valueSerializer.serialize({ value: 40 }),
							[TreeKeys.children]: {
								e: {
									v: valueSerializer.serialize({ value: 50 }),
									[TreeKeys.children]: {
										f: { v: valueSerializer.serialize({ value: 60 }) },
									},
								},
							},
						} as Tree<Uint8Array>),
					],
					['a:b:c', valueSerializer.serialize({ value: 30 })],
					['a:b', valueSerializer.serialize({ value: 20 })],
					['a', valueSerializer.serialize({ value: 10 })],
					[
						'a:c:b:d',
						treeSerializer.serialize({
							v: valueSerializer.serialize({ value: 99 }),
						}),
					],
				].sort((a, b) => (b[0]! > a[0]! ? 1 : -1)),
			);
			expect(acquire).toHaveCallsLike(['a'], ['a:c'], ['a:c:b'], ['a:c:b:d']);
			await delay(1);
			expect(release).toHaveCallsLike([], [], [], []);
		});

		it('should add the path when some node in the tree level does not exist and path goes up to some tree level, saving values changed during iteration', async () => {
			const iterable = target.deepTreeSet(
				['a', 'b', 'c', 'd', 'f', 'j'],
				() => ({ value: 0 }),
			);
			let first = true;

			for await (const item of iterable) {
				if (item.value && !item.value.value) {
					if (first) first = false;
					else {
						item.value.value = 99;
					}
				}
			}

			expect(
				Array.from(map.entries()).sort((a, b) => (b[0] > a[0] ? 1 : -1)),
			).toEqual(
				[
					[
						'a:b:c:d',
						treeSerializer.serialize({
							[TreeKeys.value]: valueSerializer.serialize({ value: 40 }),
							[TreeKeys.children]: {
								e: {
									v: valueSerializer.serialize({ value: 50 }),
									[TreeKeys.children]: {
										f: { v: valueSerializer.serialize({ value: 60 }) },
									},
								},
								f: {
									v: valueSerializer.serialize({ value: 0 }),
									[TreeKeys.children]: {
										j: { v: valueSerializer.serialize({ value: 99 }) },
									},
								},
							},
						} as Tree<Uint8Array>),
					],
					['a:b:c', valueSerializer.serialize({ value: 30 })],
					['a:b', valueSerializer.serialize({ value: 20 })],
					['a', valueSerializer.serialize({ value: 10 })],
				].sort((a, b) => (b[0]! > a[0]! ? 1 : -1)),
			);
			expect(acquire).toHaveCallsLike(['a'], ['a:b'], ['a:b:c'], ['a:b:c:d']);
			await delay(1);
			expect(release).toHaveCallsLike([], [], [], []);
		});
	});

	describe(proto.setNode.name, () => {
		it('should set node at storage level', async () => {
			const result = await target.setNode(['a', 'c', 'b'], { value: 123 });

			expect(result).toBeUndefined();
			expect(
				Array.from(map.entries()).sort((a, b) => (b[0] > a[0] ? 1 : -1)),
			).toEqual(
				[
					['a:c:b', valueSerializer.serialize({ value: 123 })],
					[
						'a:b:c:d',
						treeSerializer.serialize({
							[TreeKeys.value]: valueSerializer.serialize({ value: 40 }),
							[TreeKeys.children]: {
								e: {
									v: valueSerializer.serialize({ value: 50 }),
									[TreeKeys.children]: {
										f: { v: valueSerializer.serialize({ value: 60 }) },
									},
								},
							},
						} as Tree<Uint8Array>),
					],
					['a:b:c', valueSerializer.serialize({ value: 30 })],
					['a:b', valueSerializer.serialize({ value: 20 })],
					['a', valueSerializer.serialize({ value: 10 })],
				].sort((a, b) => (b[0]! > a[0]! ? 1 : -1)),
			);
		});

		it('should set node at the start of tree level', async () => {
			const result = await target.setNode(['a', 'c', 'b', 'a'], { value: 123 });

			expect(result).toBeUndefined();
			expect(
				Array.from(map.entries()).sort((a, b) => (b[0] > a[0] ? 1 : -1)),
			).toEqual(
				[
					[
						'a:c:b:a',
						treeSerializer.serialize({
							[TreeKeys.value]: valueSerializer.serialize({ value: 123 }),
						}),
					],
					[
						'a:b:c:d',
						treeSerializer.serialize({
							[TreeKeys.value]: valueSerializer.serialize({ value: 40 }),
							[TreeKeys.children]: {
								e: {
									v: valueSerializer.serialize({ value: 50 }),
									[TreeKeys.children]: {
										f: { v: valueSerializer.serialize({ value: 60 }) },
									},
								},
							},
						} as Tree<Uint8Array>),
					],
					['a:b:c', valueSerializer.serialize({ value: 30 })],
					['a:b', valueSerializer.serialize({ value: 20 })],
					['a', valueSerializer.serialize({ value: 10 })],
				].sort((a, b) => (b[0]! > a[0]! ? 1 : -1)),
			);
		});

		it('should set node at the middle of tree level', async () => {
			const result = await target.setNode(['a', 'c', 'b', 'a', 'b'], {
				value: 123,
			});

			expect(result).toBeUndefined();
			expect(
				Array.from(map.entries()).sort((a, b) => (b[0] > a[0] ? 1 : -1)),
			).toEqual(
				[
					[
						'a:c:b:a',
						treeSerializer.serialize({
							[TreeKeys.children]: {
								b: {
									[TreeKeys.value]: valueSerializer.serialize({ value: 123 }),
								},
							},
						}),
					],
					[
						'a:b:c:d',
						treeSerializer.serialize({
							[TreeKeys.value]: valueSerializer.serialize({ value: 40 }),
							[TreeKeys.children]: {
								e: {
									v: valueSerializer.serialize({ value: 50 }),
									[TreeKeys.children]: {
										f: { v: valueSerializer.serialize({ value: 60 }) },
									},
								},
							},
						} as Tree<Uint8Array>),
					],
					['a:b:c', valueSerializer.serialize({ value: 30 })],
					['a:b', valueSerializer.serialize({ value: 20 })],
					['a', valueSerializer.serialize({ value: 10 })],
				].sort((a, b) => (b[0]! > a[0]! ? 1 : -1)),
			);
		});

		it('should not set node at the start of storage level when value is undefined', async () => {
			const result = await target.setNode(
				['a', 'c', 'b', 'a'],
				undefined as any,
			);

			expect(result).toBeUndefined();
			expect(
				Array.from(map.entries()).sort((a, b) => (b[0] > a[0] ? 1 : -1)),
			).toEqual(
				[
					[
						'a:b:c:d',
						treeSerializer.serialize({
							[TreeKeys.value]: valueSerializer.serialize({ value: 40 }),
							[TreeKeys.children]: {
								e: {
									v: valueSerializer.serialize({ value: 50 }),
									[TreeKeys.children]: {
										f: { v: valueSerializer.serialize({ value: 60 }) },
									},
								},
							},
						} as Tree<Uint8Array>),
					],
					['a:b:c', valueSerializer.serialize({ value: 30 })],
					['a:b', valueSerializer.serialize({ value: 20 })],
					['a', valueSerializer.serialize({ value: 10 })],
				].sort((a, b) => (b[0]! > a[0]! ? 1 : -1)),
			);
		});

		it('should not set node at the start of tree level when value is undefined', async () => {
			const result = await target.setNode(
				['a', 'c', 'b', 'a'],
				undefined as any,
			);

			expect(result).toBeUndefined();
			expect(
				Array.from(map.entries()).sort((a, b) => (b[0] > a[0] ? 1 : -1)),
			).toEqual(
				[
					[
						'a:b:c:d',
						treeSerializer.serialize({
							[TreeKeys.value]: valueSerializer.serialize({ value: 40 }),
							[TreeKeys.children]: {
								e: {
									v: valueSerializer.serialize({ value: 50 }),
									[TreeKeys.children]: {
										f: { v: valueSerializer.serialize({ value: 60 }) },
									},
								},
							},
						} as Tree<Uint8Array>),
					],
					['a:b:c', valueSerializer.serialize({ value: 30 })],
					['a:b', valueSerializer.serialize({ value: 20 })],
					['a', valueSerializer.serialize({ value: 10 })],
				].sort((a, b) => (b[0]! > a[0]! ? 1 : -1)),
			);
		});

		it('should not set node at the middle of tree level when value is undefined', async () => {
			const result = await target.setNode(
				['a', 'c', 'b', 'a', 'b'],
				undefined as any,
			);

			expect(result).toBeUndefined();
			expect(
				Array.from(map.entries()).sort((a, b) => (b[0] > a[0] ? 1 : -1)),
			).toEqual(
				[
					[
						'a:b:c:d',
						treeSerializer.serialize({
							[TreeKeys.value]: valueSerializer.serialize({ value: 40 }),
							[TreeKeys.children]: {
								e: {
									v: valueSerializer.serialize({ value: 50 }),
									[TreeKeys.children]: {
										f: { v: valueSerializer.serialize({ value: 60 }) },
									},
								},
							},
						} as Tree<Uint8Array>),
					],
					['a:b:c', valueSerializer.serialize({ value: 30 })],
					['a:b', valueSerializer.serialize({ value: 20 })],
					['a', valueSerializer.serialize({ value: 10 })],
				].sort((a, b) => (b[0]! > a[0]! ? 1 : -1)),
			);
		});
	});

	describe(proto.fullTreeSet.name, () => {
		let acquire: jest.SpyInstance;
		let release: jest.SpyInstance;

		beforeEach(() => {
			release = jest.fn().mockResolvedValue(undefined);
			acquire = jest
				.spyOn(target['options'].semaphore, 'acquire')
				.mockResolvedValue(release as any);
		});

		it('should update each tree node on storage', async () => {
			const tree: Tree<{ value: number }> = {
				[TreeKeys.children]: {
					a: {
						v: { value: 11 },
						[TreeKeys.children]: {
							b: {
								[TreeKeys.children]: {
									c: {
										v: { value: 30 },
										[TreeKeys.children]: {
											d: {
												[TreeKeys.children]: {
													e: {
														v: { value: 50 },
														[TreeKeys.children]: {
															f: {
																v: { value: 61 },
															},
														},
													},
												},
											},
										},
									},
								},
							},
						},
					},
				},
			};
			const iterable = target.fullTreeSet(tree, () => ({
				value: 0,
			}));
			let first = true;

			for await (const item of iterable) {
				if (!item.value?.value) {
					if (first) first = false;
					else if (item.value) {
						item.value.value = 99;
					}
				}
			}

			expect(
				Array.from(map.entries()).sort((a, b) => (b[0] > a[0] ? 1 : -1)),
			).toEqual(
				[
					[
						'a:b:c:d',
						treeSerializer.serialize({
							[TreeKeys.value]: valueSerializer.serialize({ value: 40 }),
							[TreeKeys.children]: {
								e: {
									v: valueSerializer.serialize({ value: 50 }),
									[TreeKeys.children]: {
										f: { v: valueSerializer.serialize({ value: 61 }) },
									},
								},
							},
						} as Tree<Uint8Array>),
					],
					['a:b:c', valueSerializer.serialize({ value: 30 })],
					['a:b', valueSerializer.serialize({ value: 20 })],
					['a', valueSerializer.serialize({ value: 11 })],
				].sort((a, b) => (b[0]! > a[0]! ? 1 : -1)),
			);
			expect(acquire).toHaveCallsLike(['a'], ['a:b'], ['a:b:c'], ['a:b:c:d']);
			await delay(1);
			expect(release).toHaveCallsLike([], [], [], []);
		});

		it('should update each tree node on storage and add any non existing node', async () => {
			const tree: Tree<{ value: number }> = {
				[TreeKeys.children]: {
					a: {
						v: { value: 11 },
						[TreeKeys.children]: {
							b1: {
								[TreeKeys.children]: {
									c1: {
										v: { value: 30 },
										[TreeKeys.children]: {
											d1: {
												[TreeKeys.children]: {
													e1: {
														v: { value: 50 },
														[TreeKeys.children]: {
															f1: {
																v: { value: 61 },
															},
														},
													},
												},
											},
										},
									},
								},
							},
						},
					},
				},
			};
			const iterable = target.fullTreeSet(tree, () => ({
				value: 0,
			}));
			let first = true;

			for await (const item of iterable) {
				if (!item.value?.value) {
					if (first) first = false;
					else if (item.value) {
						item.value.value = 99;
					}
				}
			}

			expect(
				Array.from(map.entries()).sort((a, b) => (b[0] > a[0] ? 1 : -1)),
			).toEqual(
				[
					[
						'a:b:c:d',
						treeSerializer.serialize({
							[TreeKeys.value]: valueSerializer.serialize({ value: 40 }),
							[TreeKeys.children]: {
								e: {
									v: valueSerializer.serialize({ value: 50 }),
									[TreeKeys.children]: {
										f: { v: valueSerializer.serialize({ value: 60 }) },
									},
								},
							},
						} as Tree<Uint8Array>),
					],
					['a:b:c', valueSerializer.serialize({ value: 30 })],
					['a:b', valueSerializer.serialize({ value: 20 })],
					['a', valueSerializer.serialize({ value: 11 })],
					[
						'a:b1:c1:d1',
						treeSerializer.serialize({
							c: {
								e1: {
									v: valueSerializer.serialize({ value: 50 }),
									c: { f1: { v: valueSerializer.serialize({ value: 61 }) } },
								},
							},
						}),
					],
					['a:b1:c1', valueSerializer.serialize({ value: 30 })],
					['a:b1', valueSerializer.serialize({ value: 0 })],
				].sort((a, b) => (b[0]! > a[0]! ? 1 : -1)),
			);
			expect(acquire).toHaveCallsLike(
				['a'],
				['a:b1'],
				['a:b1:c1'],
				['a:b1:c1:d1'],
			);
			await delay(1);
			expect(release).toHaveCallsLike([], [], [], []);
		});
	});
});
