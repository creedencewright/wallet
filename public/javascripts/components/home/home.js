/*** @jsx React.DOM */

var React = require('react');
var User = require('../../stores/user-store');
var Expense = require('./expense');
var Income = require('./income');

var Home = React.createClass({
    getInitialState: function() {
        return {
            user: User.getInfo()
        };
    },
    render: function() {
        return (
            <div className="home clearfix">
                <Expense />
                <Income />
            </div>
        )
    }
});

module.exports = Home;
