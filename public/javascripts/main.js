/*** @jsx React.DOM */

const React   = require('react');
const App     = require('./components/app.js');
const $app    = document.getElementById('app');
const id      = $app.getAttribute('data-logged');
const name    = $app.getAttribute('data-name');
const lang    = $app.getAttribute('data-lang');
const types   = $app.getAttribute('data-types');
const balance = $app.getAttribute('data-balance');
const savings = $app.getAttribute('data-savings');
const User    = require('./stores/user-store');
const Type    = require('./stores/types-store');
const Data    = require('./stores/data-store');

const Router          = require('react-router');
const DefaultRoute    = Router.DefaultRoute;
const Route           = Router.Route;
const RouteHandler    = Router.RouteHandler;
const Home            = require('./components/home/home');
const LoginWrap       = require('./components/login/login-wrap');

User.setData({id: id, name: name, lang: lang});
Data.setBalance(parseFloat(balance));
Data.setSavings(parseFloat(savings));

const routes = (
    <Route name='app' path='/' handler={App}>
        <Route name='login' handler={LoginWrap} />
        <Route name='home' handler={Home} />
    </Route>
);

Router.run(routes, Router.HistoryLocation, function (Handler) {
    React.render(<Handler/>, $app);
});
