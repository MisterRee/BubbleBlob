'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _ClientRender = require('./ClientRender.js');

var _ClientRender2 = _interopRequireDefault(_ClientRender);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//import './client.css';

var count = 10;

var GUI = _reactDom2.default.render(_react2.default.createElement(_ClientRender2.default, { count: count }), document.getElementById('root'));