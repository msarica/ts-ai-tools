import { CSP } from '../csp/csp';
import { neighbors, rows } from './sudoku.model';

export function flatten(arr: any[][]) {
	return arr.reduce((prev, cur) => [...prev, ...cur], []);
}

/**
 *     A Sudoku problem.
    The box grid is a 3x3 array of boxes, each a 3x3 array of cells.
    Each cell holds a digit in 1..9. In each box, all digits are
    different; the same for each row and column as a 9x9 grid.
    >>> e = Sudoku(easy1)
    >>> e.display(e.infer_assignment())
    . . 3 | . 2 . | 6 . .
    9 . . | 3 . 5 | . . 1
    . . 1 | 8 . 6 | 4 . .
    ------+-------+------
    . . 8 | 1 . 2 | 9 . .
    7 . . | . . . | . . 8
    . . 6 | 7 . 8 | 2 . .
    ------+-------+------
    . . 2 | 6 . 9 | 5 . .
    8 . . | 2 . 3 | . . 9
    . . 5 | . 1 . | 3 . .
    >>> AC3(e)  # doctest: +ELLIPSIS
    (True, ...)
    >>> e.display(e.infer_assignment())
    4 8 3 | 9 2 1 | 6 5 7
    9 6 7 | 3 4 5 | 8 2 1
    2 5 1 | 8 7 6 | 4 9 3
    ------+-------+------
    5 4 8 | 1 3 2 | 9 7 6
    7 2 9 | 5 6 4 | 1 3 8
    1 3 6 | 7 9 8 | 2 4 5
    ------+-------+------
    3 7 2 | 6 8 9 | 5 1 4
    8 1 4 | 2 5 3 | 7 6 9
    6 9 5 | 4 1 7 | 3 8 2
    >>> h = Sudoku(harder1)
    >>> backtracking_search(h, select_unassigned_variable=mrv, inference=forward_checking) is not None
    True
 */
export class Sudoku extends CSP {
	/**
     * Build a Sudoku problem from a string representing the grid:
        the digits 1-9 denote a filled cell, '.' or '0' an empty one;
        other characters are ignored.
     * @param grid 
     */
	constructor(grid: string) {
		super(null, null, null, null);

		const squares = grid.replace(/(\s+|\n)/g, '').split('');

		const frows = flatten(rows);
		const numbers = '123456789'.split('');
		const domains = squares.reduce((prev, cur, idx) => {
			const idxx = frows[idx];
			if (numbers.indexOf(cur) > -1) {
				prev[idxx] = [cur];
			} else {
				prev[idxx] = [...numbers];
			}
			return prev;
		}, {});

		this.domains = domains;
		this.neighbors = neighbors;
		this.constraints = differentValuesConstraint;
		this.setDomains(domains);
	}

	display(assignment: string | string[]) {
		let chars: string[];
		if (typeof assignment === 'string') {
			chars = (assignment as string).split('');
		} else {
			chars = [];
			for (let i = 0; i < 81; i++) {
				chars.push(assignment[i] || '.');
			}
		}

		chars.reduce((prev, cur, i) => {
			let x = i + 1;

			prev += cur + ' ';

			if (x % 9 == 0) {
				console.log(prev);
				if (x % 27 == 0 && x !== 81) {
					console.log('------+-------+------');
				}
				return '';
			}

			if (x % 3 == 0) {
				prev += '| ';
			}

			return prev;
		}, '');
	}

	toString(): string {
		throw new Error('Method not implemented.');
	}
	result(state: any, action: any) {
		throw new Error('Method not implemented.');
	}
	goalTest(state: any): boolean {
		throw new Error('Method not implemented.');
	}
}

/**
 * A constraint saying two neighboring variables must differ in value.
 * @param A
 * @param a
 * @param B
 * @param b
 */
export function differentValuesConstraint(A, a, B, b) {
	return a != b;
}
