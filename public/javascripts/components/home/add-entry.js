/*** @jsx React.DOM */
var React   = require('react');
var _       = require('underscore');
var Types   = require('../../stores/types-store');
var Actions = require('../../actions/app-actions');

var AddEntry = React.createClass({
    getInitialState: function() {
        return {
            types: this.props.type == 'expense' ? Types.getExpenseTypes() : Types.getIncomeTypes()
        };
    },
    add: function(e) {
        e.preventDefault();
        var entry = {
            type: this.props.type,
            value: parseFloat(this.refs.amount.getDOMNode().value)
        }

        Actions.entry.add(entry);
        this.props.addEvent();
    },
    render: function() {
        return (
            <form onSubmit={this.add} className="add-block">
                <label className="form-group">
                    <input ref="amount" className="form-control" type="text" name="amount" placeholder="Amount"/>
                </label>
                <div className="types-wrap">
                    {this.state.types.map(function(type, i) {
                        return <Type type={type} key={i} />
                    })}
                </div>
                <div className="btn-wrap">
                    <a onClick={this.add} href="javascript:void(0);" className="btn btn-blue">Add</a>
                </div>
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

module.exports = AddEntry;