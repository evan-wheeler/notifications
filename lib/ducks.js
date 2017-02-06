'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.notifyInfo = exports.notifyError = exports.notifyWarning = exports.notifySuccess = exports.notifySend = exports.notifyClear = exports.notifShow = exports.notifHide = exports.notifyTick = exports.notifyAddDup = exports.notifyResume = exports.notifyPause = exports.notifyDismiss = exports.NOTIF_TICK = exports.NOTIF_ADD_DUP = exports.NOTIF_RESUME = exports.NOTIF_PAUSE = exports.NOTIF_CLEAR = exports.NOTIF_HIDE = exports.NOTIF_SHOW = exports.NOTIF_DISMISS = exports.NOTIF_SEND = exports.NAME = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.updateTicker = updateTicker;
exports.notificationSaga = notificationSaga;
exports.getNotifyTimeoutID = getNotifyTimeoutID;
exports.getNotifyByID = getNotifyByID;

var _effects = require('redux-saga/effects');

var _reduxSaga = require('redux-saga');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var _marked = [updateTicker, displayNotify, notificationSaga].map(regeneratorRuntime.mark);

var NAME = exports.NAME = 'notifications';

/** ********************************************************/
/** ********************* Action Types *********************/
/** ********************************************************/

var NOTIF_SEND = exports.NOTIF_SEND = 'notifications/NOTIF_SEND';
var NOTIF_DISMISS = exports.NOTIF_DISMISS = 'notifications/NOTIF_DISMISS';
var NOTIF_SHOW = exports.NOTIF_SHOW = 'notifications/NOTIF_SHOW';
var NOTIF_HIDE = exports.NOTIF_HIDE = 'notifications/NOTIF_HIDE';
var NOTIF_CLEAR = exports.NOTIF_CLEAR = 'notifications/NOTIF_CLEAR';
var NOTIF_PAUSE = exports.NOTIF_PAUSE = 'notifications/NOTIF_PAUSE';
var NOTIF_RESUME = exports.NOTIF_RESUME = 'notifications/NOTIF_RESUME';
var NOTIF_ADD_DUP = exports.NOTIF_ADD_DUP = 'notifications/NOTIF_ADD_DUP';
var NOTIF_TICK = exports.NOTIF_TICK = 'notifications/NOTIF_TICK';

/*********************************************************/
/** ********************* ACTION CREATORS *****************/
/*********************************************************/

var MAX_ID = Math.pow(2, 31) - 1;

var notifyDismiss = exports.notifyDismiss = function notifyDismiss(id) {
    return { type: NOTIF_DISMISS, id: id };
};
var notifyPause = exports.notifyPause = function notifyPause(id) {
    return { type: NOTIF_PAUSE, id: id };
};
var notifyResume = exports.notifyResume = function notifyResume(id) {
    return { type: NOTIF_RESUME, id: id };
};
var notifyAddDup = exports.notifyAddDup = function notifyAddDup(id) {
    return { type: NOTIF_ADD_DUP, id: id };
};
var notifyTick = exports.notifyTick = function notifyTick(id, percent, tickDuration) {
    return { type: NOTIF_TICK, id: id, percent: percent, tickDuration: tickDuration };
};

var notifHide = exports.notifHide = function notifHide(id) {
    return { type: NOTIF_HIDE, id: id };
};
var notifShow = exports.notifShow = function notifShow(payload) {
    return { type: NOTIF_SHOW, payload: payload };
};
var notifyClear = exports.notifyClear = function notifyClear() {
    return { type: NOTIF_CLEAR };
};

var NUM_TICKS = 3; // Time subdivisions for toast progress
// set as granular as needed, but
// fewer results in fewer dispatches.

var PROGRESS_RESET_TIME = 100; // ms to wait after resetting progress bar
// (hack to allow CSS animation to register).

var FULL_BAR = 100; // 100% bar

// Dispatch to display a toast.

var notifySend = exports.notifySend = function notifySend(msgObj) {
    var payload = _extends({}, msgObj);

    if (typeof payload.id === 'undefined') {
        payload.id = Math.floor(Math.random() * MAX_ID);
    }

    payload.dismissable = payload.dismissable !== false;
    payload.title = payload.title || 'Notice';
    payload.type = payload.type || 'info';
    payload.count = 1;
    payload.percent = 100;
    payload.ticks = payload.ticks || NUM_TICKS;
    payload.countdown = true;

    if (payload.duration > 0) {
        payload.tickDuration = Math.floor(payload.duration / payload.ticks);
        payload.extendedDuration = payload.extendedDuration || payload.duration / 2;
    }

    return {
        type: NOTIF_SEND,
        payload: payload
    };
};

