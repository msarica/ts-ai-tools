import { Node } from './node';

import m from 'memoizee';
import { InstrumentedProblem } from './instrumented-problem';
import { Problem } from './problem.abstract';
import { expressions } from './logic/logic.vars';
import { Expr } from './logic/logic.classes';

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
		hash: string;
	}[] = [];

	heapMap = new Map();

	counter = 0;

	get length() {
		return this.heap.length;
	}

	constructor(
		public order: 'min' | 'max' = 'min',
		public f: Function,
		// public eq: (o1: T, o2: T) => boolean,
		public hashFn: (o: T) => string,
		public likeSet = false // if true, only one record key will exist
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
		return this.heapMap.has(this.hashFn(x));
	}

	sortValue(x: T) {
		const hash = this.hashFn(x);
		const xx = this.heap.find((i) => i.hash === hash);
		if (!xx) return -1;

		return xx.sortValue;
	}

	push(...x: T[]) {
		const add = (xx: T) => {
			if (this.likeSet && this.has(xx)) {
				return;
			}

			this.counter += 1;
			const v = this.f(xx);
			let hash = this.hashFn(xx);
			const obj = {
				sortValue: v,
				insertOrder: this.counter,
				obj: xx,
				hash,
			};

			this.heapMap.set(hash, true);
			for (let i = 0; i < this.heap.length; i++) {
				const o = this.heap[i];

				if (v < o.sortValue) {
					this.heap.splice(i, 0, obj);
					return;
				}
			}
			this.heap.push(obj);
		};
		x.forEach((xx) => add(xx));
	}

	remove(x: T) {
		const hash = this.hashFn(x);
		const idx = this.heap.findIndex((i) => i.hash === hash);
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
		this.heapMap.delete(this.hashFn(r.obj));
		return r.obj;
	}

	show() {
		console.log(this.heap.map((i) => (i.obj as any).toString()));
	}
}

