import { Problem } from '../problem.abstract';

// ______________________________________________________________________________
// Informed (Heuristic) Search

import { bestFirstGraphSearch } from './uninformed';
import { argMaxRandomTie, memoize } from '../utils';
import { Node } from '../node';

const greedyBestFirstGraphSearch = bestFirstGraphSearch;

// Greedy best-first search is accomplished by specifying f(n) = h(n).

/**
 * A* search is best-first graph search with f(n) = g(n)+h(n).
    You need to specify the h function when you call astar_search, or
    else in your Problem subclass.
 * @param problem 
 * @param h 
 * @param display 
 */
export function aStarSearch(problem: Problem, h: any = null, display = false) {
	h = memoize(h || ((node: Node) => problem.h(node)), 'h');

	return bestFirstGraphSearch(problem, (node: Node) => node.pathCost + h(node));
}

// # ______________________________________________________________________________
// # Other search algorithms

/**
 * [Figure 3.26]
 * @param problem
 * @param h
 */
export function recursiveBestFirstSearch(problem: Problem, h: any = null) {
	h = memoize(h || ((n: Node) => problem.h(n)), 'h');

	const RBFS = function (node: Node, flimit: number): any {
		if (problem.goalTest(node.state)) {
			return [node, 0];
		}
		let successors = node.expand(problem);
		if (successors.length === 0) {
			return [null, Number.POSITIVE_INFINITY];
		}

		for (let s of successors) {
			s.f = Math.max(s.pathCost + h(s), node.f as number);
		}

		while (true) {
			// order by lowest f value
			successors = successors.sort((a: Node, b: Node) => a.f - b.f);
			let best = successors[0];

			if (best.f > flimit) {
				return [null, best.f];
			}

			let alternative =
				successors.length > 1 ? successors[1].f : Number.POSITIVE_INFINITY;

			let [result, best_F] = RBFS(best, Math.min(flimit, alternative));
			best.f = best_F as number;

			if (result !== null) {
				return [result, best.f];
			}
		}
	};

	let node = new Node(problem.initial);
	node.f = h(node);
	const [result, bestf] = RBFS(node, Number.POSITIVE_INFINITY);
	return result;
}

/**
 * [Figure 4.2]
    From the initial node, keep choosing the neighbor with highest value,
    stopping when no neighbor is better.
 * @param problem 
 */
export function hillClimbing(problem: Problem) {
	let current = new Node(problem.initial);

	while (true) {
		let neigbors = current.expand(problem);

		if (!(neigbors && neigbors.length)) break;

		let neigbor = argMaxRandomTie(neigbors, (node: Node) =>
			problem.value(node.state)
		);

		if (problem.value(neigbor.state) <= problem.value(current.state)) break;

		current = neigbor;
	}

	return current.state;
}
