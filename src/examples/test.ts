import { expr, exprHandleInfixOps } from '../utils';
import { dpllSatisfiable, plTrue, ttTrue } from '../logic/logic';
import { P, Q } from '../logic/logic.vars';

// let x = expr('P & Q ==> Q');
// let x = expr('(P.and(Q)).or("==>").or(Q)');
// console.log(x.toString());

// P | ~P
// const x = ttTrue(expr('P.or(P.invert())'));
// const x = ttTrue(expr('(P.and(Q)).or("==>").or(Q)'));

// const x = plTrue(P.or(P.invert()) as any, new Map().set(P, true));

// const x = ttTrue(expr('(P ==> Q) <=> (~P | Q )'));
// ((A ∧ B) → C) ↔ (A → (B → C))
// ((A → B) → A) → A
// const x = ttTrue(expr('(( A ==> B ) ==> A ) ==> A'));
// const x = ttTrue(expr('A & ~A'));
const x = ttTrue(expr('(P & Q ) ==> (P)'));

// const x = ttTrue(P.or('==>').or(Q).or('<=>').or(P.invert().or(Q)));

// const x = exprHandleInfixOps('(P & Q) ==> Q');
// const x = dpllSatisfiable(expr(' P & G'));
// const x = dpllSatisfiable(expr('P <=> ~(~P)'));
// const x = dpllSatisfiable(expr('P ==> (~P | P)')); //P → ¬ P v P
// const x = dpllSatisfiable(expr('P & Q ==> P')); // ¬ (P ∨ ¬ P)

// const x = dpllSatisfiable(expr(P.or('<=>').or(P.invert().invert()) as any));

console.log(x);
