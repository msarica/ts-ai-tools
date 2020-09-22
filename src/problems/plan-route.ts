import { Node } from '../node';
import { Problem } from '../problem.abstract';
import { isSameArray } from '../utils';

type PlanRouteState = [number, number, string];

export class WumpusPosition {
	constructor(private state: PlanRouteState) {}

	getLocation() {
		const [x, y] = this.state;
		return [x, y];
	}

	setLocation(x: number, y: number) {
		this.state[0] = x;
		this.state[1] = y;
	}

	getOrientation() {
		return this.state[2];
	}

	setOrientation(o: string) {
		this.state[2] = o;
	}

	isEqual(other: WumpusPosition) {
		return isSameArray(other.state, this.state);
	}

	getState() {
		return this.state;
	}
}

interface PlanRouteAction {}
/**
 *  The problem of moving the Hybrid Wumpus Agent from one place to other
 */
export class PlanRoute extends Problem {
	constructor(
		initial: WumpusPosition,
		goal: WumpusPosition,
		private allowed: number[][],
		private dimrow: number
	) {
		super(initial, goal);
	}

	toString(): string {
		throw new Error('Method not implemented.');
	}

	remove<T>(list: T[], item: T) {
		const i = list.indexOf(item);
		if (i === -1) return;
		list.splice(i, 1);
	}
	/**
     * Return the actions that can be executed in the given state.
        The result would be a list, since there are only three possible actions
        in any given state of the environment
     * @param state 
     */
	actions(state: WumpusPosition): PlanRouteAction[] {
		let possibleActions = ['forward', 'turnLeft', 'turnRight'];
		let [x, y, orientation] = state.getState();

		// prevent bumps
		if (x == 1 && orientation === 'left')
			this.remove(possibleActions, 'forward');
		if (y == 1 && orientation === 'down')
			this.remove(possibleActions, 'forward');
		if (x === this.dimrow && orientation === 'right')
			this.remove(possibleActions, 'forward');
		if (y === this.dimrow && orientation === 'up')
			this.remove(possibleActions, 'forward');

		return possibleActions;
	}

	/**
     * Given state and action, return a new state that is the result of the action.
        Action is assumed to be a valid action in the state 
     * @param state 
     * @param action 
     */
	result(state: WumpusPosition, action: PlanRouteAction) {
		let [x, y, orientation] = state.getState();

		let proposedLocation: number[] = [];

		// move forward

		if (action === 'forward') {
			if (orientation === 'up') proposedLocation = [x, y + 1];
			else if (orientation === 'down') proposedLocation = [x, y - 1];
			else if (orientation === 'left') proposedLocation = [x - 1, y];
			else if (orientation === 'rigth') proposedLocation = [x + 1, y];
			else throw new Error('invalid orientation');

			// Rotate counter-clockwise
		} else if (action === 'turnLeft') {
			if (orientation == 'up') state.setOrientation('left');
			else if (orientation === 'down') state.setOrientation('right');
			else if (orientation === 'left') state.setOrientation('down');
			else if (orientation === 'rigth') state.setOrientation('up');
			else throw new Error('invalid');
		}
		// rotate clock wise
		else if (action === 'turnRigth') {
			if (orientation == 'up') state.setOrientation('rigth');
			else if (orientation === 'down') state.setOrientation('left');
			else if (orientation === 'left') state.setOrientation('up');
			else if (orientation === 'rigth') state.setOrientation('down');
			else throw new Error('invalid');
		}

		if (this.allowed.some((i) => isSameArray(i, proposedLocation)))
			state.setLocation(proposedLocation[0], proposedLocation[1]);

		return state;
	}

	goalTest(state: PlanRouteState): boolean {
		return isSameArray(state, this.goal);
	}

	/**
	 * Manhattan Heuristic Function
	 * @param node
	 */
	h(node: Node) {
		let [x1, y1, o1] = node.state;
		let [x2, y2, o2] = this.goal;

		return Math.abs(x2 - x1) + Math.abs(y2 - y1);
	}
}
