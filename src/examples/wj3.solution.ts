import {
	bestFirstGraphSearch,
	breadthFirstGraphSearch,
	breadthFirstTreeSearch,
	depthFirstGraphSearch,
	depthFirstTreeSearch,
	depthLimitedSearch,
	iterativeDeepeningSearch,
} from '../search-algorithms/uninformed';
import { WJ3, WJAction } from '../problems/wj3';
import { compareSearchers } from '../utils';
import { Node } from '../node';
import { PriorityQueue, show } from '../utils';
import {
	aStarSearch,
	hillClimbing,
	recursiveBestFirstSearch,
} from '../search-algorithms/informed';

const defaultSearchers = [
	// breadthFirstGraphSearch,
	depthFirstGraphSearch,
	// depthFirstTreeSearch,
	// (problem: WJ3) =>
	// 	bestFirstGraphSearch(problem, (node: Node) => problem.h(node)),
	// (problem: Problem) => depthLimitedSearch(problem, 10),
	// iterativeDeepeningSearch,
	aStarSearch,
	// recursiveBestFirstSearch,
	// hillClimbing,
];

export function wj3Solve(
	capacities: number[],
	start: number[],
	goal: number[],
	searchers = defaultSearchers
) {
	const problem = new WJ3(capacities, start, goal);

	const actionRep = (n: Node) => {
		const a = n.action as WJAction;

		if (a.action == 'pour') return `pour ${a.which}, ${a.to}`;
		return `${a.action} ${a.which}`;
	};

	compareSearchers(problem, searchers, actionRep);
}

const tests = [
	// [
	// 	[1, 1, 1],
	// 	[1, 1, 1],
	// 	[1, 1, 1],
	// ],
	// [
	// 	[1, 1, 1],
	// 	[1, 1, 1],
	// 	[1, 1, 0],
	// ],
	// [
	// 	[1, 1, 1],
	// 	[1, 1, 0],
	// 	[1, 1, 1],
	// ],
	// [[2, 2, 2], [2, 2, 2], [1, 1, 1]], // no solutions
	// [[5, 2, 0], [5, 2, 0], [4, 1, 0]],
	// [[5, 2, 0], [5, 2, 0], [2, 2, 0]],
	// [[5, 3, 3], [5, 3, 3], [1, 1, 1]],
	// [[4, 3, 2], [3, 2, 1], [2, 2, 2]],
	// [
	// 	[12, 8, 5],
	// 	[12, 0, 0],
	// 	[6, 6, 0],
	// ],
	[
		[5, 3],
		[5, 0],
		[4, 0],
	],
];

for (let test of tests) {
	const [capacities, start, goal] = test;

	console.log('-------------------------');
	try {
		wj3Solve(capacities, start, goal);
	} catch (err) {
		console.error(err);
	}
}
