/** @module enums */
module.exports = {};
/* Lazy stand-in for both custom errors, status code & logging. */
//Specific
module.exports.locked = "BOARD LOCKED";
module.exports.occupied = "SQUARE FULL";
module.exports.started = "GAME STARTED";
module.exports.ended = "GAME ENDED";
module.exports.full = "GAME FULL";
module.exports.move = "MOVE";
module.exports.turn = "TURN";
module.exports.unfound = "NOT FOUND LOL";
//General
module.exports.okay = "OKAY";
module.exports.error = "FAIL";
module.exports.null = "NullPointerException";
module.exports.info = "INFO";
module.exports.busy = "BUSY";
//Server<-->Client events
module.exports.getSessions = "GET SESSIONS";
module.exports.getSpecSessions = "GET SPEC SESSIONS";
module.exports.createSession = "MAKE ME A GAME";
module.exports.findSession = "FIND ME A GAME";
module.exports.updateState = "STATE UPDATE";
module.exports.join = "JOIN";
module.exports.leave = "LEAVE";
module.exports.disconnect = "DISCONNECTING";
module.exports.connect = "HELLO";