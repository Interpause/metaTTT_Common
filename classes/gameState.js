const enums = require("../utils/enums");
const gconf = require("../utils/game_config");

/**
 * class for game state
 */
module.exports = class State {
	/** the current player id */
	get cur_player() {return this.player_ids[this.cur_player_ind];}

	/**
	 * constructor for a game state
	 * @param {{}} obj If from_json = true, copy current state from obj
	 * @param {boolean} from_json When true, copy current state from obj
	 */
	constructor(obj,from_json){
		/** game config, defaults to utils/game_config.js */
		this.config = gconf;
		/** history of changes made to state */
		this.history = [];
		/** player ids of players */
		this.player_ids	= [];
		/**
		 * type of this.grid, winner is similar to this.winner:
		 * ```
		 * {
		 * 	winner:null,
		 * 	[subboard]:{
		 * 		winner:null,
		 * 		[square]:{ winner:null }
		 * 	}
		 * }
		 * ```
		 */
		this.grid	= {};
		/** turns passed */
		this.turns = 0;
		/** index of the player in this.player_ids that won, -1 if draw, null if no winner yet */
		this.winner = null;
		/** current sub-board in play, null if all boards in play */
		this.cur_board = null;
		/** the index of the current player in this.player_ids */
		this.cur_player_ind = 0;

		if(from_json){
			this.config = obj.config;
			this.history = obj.history;
			this.player_ids = obj.player_ids;
			this.grid = obj.grid;
			this.turns = obj.turns;
			this.winner = obj.winner;
			this.cur_board = obj.cur_board;
			this.cur_player_ind = obj.cur_player_ind;
			return;
		}
		if(obj) this.config = obj;
		this.config.size = this.config.grid_len**2;
		this.grid = {winner:null};
		this.history.push(this.config);

		//Generates grid.
		for(let i = 1; i <= this.config.size; i++){
			let square = {winner:null};
			for (let n = 1; n <= this.config.size; n++) square[n] = {winner:null};
			this.grid[i] = square;
		}
	}

	/**
	 * checks if move is valid, places the move, checks for sub-board wins, and then updates board
	 * @param {[number,number]} move move by current player
	 * @throws enums.error if game is already over
	 * @throws enums.locked if that sub-board is locked and hence cannot be placed in
	 * @throws enums.occupied if that square is occupied
	 */
	place(move){
		this.checkMoveValid(move);
		this.grid[move[0]][move[1]].winner = this.cur_player_ind; //winner is set as index, not id
		this.history.push([this.cur_player,move]);
		this.updateWins(move[0]);

		if(this.grid[move[1]].winner != null) this.cur_board = null;
		else this.cur_board = move[1];
	
		this.turns++;
		this.cur_player_ind = this.turns % this.config.num_players;
	}

	/**
	 * checks for wins in sub-boards then the larger board as a whole then updates
	 * @param {number} ind which sub-board was placed in, hence which sub-board to check
	 */
	updateWins(ind){
		if(this.winner != null) return;

		let small_win = this.checkWin(this.grid[ind]);
		if(small_win == -1) this.grid[ind].winner = -1;
		else if(small_win == 1){
			this.grid[ind].winner = this.cur_player_ind;

			let big_win = this.checkWin(this.grid);
			if(big_win == -1){
				this.grid.winner = -1;
				this.winner = -1;
			}else if(big_win == 1){
				this.grid.winner = this.cur_player_ind;
				this.winner = this.cur_player_ind;
			}
		}
	}

	/**
	 * checks win for any board without updating the board
	 * @param {Object} board the board to check
	 */
	checkWin(board){
		let full = true;
		for(let n = 1; n <= this.config.size; n++){
			for(let check in this.config.checks){
				let win = true;
				let crd = this.oD2D(n);
				for(let i = 1; win && i < this.config.win_req; i++){
					if(board[n].winner == null){
						win = false;
						full = false;
						break;
					}
					let ncrd = {x:crd.x + i * this.config.checks[check][0],y:crd.y + i * this.config.checks[check][1]};
					if(ncrd.y >= this.config.grid_len | ncrd.x >= this.config.grid_len | ncrd.y < 0 | ncrd.x < 0){
						win = false;
						break;
					}
					if(board[this.tD1D(ncrd)].winner != board[n].winner){
						win = false;
						break;
					}
				}
				if(win) return 1;
			}
		}
		if(full) return -1;
		return 0;
	}

	/**
	 * checks if move is valid
	 * @param {[number,number]} move move by current player
	 * @throws enums.error if game is already over
	 * @throws enums.locked if that sub-board is locked and hence cannot be placed in
	 * @throws enums.occupied if that square is occupied
	 */
	checkMoveValid(move){
		if(this.winner != null) throw new Error(enums.error);
		if(this.cur_board != null && this.cur_board != move[0]) throw new Error(`${enums.locked}: ${move[0]},${move[1]}`);
		if(this.grid[move[0]][move[1]].winner != null) throw new Error(`${enums.occupied}: ${move[0]},${move[1]}`);
	}

	/** converts 1D "coord" to 2D coord */
	oD2D(n){return {x:(n - 1) % this.config.grid_len,y:Math.floor((n - 1) / this.config.grid_len)};}
	/** converts 2D coord to 1D "coord" */
	tD1D(coord){return coord.y * this.config.grid_len + coord.x + 1;}
}