/**
 * CSP (Constraint Satisfaction Problems) problems and solvers. (Chapter 6)
 *
 */

import { Problem } from '../problem.abstract';
import { argMinRandomTie, Counter, DefaultDict } from '../utils';
import {
	difference,
	differenceUpdate,
	PriorityQueue,
	removeItem,
} from '../utils';

/**
 * This class describes finite-domain Constraint Satisfaction Problems.
    A CSP is specified by the following inputs:
        variables   A list of variables; each is atomic (e.g. int or string).
        domains     A dict of {var:[possible_value, ...]} entries.
        neighbors   A dict of {var:[var,...]} that for each variable lists
                    the other variables that participate in constraints.
        constraints A function f(A, a, B, b) that returns true if neighbors
                    A, B satisfy the constraint when they have values A=a, B=b

    In the textbook and in most mathematical definitions, the
    constraints are specified as explicit pairs of allowable values,
    but the formulation here is easier to express and more compact for
    most cases (for example, the n-Queens problem can be represented
    in O(n) space using this notation, instead of O(n^4) for the
    explicit representation). In terms of describing the CSP as a
    problem, that's all there is.

    However, the class also supports data structures and methods that help you
    solve CSPs by calling a search function on the CSP. Methods and slots are
    as follows, where the argument 'a' represents an assignment, which is a
    dict of {var:val} entries:
        assign(var, val, a)     Assign a[var] = val; do other bookkeeping
        unassign(var, a)        Do del a[var], plus other bookkeeping
        nconflicts(var, val, a) Return the number of other variables that
                                conflict with var=val
        curr_domains[var]       Slot: remaining consistent values for var
                                Used by constraint propagation routines.
    The following methods are used only by graph_search and tree_search:
        actions(state)          Return a list of actions
        result(state, action)   Return a successor of state
        goal_test(state)        Return true if all constraints satisfied
    The following are just for debugging purposes:
        nassigns                Slot: tracks the number of assignments made
        display(a)              Print a human-readable representation
 */
export abstract class CSP extends Problem {
	curr_domains: { [key: string]: any[] };
	nassigns = 0;

	/**
	 * Construct a CSP problem. If variables is empty, it becomes domains.keys().
	 */
	constructor(
		public variables: any[],
		public domains: any,
		public neighbors: any,
		public constraints: any
	) {
		super(null, null);
		variables && domains && this.setDomains(domains);
	}

	setDomains(domains: any) {
		this.variables = this.variables || Object.keys(domains);
	}

	/**
	 * Add {var: val} to assignment; Discard the old value if any.
	 * @param variable
	 * @param value
	 * @param assignment
	 */
	assign(variable, value, assignment) {
		assignment[variable] = value;
		this.nassigns += 1;
	}

	/**
     * Remove {var: val} from assignment.
        DO NOT call this if you are changing a variable to a new value;
        just call assign for that.
     * @param variable 
     * @param assignment 
     */
	unassign(variable, assignment) {
		if (assignment[variable]) {
			delete assignment[variable];
		}
	}

	/**
	 * Return the number of conflicts var=val has with other variables.
	 * @param variable
	 * @param value
	 */
	nconflicts(variable, value, assignment) {
		//Subclasses may implement this more efficiently
		const conflict = (var2) => {
			return (
				assignment[var2] && !this.constraints(variable, value, var2, assignment)
			);
		};

		return (this.neighbors[variable] as any[])
			.map((i) => conflict(i))
			.filter((i) => !!i).length;
	}

	/**
	 * Show a human-readable representation of the CSP.
	 * @param assignment
	 */
	display(assignment) {
		//# Subclasses can print in a prettier way, or display with a GUI
		console.log(assignment);
	}

	// These methods are for the tree and graph-search interface:
	/**
     * Return a list of applicable actions: non conflicting
        assignments to an unassigned variable.
     * @param state 
     */
	actions(state) {
		if (state.length === this.variables.length) {
			return [];
		}

		let assignment = state; // check here
		let varr;
		for (let v of this.variables) {
			if (!this.variables[v]) {
				varr = v;
				break;
			}
		}

		return (this.domains[varr] as any[]) // check here
			.filter((val) => this.nconflicts(varr, val, assignment) === 0)
			.map((val) => [varr, val]);
	}

