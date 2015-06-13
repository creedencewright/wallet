/*** @jsx React.DOM */
var React   = require('react');
var User    = require('../../stores/user-store');
var Data    = require('../../stores/data-store');

var Header = React.createClass({
    getInitialState: function() {
        var id = parseInt(User.getInfo().id);
        return {
            name: User.getInfo().name,
            user: id,
            savings: id ? parseFloat(Data.getSavings()) : '',
            balance: id ? parseFloat(Data.getBalance()) : ''
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
            <header className="container">
                <div className="row">
                    {this.state.user ? <Info data={this.state} /> : ''}
                </div>
            </header>
        )
    }
});

var Info = React.createClass({
    render: function() {
        return (
            <div className={"col-sm-6 money-now " + this.props.data.color}>
                <div className="money-now-val">
                    <span className="text">Balance:</span> ${this.props.data.balance}</div>
                <div className="savings">
                    <span className="text">Savings:</span> ${this.props.data.savings}</div>
            </div>
        )
    }
});

module.exports = Header;