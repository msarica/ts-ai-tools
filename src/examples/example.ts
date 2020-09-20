import {
	bestFirstGraphSearch,
	breadthFirstGraphSearch,
	breadthFirstTreeSearch,
	depthFirstGraphSearch,
	depthFirstTreeSearch,
	depthLimitedSearch,
	iterativeDeepeningSearch,
} from '../search-algorithms/uninformed';
import { printSolution, WJ3 } from '../problems/wj3';
import { compareSearchers, Problem } from '../search';
import { Node } from '../node';
import { PriorityQueue, show } from '../utils';
import {
	aStarSearch,
	hillClimbing,
	recursiveBestFirstSearch,
} from '../search-algorithms/informed';

const defaultSearchers = [
	// breadthFirstGraphSearch, depthFirstGraphSearch,
	// depthFirstTreeSearch,
	// (problem: WJ3) =>
	// 	bestFirstGraphSearch(problem, (node: Node) => problem.h(node)),
	// (problem: Problem) => depthLimitedSearch(problem, 10),
	// iterativeDeepeningSearch,
	// aStarSearch,
	// recursiveBestFirstSearch,
	hillClimbing,
];

export function wj3Solve(
	capacities: number[],
	start: number[],
	goal: number[],
	searchers = defaultSearchers
) {
	const problem = new WJ3(capacities, start, goal);
	console.log('Solving ', problem.toString());
	// const reachableStates = problem.reachableStates()

	// const potential = (capacities[0]+1) * (capacities[1]+1) * (capacities[2]+1);
	// console.log()

	const sucessfulSearchers = [];

	console.log('searchers: ', searchers.map((s) => s.name).join(', '));

	for (const alg of searchers) {
		console.log('* ', alg.name, ':');

		const solution = alg(problem);

		if (solution) {
			printSolution(solution);
			sucessfulSearchers.push(alg);
		}
	}
	console.log(
		'SUMMARY: algorithm  <successors  goal_tests  states_generated  solution>'
	);

	if (sucessfulSearchers.length) {
		compareSearchers([problem], '', sucessfulSearchers);
	}
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
	[
		[12, 8, 5],
		[12, 0, 0],
		[6, 6, 0],
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

// show();

// const q = new PriorityQueue(
// 	'min',
// 	(x: number) => x + 1,
// 	(x, y) => x == y
// );
// q.push(5);
// q.push(1);
// q.push(10);
// // console.log(q.pop());
// q.show();

// console.log(q.sortValue(5));

// q.remove(5);

// q.show();