	/**
	 * Perform an action and return the new state.
	 * @param state
	 * @param action
	 */
	result(state, action) {
		const [varr, val] = action;
		// return state + ((var, val),) // python
		return;
	}

	goalTest(state) {
		const assignment = state; // dict
		return (
			Object.keys(assignment).length === Object.keys(this.variables).length &&
			this.variables.every(
				(variable) =>
					this.nconflicts(variable, assignment[variable], assignment) === 0
			)
		);
	}

	// These are for constraint propagation

	/**
     * Make sure we can prune values from domains. (We want to pay
        for this only if we use it.)
     */
	supportPruning() {
		if (!this.curr_domains) {
			this.curr_domains = this.variables.reduce((prev, v) => {
				prev[v] = this.domains[v]; // check (needs to make a list)

				return prev;
			}, {});
		}
	}

	/**
	 * Start accumulating inferences from assuming var=value.
	 * @param variable
	 * @param value
	 */
	suppose(variable, value) {
		this.supportPruning();

		const removals = this.curr_domains[variable]
			.filter((a) => a !== value)
			.map((a) => [variable, a]);

		this.curr_domains[variable] = [value];
		return removals;
	}

	/**
	 * Rule out var=value.
	 * @param variable
	 * @param value
	 * @param removals
	 */
	prune(variable: number, value: number, removals: any[]) {
		removeItem(this.curr_domains[variable], value);

		if (removals) {
			removals.push([variable, value]);
		}
	}

	/**
	 * Return all values for var that aren't currently ruled out.
	 * @param variable
	 */
	choices(variable): any[] {
		return (this.curr_domains || this.domains)[variable];
	}

	/**
	 * Return the partial assignment implied by the current inferences.
	 */
	inferAssignment() {
		this.supportPruning();

		const infer = this.variables.reduce((prev, v) => {
			if (this.curr_domains[+v].length === 1) {
				prev[v] = this.curr_domains[v][0];
			}
			return prev;
		}, {});

		return infer;
	}

	/**
	 * Undo a supposition and all inferences from it.
	 * @param removals
	 */
	restore(removals: any[]) {
		removals.forEach(([B, b]) => {
			this.curr_domains[B].push(b);
		});
	}

	// This is for min_conflicts search

	/**
	 * Return a list of variables in current assignment that are in conflict
	 * @param current
	 */
	conflictedVars(current) {
		return this.variables.filter(
			(varr) => this.nconflicts(varr, current[varr], current) > 0
		);
	}
}

// ______________________________________________________________________________
// Constraint Propagation with AC3

export function noArchHeuristic(csp: CSP, queue: any) {
	return queue;
}

export function dom_j_up(csp: CSP, queue: any[]) {
	const lambda = (t) => {
		let tt = t[1];
		let len = csp.curr_domains[tt].length;
		return len;
	};

	const q = new PriorityQueue(
		'min',
		(t) => lambda(t),
		// ([a1, b1], [a2, b2]) => a1 === a2 && b1 === b2,
		([a, b]) => `${a}_${b}`,
		true
	);

	q.push(...queue);

	return q;
}

/**
 *
 * @param csp
 * @param queue
 */
export function AC3(
	csp: CSP,
	queue: any[] = null,
	removals: any = null,
	arcHeuristic = dom_j_up
) {
	// [Figure 6.3]
	if (!queue) {
		queue = csp.variables
			.map((Xi) => csp.neighbors[Xi].map((Xk) => [Xi, Xk]))
			.reduce((prev, cur) => [...prev, ...cur], []);
		queue = Array.from(new Set(queue));
	}

	csp.supportPruning();
	queue = arcHeuristic(csp, queue) as any;
	let checks = 0;

	while (queue.length) {
		const [Xi, Xj] = queue.pop();
		let [revised, checks_] = revise(csp, Xi, Xj, removals, checks);
		checks = checks_ as number;
		if (revised) {
			if (!csp.curr_domains[Xi].length) {
				return [false, checks]; // CSP is inconsistent
			}

			for (let Xk of csp.neighbors[Xi]) {
				if (Xk !== Xj) {
					queue.push([Xk, Xi]);
				}
			}
		}
	}

	return [true, checks]; // CSP is satisfiable
}

