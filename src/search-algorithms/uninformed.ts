import { Node } from '../node';
import { Problem } from '../problem.abstract';
import { PriorityQueue, memoize, MSet, NodeArray } from '../utils';

/**
 *  [Figure 3.7]
    Search the shallowest nodes in the search tree first.
    Search through the successors of a problem to find a goal.
    The argument frontier should be an empty queue.
    Repeats infinitely in case of loops.
 * @param problem 
 */
export function breadthFirstTreeSearch(problem: Problem) {
	const frontier = [new Node(problem.initial)]; // FIFO queue

	let node: Node;
	while (frontier.length) {
		node = frontier.shift() as Node;

		if (problem.goalTest(node.state)) return node;

		frontier.push(...node.expand(problem));
	}

	return null;
}

/**
 * [Figure 3.7]
    Search the deepest nodes in the search tree first.
    Search through the successors of a problem to find a goal.
    The argument frontier should be an empty queue.
    Repeats infinitely in case of loops.
 * @param problem 
 */
export function depthFirstTreeSearch(problem: Problem) {
	const frontier = [new Node(problem.initial)]; // Stack

	let node: Node;
	while (frontier.length) {
		node = frontier.pop() as Node;
		if (problem.goalTest(node.state)) return node;

		frontier.push(...node.expand(problem));
	}

	return null;
}

/**
 *  [Figure 3.7]
    Search the deepest nodes in the search tree first.
    Search through the successors of a problem to find a goal.
    The argument frontier should be an empty queue.
    Does not get trapped by loops.
    If two paths reach a state, only use the first one.
 * @param problem 
 */
export function depthFirstGraphSearch(problem: Problem) {
	const frontier = new NodeArray([new Node(problem.initial)]); // Stack

	const explored = new MSet();
	let node: Node;
	while (frontier.length) {
		node = frontier.pop() as Node;
		if (problem.goalTest(node.state)) return node;

		explored.add(node.state);

		const nodes = node.expand(problem);

		for (let child of nodes) {
			if (!explored.has(child.state) && !frontier.has(child)) {
				frontier.push(child);
			}
		}
	}

	return null;
}

/**
 * [Figure 3.11]
    Note that this function can be implemented in a
    single line as below:
    return graph_search(problem, FIFOQueue())
 * @param problem 
 */
export function breadthFirstGraphSearch(problem: Problem) {
	let node = new Node(problem.initial);

	if (problem.goalTest(node.state)) return node;

	const frontier = new NodeArray([node]);
	const explored = new MSet();

	while (frontier.length) {
		node = frontier.shift() as Node; // pop left
		explored.add(node.state);

		for (let child of node.expand(problem)) {
			if (explored.has(child.state) || frontier.has(child)) continue;

			if (problem.goalTest(child.state)) return child;

			frontier.push(child);
		}
	}

	return null;
}

let c = 0;
/**
 * Search the nodes with the lowest f scores first.
    You specify the function f(node) that you want to minimize; for example,
    if f is a heuristic estimate to the goal, then we have greedy best
    first search; if f is node.depth then we have breadth-first search.
    There is a subtlety: the line "f = memoize(f, 'f')" means that the f
    values will be cached on the nodes as they are computed. So after doing
    a best first search you can examine the f values of the path returned.
 * @param problem 
 * @param f 
 * @param display 
 */
export function bestFirstGraphSearch(
	problem: Problem,
	f: Function,
	display = false
) {
	// caching f...
	f = memoize(f, 'f') as any;

	let node = new Node(problem.initial);
	const frontier = new PriorityQueue(
		'min',
		f,
		(o: Node, p: Node) => o.equalsTo(p),
		(p) => p.hash()
	);
	frontier.push(node);

	const explored = new MSet();

	while (frontier.length) {
		node = frontier.pop() as Node;
		if (problem.goalTest(node.state)) {
			if (display) {
				console.log(
					explored.size,
					'paths have been expanded and',
					frontier.length,
					' paths remain in the frontier'
				);
			}
			return node;
		}

		explored.add(node.state);
		const nodes = node.expand(problem);

		for (let child of nodes) {
			if (!explored.has(child.state) && !frontier.has(child)) {
				frontier.push(child);
			} else if (frontier.has(child)) {
				if (f(child) < frontier.sortValue(child)) {
					frontier.remove(child);
					frontier.push(child);
				}
			}
		}
	}

	return null;
}

/**
 * [Figure 3.14]
 * @param problem
 * @param display
 */
export function uniformCostSearch(problem: Problem, display = false) {
	return bestFirstGraphSearch(problem, (node: Node) => node.pathCost, display);
}

/**
 * [Figure 3.17]
 * @param problem
 * @param limit
 */
export function depthLimitedSearch(problem: Problem, limit: number) {
	const recursiveDls = (node: Node, problem: Problem, limit: number) => {
		if (problem.goalTest(node.state)) return node;
		if (limit === 0) return 'cutoff';

		let cutoff_occurred = false;
		for (let child of node.expand(problem)) {
			const result = recursiveDls(child, problem, limit - 1) as any;

			if (result === 'cutoff') {
				cutoff_occurred = true;
			} else if (result !== null) {
				return result;
			}
		}

		return cutoff_occurred ? 'cutoff' : null;
	};

	return recursiveDls(new Node(problem.initial), problem, limit);
}

/**
 * [Figure 3.18]
 * @param problem
 */
export function iterativeDeepeningSearch(problem: Problem, maxsize = 50) {
	for (let depth of Array.from(Array(maxsize).keys())) {
		let result = depthLimitedSearch(problem, depth);
		if (result !== 'cutoff') {
			return result;
		}
	}
}

// _______________________________________________________________
// Bidirectional Search
// Pseudocode from https://webdocs.cs.ualberta.ca/%7Eholte/Publications/MM-AAAI2016.pdf

// export function biDirectionalSearch(problem: Problem) {
// 	let e = 0;

// 	if (problem instanceof GraphProblem) {
// 		e = problem.findMinEdge();
// 	}

// 	let gF = {node: new Node(problem.initial)}
// }

export abstract class GraphProblem extends Problem {
	abstract findMinEdge(): number;
}
