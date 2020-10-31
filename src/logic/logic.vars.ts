// Useful constant Exprs used in examples and code:
// TODO
// import { Expr } from '../utils';

import { Expr } from './logic.classes';

export const expressions = 'ABCDEFGPQaxyzu'
	.split('')
	.map((letter) => new Expr(letter));

export const [A, B, C, D, E, F, G, P, Q, a, x, y, z, u] = expressions;
// console.log(expressions);
