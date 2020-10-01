/**
 * Game Tree Search

We start with defining the abstract class `Game`, for turn-taking *n*-player games. We rely on, but do not define yet, the concept of a `state` of the game; we'll see later how individual games define states. For now, all we require is that a state has a `state.to_move` attribute, which gives the name of the player whose turn it is. ("Name" will be something like `'X'` or `'O'` for tic-tac-toe.) 

We also define `play_game`, which takes a game and a dictionary of  `{player_name: strategy_function}` pairs, and plays out the game, on each turn checking `state.to_move` to see whose turn it is, and then getting the strategy function for that player and applying it to the game and the state to get a move.
 */

const prompt = require('prompt-sync')({ sigint: true });

export type PlayerFunc = (
	game: Game,
	state: GameState
) => PlayerMove | Promise<PlayerMove>;

// export type AlgorithmMove = [number, PlayerMove]; // utility, player move[n,n]
export type PlayerSymbol = string;
export type PlayerMove = number[];
export type Board = { [key: string]: PlayerSymbol };
export interface GameState {
	board: Board;
	move: PlayerMove;
	moves: PlayerMove[];
	toMove: PlayerSymbol;
	utility: number;
}
/**
   * A game is similar to a problem, but it has a terminal test instead of 
    a goal test, and a utility for each terminal state. To create a game, 
    subclass this class and implement `actions`, `result`, `is_terminal`, 
    and `utility`. You will also need to set the .initial attribute to the 
    initial state; this can be done in the constructor.
   */
export abstract class Game<TState extends GameState = any> {
	initial: TState;

	/**
	 * Return a collection of the allowable moves from this state.
	 */
	abstract actions(state: TState);

	/**
	 * Return the state that results from making a move from a state.
	 */
	abstract result(state: TState, move);

	/**
	 * Return True if this is a final state for the game.
	 */
	terminalTest(state: TState): boolean {
		return !this.actions.length;
	}

	/**
	 * Return the value of this final state to player.
	 */
	abstract utility(state: TState, player);

	/**
	 * Print or otherwise display the state.
	 * @param state
	 */
	abstract display(state: TState): void;

	/**
	 * Return the player whose move it is in this state.
	 * @param state
	 */
	toMove(state: TState) {
		return state.toMove;
	}

	/**
	 * Play an n-person, move-alternating game.
	 * @param players
	 */
	async playGame(players: PlayerFunc[]) {
		let state = this.initial;
		this.display(state);
		while (true) {
			for (let player of players) {
				let move = await player(this, state);
				state = this.result(state, move);
				this.display(state);
				if (this.terminalTest(state)) {
					return this.utility(state, this.toMove(this.initial));
				}
			}
		}
	}
}

/**
 * Play a turn-taking game. `strategies` is a {player_name: function} dict,
 * where function(state, game) is used to get the player's move.
 * @param game
 * @param strategies
 * @param verbose
 */
export function playGame(
	game: Game,
	strategies: { [key: string]: (game: Game, state: GameState) => any },
	verbose = true
) {
	let state = game.initial as GameState;

	while (!game.terminalTest(state)) {
		let player = state.toMove;
		let move = strategies[player](game, state);
		state = game.result(state, move);

		if (verbose) {
			console.log('Player', player, 'move: ', move);
			console.log(state);
		}
	}
}

/**
 * A game player who uses the specified search algorithm
 * @param search_algorithm
 */
export function player(search_algorithm: PlayerFunc) {
	return function (game: Game, state) {
		const move = search_algorithm(game, state);
		return move;
	};
}

/**
 * Minimax-Based Game Search Algorithms

We will define several game search algorithms. Each takes two inputs, the game we are 
playing and the current state of the game, and returns a a `(value, move)` pair, 
where `value` is the utility that the algorithm computes for the player whose turn 
it is to move, and `move` is the move itself.

First we define `minimax_search`, which exhaustively searches the game tree to 
find an optimal move (assuming both players play optimally), and `alphabeta_search`, 
which does the same computation, but prunes parts of the tree that could not possibly 
have an affect on the optimnal move.  
 */

/**
 * Given a state in a game, calculate the best move by searching
    forward all the way to the terminal states. [Figure 5.3].
 * @param game
 * @param state
 */
export function minimaxSearch(game: Game, state: GameState): PlayerMove {
	let player = game.toMove(state);

	const maxValue = function (state: GameState): number {
		if (game.terminalTest(state)) {
			let utility = game.utility(state, player);
			return utility;
		}

		let v = -Infinity;

		for (let a of game.actions(state)) {
			const _result = game.result(state, a);
			v = Math.max(v, minValue(_result));
			// console.log(player, a, v2);
		}
		return v;
	};

	const minValue = function (state: GameState): number {
		if (game.terminalTest(state)) {
			return game.utility(state, player);
		}
		let v = Infinity;

		for (let a of game.actions(state)) {
			let _result = game.result(state, a);
			v = Math.min(v, maxValue(_result));
		}
		return v;
	};

	let act = (game.actions(state) as PlayerMove[])
		.map((move) => ({
			sort: minValue(game.result(state, move)),
			move,
		}))
		.sort((a, b) => a.sort - b.sort);

	return act.pop().move;
}

/**
 * Search game to determine best action; use alpha-beta pruning.
    As in [Figure 5.7], this version searches all the way to the leaves.
 * @param game 
 * @param state 
 */
export function alphaBetaSearch(game: Game, state: GameState): PlayerMove {
	let player = state.toMove;

	const maxValue = function (
		state: GameState,
		alpha: number,
		beta: number
	): number {
		if (game.terminalTest(state)) {
			return game.utility(state, player);
		}

		let v = -Infinity;

		for (let a of game.actions(state)) {
			v = Math.max(v, minValue(game.result(state, a), alpha, beta));

			if (v >= beta) {
				return v;
			}

			alpha = Math.max(alpha, v);
		}

		return v;
	};

	const minValue = function (
		state: GameState,
		alpha: number,
		beta: number
	): number {
		if (game.terminalTest(state)) {
			return game.utility(state, player);
		}
		let v = Infinity;
		let move = null;
		for (let a of game.actions(state)) {
			v = Math.min(v, maxValue(game.result(state, a), alpha, beta));

			if (v <= alpha) {
				return v;
			}
			beta = Math.min(beta, v);
		}

		return v;
	};

	// Body of alpha_beta_search:
	let best_score = -Infinity;
	let beta = Infinity;
	let best_action: PlayerMove = null;
	let v;
	for (let a of game.actions(state)) {
		v = minValue(game.result(state, a), best_score, beta);
		if (v > best_score) {
			best_score = v;
			best_action = a;
		}
	}
	return best_action;
}

/**
 *
 * @param game
 * @param state
 */
export function user(game: Game, state: GameState): PlayerMove {
	const moveFn = (s: string) => {
		let p = s
			.replace(/\s+/, '')
			.split(',')
			.map((i) => +i);
		return [p[0], p[1]];
	};
	while (true) {
		try {
			let result;
			result = prompt('Your move? >');
			// result = '1,1';
			let move = moveFn(result) as PlayerMove;
			if (state.moves.find(([x, y]) => x == move[0] && y == move[1])) {
				// console.log(parts);
				return move;
			}
			console.log('invalid move');
		} catch (err) {
			console.log('invalid entry');
		}
	}
}
