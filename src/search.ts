import { Node } from './node';

/**
 * 
    Search (Chapters 3-4)

    The way to use this code is to subclass Problem to create a class of problems,
    then create problem instances and solve them with calls to the various search
    functions.
 */

/**
 * The abstract class for a formal problem. You should subclass
    this and implement the methods actions and result, and possibly
    __init__, goal_test, and path_cost. Then you will create instances
    of your subclass and solve them with the various search functions.
 */
export abstract class Problem<State = any, Action = any> {
	/**
     * The constructor specifies the initial state, and possibly a goal
        state, if there is a unique goal. Your subclass's constructor can add
        other arguments.
     * @param initial 
     * @param goal 
     */
	constructor(public initial: State, public goal: State) {}

	abstract toString(): string;

	/**
     * Return the actions that can be executed in the given
        state. The result would typically be a list, but if there are
        many actions, consider yielding them one at a time in an
        iterator, rather than building them all at once.
     * @param state 
     */
	abstract actions(state: State): Action[];

	/**
     * Return the state that results from executing the given
        action in the given state. The action must be one of
        self.actions(state).
     * @param state 
     * @param action 
     */
	abstract result(state: State, action: Action): any;

	/**
     * Return True if the state is a goal. The default method compares the
        state to self.goal or checks for state in self.goal if it is a
        list, as specified in the constructor. Override this method if
        checking against a single self.goal is not enough.
     * @param state 
     */
	abstract goalTest(state: State): boolean;

	/**
     * Return the cost of a solution path that arrives at state2 from
        state1 via action, assuming cost c to get up to state1. If the problem
        is such that the path doesn't matter, this function will only look at
        state2. If the path does matter, it will consider c and maybe state1
        and action. The default method costs 1 for every step in the path.
     * @param cost 
     * @param state1 
     * @param action 
     * @param state2 
     */
	pathCost(cost: number, state1: State, action: Action, state2: State) {
		return cost + 1;
	}

	/**
     * For optimization problems, each state has a value. Hill Climbing
        and related algorithms try to maximize this value.
     * @param state 
     */
	value(state: State) {
		return 0;
	}

	h(node: Node): number {
		return node.pathCost;
	}
}

// def compare_searchers(problems, header,
//    searchers=[breadth_first_tree_search,
//               breadth_first_graph_search,
//               depth_first_graph_search,
//               iterative_deepening_search,
//               depth_limited_search,
//               recursive_best_first_search]):
// def do(searcher, problem):
// p = InstrumentedProblem(problem)
// searcher(p)
// return p

// table = [[name(s)] + [do(s, p) for p in problems] for s in searchers]
// print_table(table, header)

/**
 * Delegates to a problem, and keeps statistics.
 */
export class InstrumentedProblem extends Problem {
	success = 0;
	goalTests = 0;
	states = 0;
	found = null;

	constructor(public problem: Problem) {
		super(problem.initial, problem.goal);
	}

	toString(): string {
		return `Success: ${this.success} GoalTest: ${this.goalTests} States: ${this.states}`;
		// return this.problem.toString();
	}

	actions(state: any): any[] {
		this.success++;
		return this.problem.actions(state);
	}

	result(state: any, action: any) {
		this.states++;
		return this.problem.result(state, action);
	}
	goalTest(state: any): boolean {
		this.goalTests++;
		const found = this.problem.goalTest(state);

		if (found) {
			this.found = state;
		}

		return found;
	}

	pathCost(cost: number, state1: any, action: any, state2: any): number {
		return this.problem.pathCost(cost, state1, action, state2);
	}

	value(state: any): number {
		return this.problem.value(state);
	}
}

export function compareSearchers(
	problems: Problem[],
	header: string,
	searchers: Function[]
) {
	const doFn = (searcher: Function, problem: Problem) => {
		const p = new InstrumentedProblem(problem);
		searcher(p);
		return p;
	};

	console.log(header);

	for (let searcher of searchers) {
		for (let problem of problems) {
			const pr = doFn(searcher, problem);
			console.log(pr.toString());
		}
	}
}
