import {
	AC3,
	AC3b,
	AC4,
	backtrackingSearch,
	forwardChecking,
	mrv,
} from '../csp/csp';
import { Sudoku } from '../problems/sudoku';

const easy1 =
	'..3.2.6..9..3.5..1..18.64....81.29..7.......8..67.82....26.95..8..2.3..9..5.1.3..';
const harder1 =
	'4173698.5.3..........7......2.....6.....8.4......1.......6.3.7.5..2.....1.4......';

// const sudoku = new Sudoku(easy1);
const sudoku = new Sudoku(harder1);

export function solveSudoku(problem: Sudoku) {
	// const a = AC3(problem);
	// const a = AC3b(problem);
	// const a = AC4(problem);
	const a = backtrackingSearch(problem, mrv, undefined, forwardChecking);

	console.log(a);
	problem.display(problem.inferAssignment());
}

solveSudoku(sudoku);
