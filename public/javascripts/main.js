/*** @jsx React.DOM */

var React   = require('react');
var App     = require('./components/app.js');
var $app    = document.getElementById('app');
var id      = $app.getAttribute('data-logged');
var name    = $app.getAttribute('data-name');
var types   = $app.getAttribute('data-types');
var balance = $app.getAttribute('data-balance');
var savings = $app.getAttribute('data-savings');
var User    = require('./stores/user-store');
var Type    = require('./stores/types-store');
var Data    = require('./stores/data-store');

var React           = require('react');
var Router          = require('react-router');
var DefaultRoute    = Router.DefaultRoute;
var Route           = Router.Route;
var RouteHandler    = Router.RouteHandler;
var Home            = require('./components/home/home');
var LoginWrap       = require('./components/login/login-wrap');
var User            = require('./stores/user-store');

User.setData({id: id, name: name});
Data.setBalance(parseFloat(balance));
Data.setSavings(parseFloat(savings));
Type.setTypesFromString(types);

var routes = (
    <Route name='app' path='/' handler={App}>
        <Route name='login' handler={LoginWrap} />
        <Route name='home' handler={Home} />
    </Route>
);

Router.run(routes, Router.HistoryLocation, function (Handler) {
    React.render(<Handler/>, $app);
});
