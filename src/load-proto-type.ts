import { load } from 'protobufjs';

export async function loadProtoType(path: string, lookup: string) {
	if (!lookup) {
		throw new TypeError('Lookup not informed!');
	}
	const root = await load(path);
	return root.lookupType(lookup);
}
