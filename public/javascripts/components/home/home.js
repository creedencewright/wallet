/*** @jsx React.DOM */

const React     = require('react');
const User      = require('../../stores/user-store');
const Expense   = require('./expense');
const Graph     = require('./graph');

const Home = React.createClass({
    getInitialState() {
        return {
            user: User.getInfo()
        };
    },
    render() {
        return (
            <div className="home clearfix">
                <Graph />
                <Expense />
            </div>
        )
    }
});

module.exports = Home;
