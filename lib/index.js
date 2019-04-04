"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  Notifications: true
};
Object.defineProperty(exports, "default", {
  enumerable: true,
  get: function get() {
    return _ducks.default;
  }
});
Object.defineProperty(exports, "Notifications", {
  enumerable: true,
  get: function get() {
    return _components.default;
  }
});

var _ducks = _interopRequireWildcard(require("./ducks"));

Object.keys(_ducks).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _ducks[key];
    }
  });
});

var _components = _interopRequireDefault(require("./components"));