/**
 * Return true if we remove a value.
 * @param csp
 * @param Xi
 * @param Xj
 * @param removals
 * @param checks
 */
export function revise(csp: CSP, Xi: number, Xj: number, removals, checks = 0) {
	let revised = false;
	for (let x of csp.curr_domains[Xi]) {
		// # If Xi=x conflicts with Xj=y for every possible y, eliminate Xi=x
		// # if all(not csp.constraints(Xi, x, Xj, y) for y in csp.curr_domains[Xj]):
		let conflict = true;
		for (let y of csp.curr_domains[Xj]) {
			if (csp.constraints(Xi, x, Xj, y)) {
				conflict = false;
			}
			checks += 1;
			if (!conflict) {
				break;
			}
		}

		if (conflict) {
			csp.prune(Xi, x, removals);
			revised = true;
		}
	}

	return [revised, checks];
}

// Constraint Propagation with AC3b: an improved version
// of AC3 with double-support domain-heuristic

export function AC3b(
	csp: CSP,
	queue: any[] = null,
	removals = null,
	arcHeuristic = dom_j_up
) {
	if (!queue) {
		queue = csp.variables
			.map((Xi) => csp.neighbors[Xi].map((Xk) => [Xi, Xk]))
			.reduce((prev, cur) => [...prev, ...cur], []);
		queue = Array.from(new Set(queue));
	}
	csp.supportPruning();
	queue = (arcHeuristic(csp, queue) as unknown) as any[];
	let checks: number = 0;

	while (queue.length) {
		let [Xi, Xj] = queue.pop();
		// Si_p values are all known to be supported by Xj
		// Sj_p values are all known to be supported by Xi
		// Dj - Sj_p = Sj_u values are unknown, as yet, to be supported by Xi
		let [Si_p, Sj_p, Sj_u, checks_] = partition(csp, Xi, Xj, checks) as [
			Set<any>,
			Set<any>,
			Set<any>,
			number
		];
		checks = checks_;
		if (!Si_p) {
			return [false, checks]; // CSP is inconsistent
		}

		let revised = false;
		for (let x of difference(new Set(csp.curr_domains[Xi]), Si_p)) {
			csp.prune(Xi, x as number, removals);
			revised = true;
		}
		if (revised) {
			for (let Xk of csp.neighbors[Xi]) {
				if (Xk != Xi) {
					queue.push([Xk, Xi]);
				}
			}
		}

		const contains =
			queue instanceof PriorityQueue
				? queue.has([Xj, Xi])
				: queue.findIndex(([a, b]) => a === Xj && b === Xi) > -1;

		if (contains) {
			if (queue instanceof Set) {
				// or queue -= {(Xj, Xi)} or queue.remove((Xj, Xi))
				differenceUpdate(queue, new Set([Xj, Xi]));
			} else if (queue instanceof PriorityQueue) {
				queue.remove([Xj, Xi]);
			} else {
				removeItem(queue as any[], ([a, b]) => a == Xj && b == Xi);
			}

			// the elements in D_j which are supported by Xi are given by the union of Sj_p with the set of those
			// elements of Sj_u which further processing will show to be supported by some vi_p in Si_p
			for (let vj_p of Sj_u as Set<any>) {
				for (let vi_p of Si_p as Set<any>) {
					let conflict = true;
					if (csp.constraints(Xj, vj_p, Xi, vi_p)) {
						conflict = false;
						Sj_p.add(vj_p);
					}
					checks += 1;
					if (!conflict) {
						break;
					}
				}
			}
			revised = false;
			for (let x of difference(new Set(csp.curr_domains[Xj]), Sj_p)) {
				csp.prune(Xj, x as number, removals);
				revised = true;
			}

			if (revised) {
				for (let Xk of csp.neighbors[Xj]) {
					if (Xk != Xi) {
						queue.push([Xk, Xj]);
					}
				}
			}
		}
	}

	return [true, checks]; // CSP is satisfiable
}

