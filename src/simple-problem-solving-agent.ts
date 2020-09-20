import { Problem } from './search';

/**
 *     [Figure 3.1]
    Abstract framework for a problem-solving agent.
 */
export abstract class SimpleProblemSolvingAgentProgram<
	State = any,
	Action = any,
	Percept = any
> {
	seq: Action[] = [];
	state: State;

	/**
     * State is an abstract representation of the state
            of the world, and seq is the list of actions required
            to get to a particular state from the initial state(root).
    * @param initialState 
    */
	constructor(initialState: State) {
		this.state = initialState;
	}

	/**
     * [Figure 3.1] Formulate a goal and problem, then
        search for a sequence of actions to solve it.
     * @param percept 
     */
	call(percept: Percept) {
		this.state = this.updateState(this.state, percept);

		if (!this.seq.length) {
			const goal = this.formulateGoal(this.state);
			const problem = this.formulateProblem(this.state, goal);
			this.seq = this.search(problem);

			if (!this.seq.length) {
				return;
			}
		}

		return this.seq.shift();
	}

	abstract updateState(state: State, percept: Percept): State;

	abstract formulateGoal(state: State): State;

	abstract formulateProblem(state: State, goal: State): Problem;

	abstract search(problem: Problem): Action[];
}
