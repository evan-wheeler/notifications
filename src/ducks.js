import { delay, put, take, call, race, takeEvery, select } from 'redux-saga/effects';

export const NAME = 'notifications';

/** ********************************************************/
/** ********************* Action Types *********************/
/** ********************************************************/

export const NOTIF_SEND = 'notifications/NOTIF_SEND';
export const NOTIF_DISMISS = 'notifications/NOTIF_DISMISS';
export const NOTIF_SHOW = 'notifications/NOTIF_SHOW';
export const NOTIF_HIDE = 'notifications/NOTIF_HIDE';
export const NOTIF_CLEAR = 'notifications/NOTIF_CLEAR';
export const NOTIF_PAUSE = 'notifications/NOTIF_PAUSE';
export const NOTIF_RESUME = 'notifications/NOTIF_RESUME';
export const NOTIF_ADD_DUP = 'notifications/NOTIF_ADD_DUP';
export const NOTIF_TICK = 'notifications/NOTIF_TICK';

/*********************************************************/
/** ********************* ACTION CREATORS *****************/
/*********************************************************/

const MAX_ID = Math.pow(2, 31) - 1;

export const notifyDismiss = (id) => ({ type: NOTIF_DISMISS, id });
export const notifyPause = (id) => ({ type: NOTIF_PAUSE, id });
export const notifyResume = (id) => ({ type: NOTIF_RESUME, id });
export const notifyAddDup = (id) => ({ type: NOTIF_ADD_DUP, id });
export const notifyTick = (id, percent, tickDuration) => ({ type: NOTIF_TICK, id, percent, tickDuration });

export const notifHide = (id) => ({ type: NOTIF_HIDE, id });
export const notifShow = (payload) => ({ type: NOTIF_SHOW, payload });
export const notifyClear = () => ({ type: NOTIF_CLEAR });

const NUM_TICKS = 3;                // Time subdivisions for toast progress
// set as granular as needed, but
// fewer results in fewer dispatches.

const PROGRESS_RESET_TIME = 100;    // ms to wait after resetting progress bar
// (hack to allow CSS animation to register).

const FULL_BAR = 100;               // 100% bar

// Dispatch to display a toast.

export const notifySend = (msgObj) => {
    const payload = { ...msgObj };

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
        payload.extendedDuration = payload.extendedDuration || (payload.duration / 2);
    }

    return {
        type: NOTIF_SEND,
        payload
    };
};

// Helper to make send-by-level functions.

function makeNotifyLevel(msgTitle, msgType, iconCls) {
    return function notifyLvl(message, title = msgTitle, duration = 5000, options = {}) {
        const payload = {
            iconCls,
            ...options,
            message,
            title,
            duration,
            type: msgType
        };
        return notifySend(payload);
    };
}

// convenience functions for different types of notifications

export const notifySuccess = makeNotifyLevel('Success', 'success', 'fa fa-check');
export const notifyWarning = makeNotifyLevel('Warning', 'warning', 'fa fa-exclamation');
export const notifyError = makeNotifyLevel('Error', 'error', 'fa fa-exclamation-triangle');
export const notifyInfo = makeNotifyLevel('Info', 'info', 'fa fa-info-circle');

/** ********************************************************/
/** ********************* SAGAS ****************************/
/** ********************************************************/

function waitForX(...types) {
    return types.map(
        t => function* waitFor(id) {
            yield take(a => a.type === t && a.id === id);
            return true;
        }
    );
}

const [onDismiss, onPause, onResume, onAddDup] = waitForX(NOTIF_DISMISS, NOTIF_PAUSE, NOTIF_RESUME, NOTIF_ADD_DUP);

function calcProgress(counter, ticks) {
    return Math.max(0, FULL_BAR - Math.floor(FULL_BAR * counter / ticks));
}

