/*** @jsx React.DOM */

var React       = require('react');
var Data        = require('../stores/data-store');

var EntryWatchMixin = function(cb) {
    return {
        componentWillMount: function() {
            Data.addChangeListener(this._onChange);
        },
        componentWillUnmount: function() {
            Data.removeChangeListener(this._onChange);
        },
        _onChange: function() {
            this.setState({data: cb(this), loading: false})
        }
    }
}

module.exports = EntryWatchMixin;