const enums = require("../utils/enums");
const gconf = require("../utils/game_config");
const gameState = require("../classes/gameState");
const EventEmitter = require('events');

/** Class for a game session */
module.exports = class Session extends EventEmitter {

	/**
	 * constructor for a game session
	 * @param {{}} gui if null, constructs as a server session, else local session
	 */
	constructor(gui){
		super();

		/** the game session's state */
		this.state = {};
		/** whether the game has started */
		this.isStarted = false;
		/** current number of players in session */
		this.num_players = 0;
		/** max number of players in session */
		this.max_players = 0;
		/** current number of spectators in session */
		this.num_spectators	= 0;
		/** game config */
		this.gconfig = gconf;
		/** whether it is a server or local session */
		this.online = (gui==null);
		/** reference to the GUI object present only locally */
		this.gui = gui;
		/** player ids of players */
		this.player_ids = [];
		/** player ids of spectators */
		this.spectators = [];
	}

	/**
	 * initializes the game state for the session
	 * @param {{}} gconfig if provided, will use gconfig to initialize, else default in utils/game_config.js
	 */
	init(gconfig){
		if(gconfig) this.gconfig = gconfig;
		this.max_players = this.gconfig.num_players;
		this.state = new gameState(this.gconfig);	
	}

	/**
	 * restores game session from saved game state
	 * @param {{}} state saved game state
	 */
	restoreSession(state){
		this.gconfig = state.config;
		this.max_players = this.gconfig.num_players;
		this.num_players = this.max_players;
		this.player_ids = state.player_ids.slice(); //copy
		this.spectators = state.player_ids.slice();
		this.state = new gameState(state,true);
	}

	/**
	 * adds a player to the session
	 * @param {string} pid player id to add
	 * @throws enums.started if session already started
	 */
	addPlayer(pid){
		if(this.isStarted) throw new Error(enums.started);
		if(this.max_players == this.num_players) throw new Error(enums.full);
		this.player_ids.push(pid);
		this.addSpectator(pid);
		this.num_players++;
	}

	/** adds spectator to the session */
	addSpectator(pid){
		this.spectators.push(pid);
		this.num_spectators++;
	}

	/** removes spectator from the session */
	removeSpectator(pid){
		let ind = this.spectators.indexOf(pid);
		if(ind > -1) this.spectators.splice(ind,1);
		else return;
		this.num_spectators--;
	}

	/**
	 * returns the game state if player is a spectator of the session
	 * @param {string} pid player id
	 * @throws enum.locked if player is not a spectator of the session
	 */
	getState(pid){
		if(this.spectators.indexOf(pid) > -1) return this.state;
		else throw new Error(enums.locked);
	}

	/** gets some info about the session used in displaying it in the gui */
	getInfo(){
		let info = {
			started: this.isStarted,
			numPlys: this.num_players,
			maxPlys: this.max_players,
			gconf: this.gconfig,
			plyrs: this.player_ids,
			specs: this.spectators,
			turn:  this.state.turns,
			cur:   this.state.cur_player_ind
		}
		return info;
	}

	/**
	 * places move of player
	 * @param {string} pid player id
	 * @param {[number,number]} move move
	 * @throws enum.locked if not player's turn
	 */
	setInput(pid,move){
		if(this.state.cur_player == pid) this.state.place(move);
		else throw new Error(enums.locked);
	}

	/**
	 * starts the game session
	 * @throws enums.started if game already started
	 * @throws enums.error if game is not full yet
	 */
	start(){
		if(this.isStarted) throw new Error(enums.started);
		this.isStarted = true;
		if(this.num_players != this.max_players) throw new Error(enums.error);
		this.state.player_ids = this.player_ids;
		if(!this.online){
			this.gui.receivePlayersInfo(this.player_ids);
			this.gui.receiveBoard(this.state);
		}
	}
}