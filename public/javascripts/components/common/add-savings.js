/*** @jsx React.DOM */
var React   = require('react');
var _       = require('underscore');
var Actions = require('../../actions/app-actions');

var AddSavings = React.createClass({
    getInitialState: function() {
        return {};
    },
    add: function(e) {
        e.preventDefault();
        var savings = {
            type: 'savings',
            value: parseFloat(this.refs.amount.getDOMNode().value)
        }

        Actions.savings.add(savings);
        this.props.addEvent();
    },
    render: function() {
        return (
            <form onSubmit={this.add} className="add-block">
                <label className="form-group">
                    <input ref="amount" className="form-control" type="text" name="amount" placeholder="Amount"/>
                </label>
                <a onClick={this.add} href="javascript:void(0);" className="btn btn-blue">Add</a>
            </form>
        )
    }
});

var Type = React.createClass({
    render: function() {
        return (
            <label className="type-wrap">
                <input type="radio" name="type" value={this.props.type._id}/>
                <div className={this.props.type.img + ' type'}></div>
                <div className="name">{this.props.type.name}</div>
            </label>
        )
    }
});

module.exports = AddSavings;