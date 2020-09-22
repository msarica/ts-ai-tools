// import { PlanRoute, WumpusPosition } from '../problems/plan-route';
// import { aStarSearch } from '../search-algorithms/informed';
// import { depthFirstGraphSearch } from '../search-algorithms/uninformed';
// import { compareSearchers } from '../utils';

// type coordinate = [number, number];

// const defaultSearchers = [
// 	// breadthFirstGraphSearch,
// 	depthFirstGraphSearch,
// 	// depthFirstTreeSearch,
// 	// (problem: WJ3) =>
// 	// 	bestFirstGraphSearch(problem, (node: Node) => problem.h(node)),
// 	// (problem: Problem) => depthLimitedSearch(problem, 10),
// 	// iterativeDeepeningSearch,
// 	aStarSearch,
// 	// recursiveBestFirstSearch,
// 	// hillClimbing,
// ];

// export function solve(
// 	initial: WumpusPosition,
// 	goal: WumpusPosition,
// 	map: coordinate[],
// 	searchers = defaultSearchers
// ) {
// 	const problem = new PlanRoute(initial, goal, map);
// 	console.log('Solving ', problem.toString());

// 	const sucessfulSearchers = [];

// 	console.log('searchers: ', searchers.map((s) => s.name).join(', '));

// 	for (const alg of searchers) {
// 		console.log('* ', alg.name, ':');

// 		const solution = alg(problem);

// 		if (!solution) {
// 			console.log('No solution found 🙁');
// 			continue;
// 		}

// 		solution.printSolution((n) => {
// 			const a = n.action as WJAction;

// 			if (a.action == 'pour') return `pour ${a.which}, ${a.to}`;
// 			return `${a.action} ${a.which}`;
// 		});
// 		sucessfulSearchers.push(alg);
// 	}

// 	if (sucessfulSearchers.length) {
// 		compareSearchers(problem, '', sucessfulSearchers);
// 	}
// }
