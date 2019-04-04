"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Notifications = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _react = _interopRequireDefault(require("react"));

var _reactRedux = require("react-redux");

var _ducks = require("./ducks");

var _reactTransitionGroup = _interopRequireDefault(require("react-transition-group"));

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
  return _react.default.createElement("div", {
    className: "notification ".concat(type, " ").concat(dismissable ? 'notification_dismissable' : ''),
    onClick: function onClick() {
      dismissable && onDismiss(id);
    },
    onMouseEnter: function onMouseEnter() {
      return duration !== 0 && onPause(id);
    },
    onMouseLeave: function onMouseLeave() {
      return duration !== 0 && onResume(id);
    }
  }, _react.default.createElement("i", {
    className: iconCls
  }), _react.default.createElement("div", {
    className: "notif__content"
  }, _react.default.createElement("h3", null, title, " ", count > 1 && _react.default.createElement("small", {
    className: "notification__counter"
  }, "[", count, "]")), _react.default.createElement("span", null, message)), tickDuration && _react.default.createElement("div", {
    className: "notif__timebar"
  }, _react.default.createElement("div", {
    style: {
      transition: "width ".concat(tickDuration, "ms linear"),
      width: "".concat(percent, "%")
    }
  })), dismissable && _react.default.createElement("button", {
    tabIndex: "0",
    onClick: function onClick(e) {
      e.preventDefault();
      onDismiss(id);
    },
    className: "notification__dismiss_btn"
  }, _react.default.createElement("i", {
    className: "fa fa-times-circle"
  })));
};

function renderItems(items, onDismiss, onPause, onResume) {
    console.log( "Trying to render items in Notifications" );
  var notifProps = {
    onDismiss: onDismiss,
    onPause: onPause,
    onResume: onResume
  };
  return _react.default.createElement(_reactTransitionGroup.default, {
    transitionName: "notification",
    transitionEnterTimeout: 300,
    transitionLeaveTimeout: 300
  }, items.map(function (msg) {
    return _react.default.createElement(Notif, (0, _extends2.default)({
      key: msg.id,
      msg: msg
    }, notifProps));
  }));
} // Notifications component


var Notifications = function Notifications(_ref2) {
  var notifications = _ref2.notifications,
      onDismiss = _ref2.onDismiss,
      notifyPause = _ref2.notifyPause,
      notifyResume = _ref2.notifyResume;
  return _react.default.createElement("div", {
    className: "notifications"
  }, renderItems(notifications, onDismiss, notifyPause, notifyResume));
}; // Export connected component as default.


exports.Notifications = Notifications;

var _default = (0, _reactRedux.connect)(function (state) {
  return {
    notifications: state[_ducks.NAME]
  };
}, {
  onDismiss: _ducks.notifyDismiss,
  notifyPause: _ducks.notifyPause,
  notifyResume: _ducks.notifyResume
})(Notifications);

exports.default = _default;