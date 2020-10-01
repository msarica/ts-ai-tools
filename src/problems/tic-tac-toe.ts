/** 
 * A Simple Game: Tic-Tac-Toe

We have the notion of an abstract game, we have some search functions; 
now it is time to define a real game; a simple one, tic-tac-toe. 
Moves are `(x, y)` pairs denoting squares, where `(0, 0)` is the top left, 
and `(2, 2)` is the bottom right (on a board of size `height=width=3`)
 */

import { range } from '../utils';
import {
	Board,
	Game,
	GameState,
	PlayerMove,
	PlayerSymbol,
} from '../game.abstract';

/**
* Play TicTacToe on an 'height' by 'width' board, needing 'k' in a row to win.
'X' plays first against 'O'.
*/
export class TicTacToe extends Game<GameState> {
	constructor(public height = 3, public width = 3, public k = 3) {
		super();

		let moves: [number, number][] = [];
		for (let x of range(1, height + 1)) {
			for (let y of range(1, width + 1)) {
				moves.push([x, y]);
			}
		}

		this.initial = <GameState>{
			toMove: 'X',
			utility: 0,
			board: {},
			moves: moves,
			move: null,
		};
	}

	/**
	 * Legal moves are any square not yet taken.
	 */
	actions(state): PlayerMove[] {
		return state.moves;
	}

	/**
	 * Place a marker for current player on square.
	 */
	result(state: GameState, move: PlayerMove): GameState {
		// if not in
		if (!state.moves.find(([x, y]) => x == move[0] && y == move[1])) {
			return state; // illegal move has no effect
		}

		let board = { ...state.board };
		board[this.moveAsString(move)] = state.toMove;
		let moves = state.moves.filter(([x, y]) => !(x == move[0] && y == move[1]));
		let toMove = state.toMove == 'X' ? 'O' : 'X';

		return <GameState>{
			toMove,
			utility: this.computeUtility(board, move, state.toMove),
			board: board,
			moves: moves,
		};
	}

	private moveAsString(move: number[]) {
		return `${move[0]},${move[1]}`;
	}

	/**
	 * Return the value to player; 1 for win, -1 for loss, 0 otherwise.
	 */
	utility(state: GameState, player: PlayerSymbol) {
		return player === 'X' ? state.utility : -1 * state.utility;
	}

	terminalTest(state: GameState) {
		return state.utility != 0 || state.moves.length == 0;
	}

	toString() {
		return '';
	}

	goalTest(state: GameState) {
		return true;
	}

	display(state: GameState) {
		let board = state.board;
		for (let x of range(1, this.height + 1)) {
			let row = '';
			for (let y of range(1, this.width + 1)) {
				row += board[`${x},${y}`] || '.';
			}
			console.log(row);
		}
		console.log('');
	}

	/**
	 * If 'X' wins with this move, return 1; if 'O' wins return -1; else return 0.
	 * @param board
	 * @param move
	 * @param player
	 */
	computeUtility(board: Board, move: PlayerMove, player: PlayerSymbol) {
		if (
			this.k_in_row(board, move, player, [0, 1]) ||
			this.k_in_row(board, move, player, [1, 0]) ||
			this.k_in_row(board, move, player, [1, -1]) ||
			this.k_in_row(board, move, player, [1, 1])
		) {
			return player == 'X' ? 1 : -1;
		}

		return 0;
	}

	/**
	 * Return true if there is a line through move on board for player.
	 * @param board
	 * @param move
	 * @param player
	 * @param delta_x_y
	 */
	k_in_row(
		board: Board,
		move: PlayerMove,
		player: PlayerSymbol,
		delta_x_y: PlayerMove
	) {
		let [deltaX, deltaY] = delta_x_y;

		let [x, y] = move;
		let xy = `${x},${y}`;
		let n = 0; // n is the number of moves in row
		while (board[xy] === player) {
			n += 1;
			x = x + deltaX;
			y = y + deltaY;
			xy = `${x},${y}`;
		}

		[x, y] = move;
		xy = `${x},${y}`;
		while (board[xy] === player) {
			n += 1;
			x = x - deltaX;
			y = y - deltaY;
			xy = `${x},${y}`;
		}
		n -= 1; // because we counted move itself twice

		return n >= this.k;
	}
}
