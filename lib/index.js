'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ducks = require('./ducks');

Object.keys(_ducks).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _ducks[key];
    }
  });
});
Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_ducks).default;
  }
});

var _components = require('./components');

Object.defineProperty(exports, 'Notifications', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_components).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }