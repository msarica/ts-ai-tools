import { Problem } from '../search';
import { Node } from '../node';

export class EightPuzzle extends Problem<number[], string> {
	constructor(initial: number[], goal: number[]) {
		super(initial, goal);
	}

	toString(): string {
		return `8Puzzle: ${this.initial.join(',')}, ${this.goal.join(',')}`;
	}

	blankSquareIndex(state: number[]) {
		return state.indexOf(0);
	}

	remove(list: string[], s: string) {
		let i = list.indexOf(s);
		list.splice(i, 1);
	}

	/**
     * Return the actions that can be executed in the given state.
        The result would be a list, since there are only four possible actions
        in any given state of the environment
     * @param state 
     */
	actions(state: number[]): string[] {
		let possibleMoves = ['up', 'down', 'left', 'right'];

		let indexBlankSquare = this.blankSquareIndex(state);

		if (indexBlankSquare % 3 == 0) {
			this.remove(possibleMoves, 'left');
		}

		if (indexBlankSquare < 3) {
			this.remove(possibleMoves, 'up');
		}

		if (indexBlankSquare % 3 == 2) {
			this.remove(possibleMoves, 'right');
		}

		if (indexBlankSquare > 5) {
			this.remove(possibleMoves, 'down');
		}

		return possibleMoves;
	}

	/**
     * Given state and action, return a new state that is the result of the action.
        Action is assumed to be a valid action in the state
     * @param state 
     * @param action 
     */
	result(state: number[], action: string) {
		let blankIndex = this.blankSquareIndex(state);
		let newState = [...state];

		const delta = {
			up: -3,
			down: 3,
			left: -1,
			right: 1,
		};

		let neighbor = blankIndex + (delta as any)[action];

		newState[blankIndex] = state[neighbor];
		newState[neighbor] = state[blankIndex];
		return newState;
	}

	goalTest(state: number[]): boolean {
		return state.every((v, i) => v === this.goal[i]);
	}

	checkSolvability(state: number[]) {
		let inversion = 0;

		for (let i = 0; i < state.length; i++) {
			for (let j = i + 1; j < state.length; j++) {
				if (state[i] > state[j] && state[i] != 0 && state[j] != 0)
					inversion += 1;
			}
		}

		return inversion % 2 == 0;
	}

	h(node: Node) {
		return (node.state as number[]).reduce(
			(p, c, i) => p + (c != this.goal[i] ? 1 : 0),
			0
		);
	}
}
