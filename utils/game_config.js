/** @module gameConfig */
module.exports = {
    /** length of grid side */
    grid_len:3,
    /** number of players */
    num_players:2,
    /** required number of wins in a line */
    win_req:3,
    /** grid_len^2 */
    size:9,
    /** directions to check for wins in */
    checks:{
        horiz:[1,0],
        verti:[0,1],
        rdiag:[1,1],
        ldiag:[-1,1]
    }
};