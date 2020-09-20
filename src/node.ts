import { Problem } from './search';

/**
 * A node in a search tree. Contains a pointer to the parent (the node
    that this is a successor of) and to the actual state for this node. Note
    that if a state is arrived at by two paths, then there are two nodes with
    the same state. Also includes the action that got us to this state, and
    the total path_cost (also known as g) to reach the node. Other functions
    may add an f and h value; see best_first_graph_search and astar_search for
    an explanation of how the f and h values are handled. You will not need to
    subclass this class.
 */
export class Node<State = any, Action = any> {
	depth = 0;
	f: number = 0;

	constructor(
		public state: State,
		public parent?: Node<State, Action>,
		public action?: Action,
		public pathCost: number = 0
	) {
		// console.log('pathCost', pathCost);
		if (parent) {
			this.depth = parent.depth + 1;
		}
	}

	toString() {
		const str =
			this.state && typeof this.state === 'string'
				? this.state
				: JSON.stringify(this.state);
		return `<Node ${str}></Node>`;
	}

	isLessThan(node: Node) {
		return this.state < node.state;
	}

	/**
	 * [Figure 3.10]
	 * @param problem
	 * @param action
	 */
	childNode(problem: Problem, action: Action): Node {
		const nextState = problem.result(this.state, action);
		const pathCost = problem.pathCost(
			this.pathCost,
			this.state,
			action,
			nextState
		);
		const nextNode = new Node(nextState, this, action, pathCost);
		return nextNode;
	}

	/**
	 * List the nodes reachable in one step from this node.
	 * @param problem
	 */
	expand(problem: Problem): Node[] {
		const nodes = problem
			.actions(this.state)
			.map((action) => this.childNode(problem, action));
		return nodes;
	}

	/**
	 * Return the sequence of actions to go from the root to this node.
	 */
	solution() {
		const solution = this.path().map((node) => node.action);
		return solution;
	}

	/**
	 * Return a list of nodes forming the path from the root to this node.
	 */
	path(): Node[] {
		let node = this;
		const pathBack = [];

		while (node) {
			pathBack.unshift(node);
			node = node.parent as any;
		}

		return pathBack;
	}

	// # We want for a queue of nodes in breadth_first_graph_search or
	// # astar_search to have no duplicated states, so we treat nodes
	// # with the same state as equal. [Problem: this may not be what you
	// # want in other contexts.]

	equalsTo(other: Node) {
		return this.hash() === other.hash();
	}

	// # We use the hash value of the state
	// # stored in the node instead of the node
	// # object itself to quickly search a node
	// # with the same state in a Hash Table
	hash() {
		return typeof this.state === 'string'
			? this.state
			: JSON.stringify(this.state);
	}

	/**
	 * If a path to a goal was found, prints the cost and the sequence of actions
		and states on a path from the initial state to the goal found
	*/
	printSolution(
		// solution: Node,
		actionPresentation: (n: Node) => string
	) {
		// if (!solution) {
		// 	console.log('No solution found 🙁');
		// 	return;
		// }
		let solution = this;

		const pathCost = solution.pathCost;
		const str = ['Path of cost: ', pathCost, ': '];
		str.push(solution.path().length, ': ');

		for (let node of solution.path()) {
			if (!node.action) {
				// if undefined/null initial state
				str.push(node.state.toString(), ' ');
			} else {
				str.push(
					`- ${actionPresentation(node)} -> [`,
					node.state.toString(),
					'] '
				);
			}
		}

		console.log(str.join(''));
	}
}
