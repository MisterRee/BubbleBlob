"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

//import './client.css';

var ClientRender = function (_React$Component) {
  _inherits(ClientRender, _React$Component);

  function ClientRender(props) {
    _classCallCheck(this, ClientRender);

    var _this = _possibleConstructorReturn(this, (ClientRender.__proto__ || Object.getPrototypeOf(ClientRender)).call(this, props));

    _this.canvas = _react2.default.createElement("canvas", { className: "GUI", ref: "canvas" });
    return _this;
  }

  _createClass(ClientRender, [{
    key: "render",
    value: function render() {
      return _react2.default.createElement(
        "div",
        { className: "App" },
        _react2.default.createElement(
          "div",
          { className: "Header" },
          _react2.default.createElement(
            "h1",
            null,
            "Bubble Blobs"
          )
        ),
        _react2.default.createElement("div", { className: "Color" }),
        this.canvas,
        _react2.default.createElement(
          "div",
          { className: "Footer" },
          _react2.default.createElement(
            "p",
            null,
            " ",
            this.props.count,
            " "
          )
        )
      );
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      this.canvas = this.refs.canvas;
      this.ctx = this.canvas.getContext("2d");
    }
  }]);

  return ClientRender;
}(_react2.default.Component);

;

exports.default = ClientRender;