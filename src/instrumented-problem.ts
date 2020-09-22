import { Problem } from './problem.abstract';

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
