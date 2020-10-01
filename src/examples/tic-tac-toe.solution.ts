import { TicTacToe } from '../problems/tic-tac-toe';
import { alphaBetaSearch, minimaxSearch, player, user } from '../game.abstract';

export async function playTicTacToe() {
	const t = new TicTacToe(3, 3);
	const p1 = player(user);
	// const p1 = player(minimaxSearch);

	const p2 = player(alphaBetaSearch);
	// const p2 = player(minimaxSearch);
	const result = await t.playGame([p1, p2]);
	console.log(result);
}

playTicTacToe();