export class SortedSet<T> extends Set<T> {
	constructor() {
		super();
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

/**
 * Return an element with highest fn(seq[i]) score; break ties at random.
 * @param sequence
 * @param fn
 */
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

/**
 * Return a minimum element of seq; break ties at random.
 * @param sequence
 * @param fn
 */
export function argMinRandomTie<T>(sequence: T[], fn: (s: T) => number): T {
	shuffle(sequence);

	let sorted = sequence
		.map((s) => ({
			obj: s,
			v: fn(s),
		}))
		.sort((a, b) => b.v - a.v);

	const p = sorted.pop();

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

export function isSameArray<T>(arr1: T[], arr2: T[]) {
	return arr1.every((v, i) => v === arr2[i]);
}

export function removeItem<T>(arr: T[], cond: T | ((a: T) => boolean)) {
	let index = -1;
	if (cond instanceof Function) {
		index = arr.findIndex((i) => cond(i));
	} else {
		index = arr.indexOf(cond);
	}

	if (index === -1) {
		return;
	}

	return arr.splice(index, 1);
}

export function compareSearchers(
	problem: Problem,
	searchers: Function[],
	actionRepresentationFn: (node: Node) => string
) {
	if (!(searchers && searchers.length)) {
		console.log('No searcher found');
		return;
	}

	// const doFn = (searcher: Function, problem: Problem) => {
	// 	const p = new InstrumentedProblem(problem);
	// 	searcher(p);
	// 	return p;
	// };

	console.log('Solving ', problem.toString());
	console.log('\n');
	const successful = [];

	console.log('searchers: ', searchers.map((s) => s.name).join(', '));

	for (const alg of searchers) {
		console.log('\n');
		console.log('* ', alg.name, ':');
		const problemWithStats = new InstrumentedProblem(problem);

		const solution = alg(problemWithStats) as Node;
		solution.printSolution(actionRepresentationFn);

		if (!solution) {
			console.log('No solution found 🙁');
			continue;
		}

		successful.push({
			name: alg.name,
			stat: problemWithStats,
		});
	}
	console.log('---------------');
	console.log('\n');

	for (let s of successful) {
		console.log(s.name, ' '.repeat(40 - s.name.length), s.stat.toString());
	}
}

/**
 * returns a new set s1-s2
 */
export function difference<T>(s1: Set<T>, s2: Set<T>) {
	const diff = new Set();
	// iterate over the values
	for (let elem of s1) {
		// if the value[i] is not present
		// in otherSet add to the differenceSet
		if (!s2.has(elem)) {
			diff.add(elem);
		}
	}

	// returns values of differenceSet
	return diff;
}

/**
 * removes s2 from s1 return the removed item set
 */
export function differenceUpdate<T>(s1: Set<T>, s2: Set<T>) {
	const diff = new Set();
	// iterate over the values
	for (let elem of s1) {
		// if the value[i] is not present
		// in otherSet add to the differenceSet
		if (!s2.has(elem)) {
			s1.delete(elem);
			diff.add(elem);
		}
	}

	// returns values of differenceSet
	return diff;
}

export function union<T>(s1: Set<T>, s2: Set<T>) {
	for (let elem of s2) {
		s1.add(elem);
	}
}

export function unionReturn<T>(s1: Set<T>, s2: Set<T>) {
	const s = new Set(s1);
	for (let elem of s2) {
		s.add(elem);
	}
	return s;
}

export function removeAll<T>(item: T, set: any) {
	if (typeof set === 'string') {
		let r = new RegExp(item as any, 'g');
		return set.replace(r, '');
	}
	if (set instanceof Set) {
		let s = new Set(set);
		s.delete(item);
		return s;
	}

	if (Array.isArray(set)) {
		return set.filter((i) => i !== item);
	}

	throw new Error('Not supported set');
}

export function isSubset<T>(s1: Set<T>, sub: Set<T>) {
	for (let elem of sub) {
		if (!s1.has(elem)) {
			return false;
		}
	}
	return true;
}

export function areTupplesEqual<T>(t1: T[], t2: T[]) {
	if (t1.length !== t2.length) return false;

	for (let i = 0; i < t1.length; i++) {
		if (t1[i] !== t2[i]) return false;
	}
	return true;
}
export class Counter<T = any> {
	protected map = new Map();
	constructor(public hasFn?: Function) {}

	private hashed(v: T) {
		return (this.hasFn && this.hasFn(v)) || v;
	}

	increment(v: T) {
		return this.increaseBy(v, 1);
	}

	decrement(v: T) {
		return this.increaseBy(v, -1);
	}

	increaseBy(v: T, increment: number) {
		let x = 0;
		v = this.hashed(v);
		if (this.map.has(v)) {
			x = this.map.get(v);
		}

		this.map.set(v, x + increment);
	}

	valueOf(v: T) {
		v = this.hashed(v);
		return this.map.get(v) || 0;
	}
}

export class DefaultDict<TKey = any, TValue = any> {
	protected map = new Map<string, Set<TValue>>();
	constructor(public hasFn?: Function) {}

	private hashed(v: TKey): string {
		return (this.hasFn && this.hasFn(v)) || v;
	}

	get(v: TKey) {
		let vv = this.hashed(v) as string;
		let s: Set<TValue>;
		if (!this.map.has(vv)) {
			s = new Set<TValue>();
			this.map.set(vv, s);
		} else {
			s = this.map.get(vv);
		}

		return s;
	}

	addFor(v: TKey, input: TValue) {
		let s = this.get(v);
		s.add(input);
	}
}

export function range(range_: number): number[];
export function range(start: number, end: number): number[];
export function range(start: number, end: number, step: number): number[];
export function range(start: number, end?: number, step: number = 1): number[] {
	step = step || 1;
	if (end === undefined) {
		end = start;
		start = 0;
	}

	const n = [];
	for (let i = start; i < end; i += step) n.push(i);
	return n;
}

export function first<T>(iterable: any, defaultValue = false) {
	try {
		for (let item of iterable) {
			return item;
		}
	} catch (err) {
		console.log(err);

		return defaultValue;
	}
}

/**
 * Yield the subexpressions of an Expression (including x itself).
 * @param x
 */
export function* subexpressions(x) {
	yield x;
	if (x instanceof Expr) {
		// for arg in x.args:
		// 	yield from subexpressions(arg)
		for (let arg of x.args) {
			for (let a of subexpressions(arg)) {
				yield a;
			}
		}
	}
}

export function hash(str: string) {
	let hash = 0;
	if (str.length == 0) {
		return hash;
	}
	for (let i = 0; i < str.length; i++) {
		let char = str.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash; // Convert to 32bit integer
	}
	return hash;
}

export function isLowerCase(letter: string) {
	if (letter.length > 1) throw new Error('Not a single character');

	if (letter === letter.toLowerCase()) {
		return true;
	}
	return false;
}

export function isUpperCase(letter: string) {
	if (letter.length > 1) throw new Error('Not a single character');

	if (letter === letter.toUpperCase()) {
		return true;
	}
	return false;
}

export function isAlpha(ch: string) {
	return /^[A-Z]$/i.test(ch);
}

export function extend<T, K>(s: Map<T, K>, variable: T, value: K) {
	let m;
	if (s instanceof Map) {
		m = new Map(s);
	} else {
		m = new Map();
		Object.entries(s).forEach(([key, val]) => {
			m.set(key, val);
		});
	}
	m.set(variable, value);
	return m;
}

const infixOps = '==> <== <=>'.split(' ');
const specialCharacters = '|&^~';

/**
 * Given a str, return a new str with ==> replaced by |'==>'|, etc.
    >>> expr_handle_infix_ops('P ==> Q')
    "P |'==>'| Q"
 * @param x 
 */
export function exprHandleInfixOps(x: string) {
	for (let op of infixOps) {
		let re = new RegExp(op, 'g');
		x = x.replace(re, '|"' + op + '"|');
	}

	// ----- put parantesis ~P
	let r = new RegExp('~s*[A-Za-z]', 'g');

	let matches = x.match(r) || [];
	for (let m of matches) {
		x = x.replace(m, '(' + m + ')');
	}

	//------
	let m = lex(x);
	fixOrder(m);

	const construct = (a: any[]) => {
		let paranOpen = false;
		let result = a.reduce((prev: string, cur, i) => {
			if (Array.isArray(cur)) {
				prev += '(' + construct(cur) + ')';

				return prev;
			}

			let add =
				cur === '|'
					? '.or('
					: cur === '&'
					? '.and('
					: cur === '^'
					? '.xor('
					: cur === '~'
					? '.invert()'
					: false;

			if (add) {
				prev += add;
				if (paranOpen) {
					paranOpen = false;
					prev += ')';
				}
				paranOpen = cur === '~' ? false : true;
				return prev;
			}

			let closeText = '';
			if (paranOpen) {
				paranOpen = false;
				closeText = ')';
			}
			prev += cur + closeText;

			return prev;
		}, '');

		if (paranOpen) {
			result += ')';
		}
		return result;
	};

	x = construct(m);
	return x;
}

export function fixOrder(input: string[]) {
	let skipNext = false;
	for (let ix in input) {
		let idx = +ix;

		if (skipNext) {
			skipNext = false;
			continue;
		}
		let val = input[idx];

		if (val === '~') {
			val = input[idx + 1];
			input[idx] = val;
			input[idx + 1] = '~';
			skipNext = true;
		}

		if (Array.isArray(val)) {
			fixOrder(val);
		}
	}
}

export function lex(input: string) {
	const quotation = '"';

	let startNew = true;
	let result = [];
	let temp = result;
	let objs = [];

	let lp = 0;
	let rp = 0;
	let quote = null;

	const appendToLast = (i: string) => {
		let lastIndex = temp.length == 0 ? 0 : temp.length - 1;
		temp[lastIndex] = (temp[lastIndex] || '') + i;
	};

	let prevCh = null;
	let tempPrev = null;
	for (let i of input) {
		prevCh = tempPrev;
		tempPrev = i;
		// console.log(i);

		// ============
		if (quote) {
			if (quote === i) {
				quote = null;
			}
			// temp.push(i);
			appendToLast(i);

			continue;
		}

		if (quotation.includes(i)) {
			quote = i;
			temp.push(i);
			continue;
		}
		// ===================
		if (i === ' ') {
			continue;
		}

		if (i === '(') {
			lp += 1;
			let temp2 = [];
			temp.push(temp2);
			objs.push(temp);
			temp = temp2;

			continue;
		}

		if (i === ')') {
			rp += 1;
			temp = objs.pop();
			continue;
		}

		if (specialCharacters.indexOf(i) > -1) {
			if (prevCh == i) {
				appendToLast(i);
			} else {
				temp.push(i);
			}
			startNew = true;
		} else {
			if (startNew) {
				startNew = false;
				temp.push('');
			}

			appendToLast(i);
		}
	}

	if (lp !== rp) {
		throw new Error('Paranthesis dont match');
	}
	// console.log(result);
	return result;
	// console.log(toString(result));
}

/**
 * Like defaultdict, but the default_factory is a function of the key.
    >>> d = defaultkeydict(len); d['four']
    4
 */
export class Defaultkeydict {
	static map = new Map();
	get map() {
		return Defaultkeydict.map;
	}

	constructor(public func: Function) {}

	// def __missing__(self, key):
	// 	self[key] = result = self.default_factory(key)
	// 	return result
	get(key: string) {
		let val = this.map.get(key);
		if (val) return val;

		val = this.func(key);
		this.map.set(key, val);
		return val;
	}
}

/**
 * Shortcut to create an Expression. x is a str in which:
    - identifiers are automatically defined as Symbols.
    - ==> is treated as an infix |'==>'|, as are <== and <=>.
    If x is already an Expression, it is returned unchanged. Example:
    >>> expr('P & Q ==> Q')
    ((P & Q) ==> Q)
 * @param x 
 */
export function expr(str: string | Expr): Expr {
	// return eval(expr_handle_infix_ops(x), defaultkeydict(Symbol)) if isinstance(x, str) else x
	if (typeof str === 'string') {
		const [A, B, C, D, E, F, G, P, Q, a, x, y, z, u] = expressions;
		// console.log(P);
		let ex = exprHandleInfixOps(str);

		return eval(ex);
	}

	return str;
}
