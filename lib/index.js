"use strict";

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }