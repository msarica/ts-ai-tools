import { Node } from './node';

import m from 'memoizee';

const memoizedValues: any = {};

let fromCache = 0;
let firstTime = 0;
/**
 * Memoize fn: make it remember the computed value for any argument list.
    If slot is specified, store result in that slot of first argument.
    If slot is false, use lru_cache for caching the values.
 * @param fn 
 * @param slot 
 * @param maxSize 
 */
export function memoize(fn: Function, slot: string): Function {
	return m(fn as any);
	// const memoized_fn = function (...args: any[]) {
	// 	const str = slot + args.toString();
	// 	if (memoizedValues[str]) {
	// 		fromCache += 1;
	// 		return memoizedValues[str];
	// 	}

	// 	firstTime += 1;
	// 	const result = fn(...args);

	// 	memoizedValues[str] = result;
	// 	return result;
	// };

	// return memoized_fn;
}

export function show() {
	console.log(`first time:`, firstTime);
	console.log('cache', fromCache);
}

export class NodeArray extends Array {
	// list: Node[] = [];
	map_ = new Map();

	constructor(array: Node[] = []) {
		super();
		this.push(...array);
	}

	push(...x: Node[]) {
		x.forEach((xx) => this.map_.set(xx.hash(), true));
		return super.push(...x);
	}

	has(x: Node) {
		return this.map_.has(x.hash());
		// return this.some((z: Node) => z.equalsTo(x));
	}

	delete(x: Node) {
		this.map_.delete(x.hash());
		const i = this.findIndex((ii: Node) => ii.equalsTo(x));

		return this.splice(i, 0);
	}
}

/**
 * A Queue in which the minimum (or maximum) element (as determined by f and
    order) is returned first.
    If order is 'min', the item with minimum f(x) is
    returned first; if order is 'max', then it is the item with maximum f(x).
    Also supports dict-like lookup.
 */
export class PriorityQueue<T> {
	heap: {
		sortValue: number;
		insertOrder: number;
		obj: T;
	}[] = [];

	heapMap = new Map();

	counter = 0;

	get length() {
		return this.heap.length;
	}

	constructor(
		public order: 'min' | 'max' = 'min',
		public f: Function,
		public eq: (o1: T, o2: T) => boolean,
		public hashFn: (o: T) => string
	) {
		// super();
		// if (order === 'min') {
		// 	this.f = f;
		// } else if (order === 'max') {
		// 	this.f = (x: any) => -f(x);
		// } else {
		// 	throw new Error('Order must be min or max');
		// }
	}

	has(x: any) {
		return this.heapMap.has(x.toString());
		// return this.heap.some((i) => this.eq(i.obj, x));
	}

	sortValue(x: T) {
		const xx = this.heap.find((i) => this.eq(i.obj, x));
		if (!xx) return -1;

		return xx.sortValue;
	}

	push(...x: T[]) {
		const r = (xx: T) => {
			this.counter += 1;
			const v = this.f(xx);
			const obj = {
				sortValue: v,
				insertOrder: this.counter,
				obj: xx,
			};

			this.heapMap.set(this.hashFn(xx), true);
			for (let i = 0; i < this.heap.length; i++) {
				const o = this.heap[i];

				if (v < o.sortValue) {
					this.heap.splice(i, 0, obj);
					return;
				}
			}
			this.heap.push(obj);
		};
		x.forEach((xx) => r(xx));

		// this.heap.reduce((prev, cur) => {
		// 	if (prev && prev.sortValue > cur.sortValue) {
		// 		throw new Error('not sorted');
		// 	}

		// 	return cur;
		// });
	}

	remove(x: T) {
		const idx = this.heap.findIndex((i) => this.eq(i.obj, x));
		if (idx === -1) {
			return;
		}
		this.heapMap.delete(this.hashFn(x));
		this.heap.splice(idx, 1);
	}

	pop() {
		const r = this.order === 'min' ? this.heap.shift() : this.heap.pop();
		if (!r) {
			return null;
		}
		return r.obj;
	}

	show() {
		console.log(this.heap.map((i) => (i.obj as any).toString()));
	}
}

export class MSet extends Set {
	add(x: any) {
		return super.add(x.toString());
	}

	has(x: any) {
		return super.has(x.toString());
	}
}

export function argMaxRandomTie<T>(sequence: T[], fn: (s: T) => number): T {
	shuffle(sequence);

	const p = sequence
		.map((s) => ({
			obj: s,
			v: fn(s),
		}))
		.sort((a, b) => a.v - b.v)
		.pop();

	return p && (p.obj as any);
}

export function shuffle(array: any[]): void {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * i);
		const temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
}
