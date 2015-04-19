/*** @jsx React.DOM */
var React   = require('react');
var User    = require('../../stores/user-store');
var Data    = require('../../stores/data-store');
var AddSavings  = require('../common/add-savings');

var Header = React.createClass({
    getInitialState: function() {
        return {
            name: User.getInfo().name,
            user: User.getInfo().id,
            savings: User.getInfo().id ? parseFloat(Data.getSavings()) : '',
            balance: User.getInfo().id ? parseFloat(Data.getBalance()) : ''
        }
    },
    componentWillMount: function() {
        Data.addChangeListener(this._onChange);
    },
    componentWillUnmount: function() {
        Data.removeChangeListener(this._onChange);
    },
    _onChange: function() {
        this.setState({
            balance: Data.getBalance(),
            savings: Data.getSavings(),
            color: Data.getBalance() >= 0 ? 'green' : 'red'
        })
    },
    toggleForm: function() {
        this.setState({
            opened: this.state.opened ? false : true
        })
    },
    render: function() {
        return (
            <header className="row">
                <div className="col-sm-6 savings-wrap"></div>
                <div className={"col-sm-6 money-now " + this.state.color}>
                    <div className="savings">{this.state.savings}</div>
                    <div className="money-now-val">{this.state.balance}</div>
                </div>
            </header>
        )
    }
});

module.exports = Header;