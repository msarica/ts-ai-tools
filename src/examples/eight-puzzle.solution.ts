import {
	bestFirstGraphSearch,
	breadthFirstGraphSearch,
	breadthFirstTreeSearch,
	depthFirstGraphSearch,
	depthFirstTreeSearch,
	depthLimitedSearch,
	iterativeDeepeningSearch,
} from '../search-algorithms/uninformed';
import { compareSearchers, Problem } from '../search';
import { Node } from '../node';
import { PriorityQueue, show } from '../utils';
import { EightPuzzle } from '../problems/eight-puzzle';
import {
	aStarSearch,
	hillClimbing,
	recursiveBestFirstSearch,
} from '../search-algorithms/informed';

const defaultSearchers = [
	// breadthFirstGraphSearch,
	// depthFirstGraphSearch,
	// depthFirstTreeSearch,
	// (problem: Problem) =>
	// 	bestFirstGraphSearch(problem, (node: Node) => problem.h(node)),
	// (problem: Problem) => depthLimitedSearch(problem, 10),
	// iterativeDeepeningSearch,
	aStarSearch,
	// recursiveBestFirstSearch,
	// hillClimbing,
];

export function solve8Puzzle(
	start: number[],
	goal: number[],
	searchers = defaultSearchers
) {
	const problem = new EightPuzzle(start, goal);
	console.log('Solving ', problem.toString());

	if (!problem.checkSolvability(start)) {
		console.log('this puzzle cannot be solvable');
	}
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
	[
		[8, 0, 6, 5, 4, 7, 2, 3, 1],
		// [6, 2, 3, 5, 1, 7, 8, 4, 0],
		// [1, 2, 3, 4, 5, 6, 7, 0, 8],

		[1, 2, 3, 4, 5, 6, 7, 8, 0],
	],
];

for (let test of tests) {
	const [start, goal] = test;

	console.log('-------------------------');
	try {
		solve8Puzzle(start, goal);
	} catch (err) {
		console.error(err);
	}
}

/**
 * If a path to a goal was found, prints the cost and the sequence of actions
    and states on a path from the initial state to the goal found
 * @param solution 
 */
export function printSolution(solution: Node) {
	if (!solution) {
		console.log('No solution found 🙁');
		return;
	}

	const pathCost = solution.pathCost;
	const str = ['Path of cost: ', pathCost, ': '];
	str.push(solution.path().length, ': ');

	for (let node of solution.path()) {
		if (!node.action) {
			// if undefined/null initial state
			str.push(node.state.toString(), ' ');
		} else {
			const a = node.action as string;

			str.push(`- (${a}) -> [`, node.state.toString(), '] ');
		}
	}

	console.log(str.join(''));
}
