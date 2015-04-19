/*** @jsx React.DOM */

var React           = require('react');
var Template        = require('./app-template');
var Router          = require('react-router'); // or var Router = ReactRouter; in browsers
var DefaultRoute    = Router.DefaultRoute;
var Route           = Router.Route;
var RouteHandler    = Router.RouteHandler;
var Login           = require('./login/login');
var Register        = require('./login/register');
var Header          = require('./common/header');
var User            = require('../stores/user-store');

var App = React.createClass({
    contextTypes: {
        router: React.PropTypes.func
    },
    getInitialState: function() {
        if (!User.getInfo().id || User.getInfo().id == '0') {
            this.context.router.transitionTo('login');
        }

        return {};
    },
    render: function() {
        return (
            <div>
                <Header />
                <RouteHandler />
            </div>
        )
    }
});

module.exports = App;