// Saga to advance the progress bar on the toast (and duration timer).
export function* updateTicker(id, duration, tickDuration, ticks) {
    let counter = 0;

    // This is to allow us to use CSS animations on the front-end.
    // Set percent to 100 and give it time to animate there.

    yield put(notifyTick(id, FULL_BAR, PROGRESS_RESET_TIME));
    yield delay(PROGRESS_RESET_TIME);

    while (counter < ticks) {
        counter++;

        // On first tick, shorten the duration since we used
        // some of the time to update the progress to 100%.
        let tickLen = (counter === 1)
            ? Math.max(0, tickDuration - PROGRESS_RESET_TIME) : tickDuration;

        // Dispatch the update and then wait.
        yield put(notifyTick(id, calcProgress(counter, ticks), tickLen));
        yield delay(tickLen);
    }

    return yield true;
}

function* displayNotify({ payload }) {
    const { id, extendedDuration } = payload;
    let { duration, tickDuration } = payload;

    const curState = yield select();
    const notifications = curState[NAME];

    const dup = notifications.find(n =>
        n.message === payload.message &&
        n.title === payload.title &&
        n.type === payload.type);

    if (dup) {
        // duplicates just increment a counter...
        return yield put(notifyAddDup(dup.id));
    }

    // Show the notification...
    yield put(notifShow(payload));

    // Wait for notification to be dismissed, paused/resumed, duplicated or for it to timeout.
    for (; ;) {
        let racers = {
            dismiss: call(onDismiss, id),
            pause: call(onPause, id)
        };

        if (duration > 0) {
            // progress ticker if we have one, otherwise just a delay.
            racers.timeout = tickDuration > 0
                ? call(updateTicker, id, duration, tickDuration, NUM_TICKS)
                : call(delay, duration);

            // If duration is specified, also listen for duration extension.
            racers.addDup = call(onAddDup, id);
        }

        const winner = yield race(racers);

        if (winner.dismiss || winner.timeout) {
            // Toast was dismissed or timed out.  Break and hide notification.
            break;
        } else if (winner.addDup) {
            // Duplicate toast was displayed, so reset the
            // timer by looping again and restore the original duration, in case
            // it was changed by a pause/resume.

            duration = payload.duration;
            tickDuration = payload.ticks > 0 ? duration / payload.ticks : 0;
        } else {
            // paused -- so freeze timeout (if any) -- user can still close manually ...
            const resumeOrClose = yield race({
                dismiss: call(onDismiss, id),
                resume: call(onResume, id)
            });

            if (resumeOrClose.dismiss) {
                // break and close -- .
                break;
            }

            if (extendedDuration > 0) {
                // after resume, use extend duration as duration.
                duration = extendedDuration;
                tickDuration = Math.floor(duration / payload.ticks);
            }
        }

        // resumed or duplicate added -- loop again ...
    }

    // Hide the notification.
    yield put({ type: NOTIF_HIDE, id });
}

export function* notificationSaga() {
    // handle all NOTIF_SEND
    yield takeEvery(NOTIF_SEND, displayNotify);
}

/** ********************************************************/
/** ********************* SELECTORS ************************/
/** ********************************************************/

export function getNotifyTimeoutID(state, id) {
    const notif = getNotifyByID(state, id);
    return notif ? notif.timeoutID : null;
}

export function getNotifyByID(state, id) {
    return state[NAME].find(e => e.id === id);
}

/** ********************************************************/
/** ********************* REDUCERS *************************/
/** ********************************************************/

const reducer = (state = [], action) => {
    switch (action.type) {
    case NOTIF_SHOW:
        return [
            { ...action.payload },
            ...state.filter(n => n.id !== action.payload.id)
        ];
    case NOTIF_ADD_DUP:
        return state.map(n => n.id === action.id
                ? {
                    ...n,
                    count: n.count + 1,
                    percent: 100,
                    tickDuration: 100
                } : n);
    case NOTIF_HIDE:
        return state.filter(n => n.id !== action.id);
    case NOTIF_PAUSE:
        return state.map(n => n.id === action.id
                ? {
                    ...n,
                    percent: 100,
                    tickDuration: 100
                } : n);
    case NOTIF_RESUME:
        return state.map(n => n.id === action.id
                ? {
                    ...n,
                    percent: 100,
                    tickDuration: 100
                } : n);
    case NOTIF_TICK:
        return state.map(n => n.id === action.id
                ? {
                    ...n,
                    percent: action.percent,
                    tickDuration: action.tickDuration
                } : n);
    case NOTIF_CLEAR:
        return [];
    default:
        return state;
    }
};

export default reducer;
