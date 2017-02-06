'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Notifications = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _ducks = require('./ducks');

var _reactAddonsCssTransitionGroup = require('react-addons-css-transition-group');

var _reactAddonsCssTransitionGroup2 = _interopRequireDefault(_reactAddonsCssTransitionGroup);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Notif = function Notif(_ref) {
    var msg = _ref.msg,
        onDismiss = _ref.onDismiss,
        onPause = _ref.onPause,
        onResume = _ref.onResume;
    var duration = msg.duration,
        id = msg.id,
        dismissable = msg.dismissable,
        title = msg.title,
        iconCls = msg.iconCls,
        percent = msg.percent,
        tickDuration = msg.tickDuration,
        message = msg.message,
        count = msg.count,
        type = msg.type;


    return _react2.default.createElement(
        'div',
        {
            className: 'notification ' + type + ' ' + (dismissable ? 'notification_dismissable' : ''),
            onClick: function onClick() {
                dismissable && onDismiss(id);
            },
            onMouseEnter: function onMouseEnter() {
                return duration !== 0 && onPause(id);
            },
            onMouseLeave: function onMouseLeave() {
                return duration !== 0 && onResume(id);
            }
        },
        _react2.default.createElement('i', { className: iconCls }),
        _react2.default.createElement(
            'div',
            { className: 'notif__content' },
            _react2.default.createElement(
                'h3',
                null,
                title,
                ' ',
                count > 1 && _react2.default.createElement(
                    'small',
                    { className: 'notification__counter' },
                    '[',
                    count,
                    ']'
                )
            ),
            _react2.default.createElement(
                'span',
                null,
                message
            )
        ),
        tickDuration && _react2.default.createElement(
            'div',
            { className: 'notif__timebar' },
            _react2.default.createElement('div', { style: {
                    transition: 'width ' + tickDuration + 'ms linear',
                    width: percent + '%'
                } })
        ),
        dismissable && _react2.default.createElement(
            'button',
            { tabIndex: '0', onClick: function onClick(e) {
                    e.preventDefault();
                    onDismiss(id);
                },
                className: 'notification__dismiss_btn' },
            _react2.default.createElement('i', { className: 'fa fa-times-circle' })
        )
    );
};

function renderItems(items, onDismiss, onPause, onResume) {
    var notifProps = { onDismiss: onDismiss, onPause: onPause, onResume: onResume };
    return _react2.default.createElement(
        _reactAddonsCssTransitionGroup2.default,
        {
            transitionName: 'notification',
            transitionEnterTimeout: 300,
            transitionLeaveTimeout: 300 },
        items.map(function (msg) {
            return _react2.default.createElement(Notif, _extends({ key: msg.id, msg: msg }, notifProps));
        })
    );
}

// Notifications component

var Notifications = exports.Notifications = function Notifications(_ref2) {
    var notifications = _ref2.notifications,
        onDismiss = _ref2.onDismiss,
        notifyPause = _ref2.notifyPause,
        notifyResume = _ref2.notifyResume;
    return _react2.default.createElement(
        'div',
        { className: 'notifications' },
        renderItems(notifications, onDismiss, notifyPause, notifyResume)
    );
};

// Export connected component as default.

exports.default = (0, _reactRedux.connect)(function (state) {
    return { notifications: state[_ducks.NAME] };
}, {
    onDismiss: _ducks.notifyDismiss,
    notifyPause: _ducks.notifyPause,
    notifyResume: _ducks.notifyResume
})(Notifications);