export function partition(csp: CSP, Xi: number, Xj: number, checks = 0) {
	let Si_p = new Set();
	let Sj_p = new Set();
	let Sj_u = new Set(csp.curr_domains[Xj]);

	for (let vi_u of csp.curr_domains[Xi]) {
		let conflict = true;
		// now, in order to establish support for a value vi_u in Di it seems better to try to find a support among
		// the values in Sj_u first, because for each vj_u in Sj_u the check (vi_u, vj_u) is a double-support check
		// and it is just as likely that any vj_u in Sj_u supports vi_u than it is that any vj_p in Sj_p does...

		const diff = difference(Sj_u, Sj_p);
		for (let vj_u of diff) {
			// double-support check
			if (csp.constraints(Xi, vi_u, Xj, vj_u)) {
				conflict = false;
				Si_p.add(vi_u);
				Sj_p.add(vj_u);
			}

			checks += 1;
			if (!conflict) {
				break;
			}
		}
		// ... and only if no support can be found among the elements in Sj_u, should the elements vj_p in Sj_p be used
		// for single-support checks (vi_u, vj_p)

		if (conflict) {
			for (let vj_p of Sj_p) {
				// single-support check
				if (csp.constraints(Xi, vi_u, Xj, vj_p)) {
					conflict = false;
					Si_p.add(vi_u);
				}
				checks += 1;
				if (!conflict) break;
			}
		}
	}

	return [Si_p, Sj_p, difference(Sj_u, Sj_p), checks];
}

// Constraint Propagation with AC4

export function AC4(
	csp: CSP,
	queue: any[] = null,
	removals = null,
	arcHeuristic = dom_j_up
) {
	if (!queue) {
		queue = csp.variables
			.map((Xi) => csp.neighbors[Xi].map((Xk) => [Xi, Xk]))
			.reduce((prev, cur) => [...prev, ...cur], []);
		queue = Array.from(new Set(queue));
	}

	csp.supportPruning();
	queue = (arcHeuristic(csp, queue) as unknown) as any[];
	const supportCounter = new Counter<[number, number, number]>(
		(a, b) => `${a}_${b}`
	);
	const variableValuePairsSupported = new DefaultDict<
		[number, number],
		[number, number]
	>(([a, b]) => `${a}_${b}`);
	const unsupportedVariableValuePairs = [];
	let checks: number = 0;

	// construction and initialization of support sets
	while (queue.length) {
		let [Xi, Xj] = queue.pop();
		let revised = false;

		for (let x of csp.curr_domains[Xi]) {
			for (let y of csp.curr_domains[Xj]) {
				if (csp.constraints(Xi, x, Xj, y)) {
					supportCounter.increment([Xi, x, Xj]);
					variableValuePairsSupported.addFor([Xj, y], [Xi, x]);
				}
				checks += 1;
			}
			if (supportCounter.valueOf([Xi, x, Xj]) === 0) {
				csp.prune(Xi, x, removals);
				revised = true;
				unsupportedVariableValuePairs.push([Xi, x]);
			}
		}

		if (revised) {
			if (!csp.curr_domains[Xi].length) {
				return [false, checks]; // CSP is inconsistent
			}
		}
	}

	//  propagation of removed values
	while (unsupportedVariableValuePairs.length) {
		let [Xj, y] = unsupportedVariableValuePairs.pop();
		for (let [Xi, x] of variableValuePairsSupported.get([Xj, y]).values()) {
			let revised = false;
			if (csp.curr_domains[Xi].indexOf(x) > -1) {
				supportCounter.decrement([Xi, x, Xj]);
				if (supportCounter.valueOf([Xi, x, Xj]) === 0) {
					csp.prune(Xi, x, removals);
					revised = true;
					unsupportedVariableValuePairs.push([Xi, x]);
				}
			}
			if (revised) {
				if (!csp.curr_domains[Xi].length) {
					return [false, checks]; // CSP is inconsistent
				}
			}
		}
	}

	return [true, checks];
}

