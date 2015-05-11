/*** @jsx React.DOM */

var React   = require('react');
var User    = require('../../stores/user-store');
var Data    = require('../../stores/data-store');

function getMonthHighlights() {
    return Data.getHighlights();
}

var Highlights = React.createClass({
    getInitialState() {
        return {};
        return this.setState(getMonthHighlights())
    },

    render() {
        return (
            <div className="highlights row">
                <div className="expense col-sm-4"></div>
                <div className="income col-sm-4"></div>
                <div className="savings col-sm-4"></div>
            </div>
        )
    }
});

module.exports = Highlights;