// Helper to make send-by-level functions.

function makeNotifyLevel(msgTitle, msgType, iconCls) {
    return function notifyLvl(message) {
        var title = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : msgTitle;
        var duration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 5000;
        var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

        var payload = _extends({
            iconCls: iconCls
        }, options, {
            message: message,
            title: title,
            duration: duration,
            type: msgType
        });
        return notifySend(payload);
    };
}

// convenience functions for different types of notifications

var notifySuccess = exports.notifySuccess = makeNotifyLevel('Success', 'success', 'fa fa-check');
var notifyWarning = exports.notifyWarning = makeNotifyLevel('Warning', 'warning', 'fa fa-exclamation');
var notifyError = exports.notifyError = makeNotifyLevel('Error', 'error', 'fa fa-exclamation-triangle');
var notifyInfo = exports.notifyInfo = makeNotifyLevel('Info', 'info', 'fa fa-info-circle');

/** ********************************************************/
/** ********************* SAGAS ****************************/
/** ********************************************************/

function waitForX() {
    for (var _len = arguments.length, types = Array(_len), _key = 0; _key < _len; _key++) {
        types[_key] = arguments[_key];
    }

    return types.map(function (t) {
        return regeneratorRuntime.mark(function waitFor(id) {
            return regeneratorRuntime.wrap(function waitFor$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.next = 2;
                            return (0, _effects.take)(function (a) {
                                return a.type === t && a.id === id;
                            });

                        case 2:
                            return _context.abrupt('return', true);

                        case 3:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, waitFor, this);
        });
    });
}

var _waitForX = waitForX(NOTIF_DISMISS, NOTIF_PAUSE, NOTIF_RESUME, NOTIF_ADD_DUP),
    _waitForX2 = _slicedToArray(_waitForX, 4),
    onDismiss = _waitForX2[0],
    onPause = _waitForX2[1],
    onResume = _waitForX2[2],
    onAddDup = _waitForX2[3];

function calcProgress(counter, ticks) {
    return Math.max(0, FULL_BAR - Math.floor(FULL_BAR * counter / ticks));
}

// Saga to advance the progress bar on the toast (and duration timer).
function updateTicker(id, duration, tickDuration, ticks) {
    var counter, tickLen;
    return regeneratorRuntime.wrap(function updateTicker$(_context2) {
        while (1) {
            switch (_context2.prev = _context2.next) {
                case 0:
                    counter = 0;

                    // This is to allow us to use CSS animations on the front-end.
                    // Set percent to 100 and give it time to animate there.

                    _context2.next = 3;
                    return (0, _effects.put)(notifyTick(id, FULL_BAR, PROGRESS_RESET_TIME));

                case 3:
                    _context2.next = 5;
                    return (0, _reduxSaga.delay)(PROGRESS_RESET_TIME);

                case 5:
                    if (!(counter < ticks)) {
                        _context2.next = 14;
                        break;
                    }

                    counter++;

                    // On first tick, shorten the duration since we used
                    // some of the time to update the progress to 100%.
                    tickLen = counter === 1 ? Math.max(0, tickDuration - PROGRESS_RESET_TIME) : tickDuration;

                    // Dispatch the update and then wait.

                    _context2.next = 10;
                    return (0, _effects.put)(notifyTick(id, calcProgress(counter, ticks), tickLen));

                case 10:
                    _context2.next = 12;
                    return (0, _reduxSaga.delay)(tickLen);

                case 12:
                    _context2.next = 5;
                    break;

                case 14:
                    _context2.next = 16;
                    return true;

                case 16:
                    return _context2.abrupt('return', _context2.sent);

                case 17:
                case 'end':
                    return _context2.stop();
            }
        }
    }, _marked[0], this);
}