// ______________________________________________________________________________
// CSP Backtracking Search

// Variable ordering

/**
 * The default variable order.
 * @param assignment
 * @param csp
 */
export function firstUnassignedVariable(assignment, csp: CSP) {
	for (let variable of csp.variables) {
		if (!assignment[variable]) {
			return variable;
		}
	}
}

/**
 * Minimum-remaining-values heuristic.
 * @param assignment
 * @param csp
 */
export function mrv(assignment, csp: CSP) {
	let vars = csp.variables.filter((v) => !assignment[v]);

	return argMinRandomTie(vars, (v) => numLegalValues(csp, v, assignment));
}

export function numLegalValues(csp: CSP, variable, assignment) {
	if (csp.curr_domains) {
		return csp.curr_domains[variable].length;
	} else {
		return (csp.domains[variable] as any[])
			.map((val) => csp.nconflicts(variable, val, assignment) === 0)
			.filter((val) => !!val).length;
	}
}

// value ordering

/**
 * The default value order.
 */
export function unorderedDomainValues(variable, assignment, csp: CSP) {
	return csp.choices(variable);
}

/**
 * Least-constraining-values heuristic.
 * @param variable
 * @param assingment
 * @param csp
 */
export function lcv(variable, assingment, csp: CSP) {
	const f = (val) => csp.nconflicts(variable, val, assingment);

	let sorted = csp
		.choices(variable)
		.map((v) => ({
			sortValue: f(v),
			item: v,
		}))
		.sort((a, b) => a.sortValue - b.sortValue);

	return sorted.shift().item;
}

// Inference

export function noInference(
	csp: CSP,
	variable,
	value,
	assignment,
	removals: any[]
) {
	return true;
}

/**
 * Prune neighbor values inconsistent with var=value.
 * @param csp
 * @param variable
 * @param value
 * @param assignment
 */
export function forwardChecking(
	csp: CSP,
	variable,
	value,
	assignment,
	removals: any[]
) {
	csp.supportPruning();
	for (let B of csp.neighbors[variable]) {
		if (!assignment[B]) {
			for (let b of csp.curr_domains[B]) {
				if (!csp.constraints(variable, value, B, b)) {
					csp.prune(B, b, removals);
				}
			}

			if (!csp.curr_domains[B].length) {
				return false;
			}
		}
	}

	return true;
}

/**
 * Maintain arc consistency.
 * @param csp
 * @param variable
 * @param value
 * @param assignment
 * @param removals
 */
export function mac(
	csp: CSP,
	variable,
	value,
	assignment,
	removals,
	constraint_propagation = AC3b
) {
	let queue = csp.neighbors[variable].map((X) => [X, variable]);

	return constraint_propagation(csp, queue, removals);
}

// The search, proper

/**
 * [Figure 6.5]
 * @param csp
 * @param selectUnassignedVariable
 * @param orderDomainValues
 * @param inference
 */
export function backtrackingSearch(
	csp: CSP,
	selectUnassignedVariable = firstUnassignedVariable,
	orderDomainValues = unorderedDomainValues,
	inference = noInference
) {
	const backtrack = (assignment) => {
		if (Object.keys(assignment).length === csp.variables.length) {
			return assignment;
		}
		let variable = selectUnassignedVariable(assignment, csp);
		for (let value of orderDomainValues(variable, assignment, csp)) {
			if (csp.nconflicts(variable, value, assignment) === 0) {
				csp.assign(variable, value, assignment);
				let removals = csp.suppose(variable, value);

				if (inference(csp, variable, value, assignment, removals)) {
					let result = backtrack(assignment);
					if (result) {
						return result;
					}
				}

				csp.restore(removals);
			}
		}
		csp.unassign(variable, assignment);
		return null;
	};

	let result = backtrack({});
	if (result && !csp.goalTest(result)) {
		throw new Error('Invalid result');
	}

	return result;
}
