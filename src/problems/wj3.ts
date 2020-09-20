import { Problem } from '../search';
import { Node } from '../node';

export interface Action {
	action: 'fill' | 'dump' | 'pour';
	which: number;
	to?: number;
}

export class WJ3 extends Problem<number[], Action> {
	constructor(private capacities: number[], initial: number[], goal: number[]) {
		super(initial, goal);
	}

	actions(state: number[]): Action[] {
		const legal: Action[] = [];

		state.forEach((j, ji) => {
			const c = this.capacities[ji];
			if (j < c) {
				legal.push({
					action: 'fill',
					which: ji,
				});
			}

			if (j > 0) {
				legal.push({
					action: 'dump',
					which: ji,
				});
			}

			state.forEach((j_, ji_) => {
				const c_ = this.capacities[ji_];
				if (j > 0 && j_ < c_) {
					legal.push({
						action: 'pour',
						which: ji,
						to: ji_,
					});
				}
			});
		});

		return legal;
	}

	result(state: number[], action_: Action) {
		const { action, which, to } = action_;
		state = [...state];

		if (action === 'dump') {
			state[which] = 0;
			return state;
		}

		if (action === 'fill') {
			state[which] = this.capacities[which];
			return state;
		}

		if (action === 'pour') {
			const t = to as number;
			const j1 = state[which];
			// const c1 = this.capacities[which];

			const j2 = state[t];
			const c2 = this.capacities[t];

			const delta = Math.min(j1, c2 - j2);
			state[which] = j1 - delta;
			state[t] = j2 + delta;

			return state;
		}

		throw new Error('invalid action');
	}

	goalTest(state: number[]): boolean {
		let [g1, g2, g3] = this.goal;
		let [j1, j2, j3] = state;
		return j1 == g1 && j2 == g2 && j3 == g3;
	}

	/**
     * Cost of path from start node to state1 assuming cost c to
        get to state1 and doing action to get to state2
     * @param cost 
     * @param state1 
     * @param action 
     * @param state2 
     */
	pathCost(
		cost: number,
		state1: number[],
		action: Action,
		state2: number[]
	): number {
		if (action.action === 'fill') {
			return (
				cost +
				1 +
				state1.reduce((prev, x, xi) => {
					const y = state2[xi];
					if (x !== y) {
						return prev + Math.abs(x - y);
					}
					return prev;
				}, 0)
			);
		}

		return cost + 1;
	}

	value(state: number[]): number {
		// const s = this.goal.reduce((p, c)=> p + c,0);

		return state.reduce((prev, cur, i) => {
			let g = this.goal[i];

			prev += g * cur;

			return prev;
		}, 0);
	}

	toString(): string {
		return `WJ3 ${this.capacities}, ${this.initial}, ${this.goal}`;
	}

	h(node: Node) {
		let nstate = node.state as number[];

		return nstate.reduce((prev, cur, i) => {
			// prev += Math.abs(cur - this.goal[i]);
			if (cur !== this.goal[i]) {
				prev += 1;
			}
			return prev;
		}, 0);
	}
}

/**
 * If a path to a goal was found, prints the cost and the sequence of actions
    and states on a path from the initial state to the goal found
 * @param solution 
 */
export function printSolution(solution: Node) {
	if (!solution) {
		console.log('No solution found 🙁');
		return;
	}

	const pathCost = solution.pathCost;
	const str = ['Path of cost: ', pathCost, ': '];
	str.push(solution.path().length, ': ');

	for (let node of solution.path()) {
		if (!node.action) {
			// if undefined/null initial state
			str.push(node.state.toString(), ' ');
		} else {
			const a = node.action as Action;

			str.push(
				`- (${a.action}, ${a.which}, ${a.to || ''}) -> [`,
				node.state.toString(),
				'] '
			);
		}
	}

	console.log(str.join(''));
}