function displayNotify(_ref) {
    var payload = _ref.payload;
    var id, extendedDuration, duration, tickDuration, curState, notifications, dup, racers, winner, resumeOrClose;
    return regeneratorRuntime.wrap(function displayNotify$(_context3) {
        while (1) {
            switch (_context3.prev = _context3.next) {
                case 0:
                    id = payload.id, extendedDuration = payload.extendedDuration;
                    duration = payload.duration, tickDuration = payload.tickDuration;
                    _context3.next = 4;
                    return (0, _effects.select)();

                case 4:
                    curState = _context3.sent;
                    notifications = curState[NAME];
                    dup = notifications.find(function (n) {
                        return n.message === payload.message && n.title === payload.title && n.type === payload.type;
                    });

                    if (!dup) {
                        _context3.next = 11;
                        break;
                    }

                    _context3.next = 10;
                    return (0, _effects.put)(notifyAddDup(dup.id));

                case 10:
                    return _context3.abrupt('return', _context3.sent);

                case 11:
                    _context3.next = 13;
                    return (0, _effects.put)(notifShow(payload));

                case 13:
                    racers = {
                        dismiss: (0, _effects.call)(onDismiss, id),
                        pause: (0, _effects.call)(onPause, id)
                    };


                    if (duration > 0) {
                        // progress ticker if we have one, otherwise just a delay.
                        racers.timeout = tickDuration > 0 ? (0, _effects.call)(updateTicker, id, duration, tickDuration, NUM_TICKS) : (0, _effects.call)(_reduxSaga.delay, duration);

                        // If duration is specified, also listen for duration extension.
                        racers.addDup = (0, _effects.call)(onAddDup, id);
                    }

                    _context3.next = 17;
                    return (0, _effects.race)(racers);

                case 17:
                    winner = _context3.sent;

                    if (!(winner.dismiss || winner.timeout)) {
                        _context3.next = 22;
                        break;
                    }

                    return _context3.abrupt('break', 35);

                case 22:
                    if (!winner.addDup) {
                        _context3.next = 27;
                        break;
                    }

                    // Duplicate toast was displayed, so reset the
                    // timer by looping again and restore the original duration, in case
                    // it was changed by a pause/resume.

                    duration = payload.duration;
                    tickDuration = payload.ticks > 0 ? duration / payload.ticks : 0;
                    _context3.next = 33;
                    break;

                case 27:
                    _context3.next = 29;
                    return (0, _effects.race)({
                        dismiss: (0, _effects.call)(onDismiss, id),
                        resume: (0, _effects.call)(onResume, id)
                    });

                case 29:
                    resumeOrClose = _context3.sent;

                    if (!resumeOrClose.dismiss) {
                        _context3.next = 32;
                        break;
                    }

                    return _context3.abrupt('break', 35);

                case 32:

                    if (extendedDuration > 0) {
                        // after resume, use extend duration as duration.
                        duration = extendedDuration;
                        tickDuration = Math.floor(duration / payload.ticks);
                    }

                case 33:
                    _context3.next = 13;
                    break;

                case 35:
                    _context3.next = 37;
                    return (0, _effects.put)({ type: NOTIF_HIDE, id: id });

                case 37:
                case 'end':
                    return _context3.stop();
            }
        }
    }, _marked[1], this);
}

function notificationSaga() {
    return regeneratorRuntime.wrap(function notificationSaga$(_context4) {
        while (1) {
            switch (_context4.prev = _context4.next) {
                case 0:
                    _context4.next = 2;
                    return (0, _effects.takeEvery)(NOTIF_SEND, displayNotify);

                case 2:
                case 'end':
                    return _context4.stop();
            }
        }
    }, _marked[2], this);
}

/** ********************************************************/
/** ********************* SELECTORS ************************/
/** ********************************************************/

function getNotifyTimeoutID(state, id) {
    var notif = getNotifyByID(state, id);
    return notif ? notif.timeoutID : null;
}

function getNotifyByID(state, id) {
    return state[NAME].find(function (e) {
        return e.id === id;
    });
}

/** ********************************************************/
/** ********************* REDUCERS *************************/
/** ********************************************************/

var reducer = function reducer() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var action = arguments[1];

    switch (action.type) {
        case NOTIF_SHOW:
            return [_extends({}, action.payload)].concat(_toConsumableArray(state.filter(function (n) {
                return n.id !== action.payload.id;
            })));
        case NOTIF_ADD_DUP:
            return state.map(function (n) {
                return n.id === action.id ? _extends({}, n, {
                    count: n.count + 1,
                    percent: 100,
                    tickDuration: 100
                }) : n;
            });
        case NOTIF_HIDE:
            return state.filter(function (n) {
                return n.id !== action.id;
            });
        case NOTIF_PAUSE:
            return state.map(function (n) {
                return n.id === action.id ? _extends({}, n, {
                    percent: 100,
                    tickDuration: 100
                }) : n;
            });
        case NOTIF_RESUME:
            return state.map(function (n) {
                return n.id === action.id ? _extends({}, n, {
                    percent: 100,
                    tickDuration: 100
                }) : n;
            });
        case NOTIF_TICK:
            return state.map(function (n) {
                return n.id === action.id ? _extends({}, n, {
                    percent: action.percent,
                    tickDuration: action.tickDuration
                }) : n;
            });
        case NOTIF_CLEAR:
            return [];
        default:
            return state;
    }
};

exports.default = reducer;