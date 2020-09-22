import {
	bestFirstGraphSearch,
	breadthFirstGraphSearch,
	breadthFirstTreeSearch,
	depthFirstGraphSearch,
	depthFirstTreeSearch,
	depthLimitedSearch,
	iterativeDeepeningSearch,
} from '../search-algorithms/uninformed';
import { Node } from '../node';
import { PriorityQueue, show, memoize, compareSearchers } from '../utils';
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
	start: string,
	goal: string,
	searchers = defaultSearchers
) {
	const problem = new EightPuzzle(start, goal);
	console.log('Solving ', problem.toString());

	if (!problem.checkSolvability(start)) {
		console.log('this puzzle cannot be solvable');
	}

	compareSearchers(problem, searchers, (n) => n.state);
}

const tests = [['061724358', '012345678']];

for (let test of tests) {
	const [start, goal] = test;

	console.log('-------------------------');
	try {
		solve8Puzzle(start, goal);
	} catch (err) {
		console.error(err);
	}
}

// /**
//  * If a path to a goal was found, prints the cost and the sequence of actions
//     and states on a path from the initial state to the goal found
//  * @param solution
//  */
// export function printSolution(solution: Node) {
// 	const pathCost = solution.pathCost;
// 	const str = ['Path of cost: ', pathCost, ': '];
// 	str.push(solution.path().length, ': ');

// 	for (let node of solution.path()) {
// 		if (!node.action) {
// 			// if undefined/null initial state
// 			str.push(node.state.toString(), ' ');
// 		} else {
// 			const a = node.action as string;

// 			str.push(`- (${a}) -> [`, node.state.toString(), '] ');
// 		}
// 	}

// 	console.log(str.join(''));
// }
