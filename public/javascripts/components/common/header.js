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
    componentWillMount() {
        Data.addChangeListener(this._onChange);
    },
    componentWillUnmount() {
        Data.removeChangeListener(this._onChange);
    },
    _onChange() {
        this.setState({
            balance: Data.getBalance(),
            savings: Data.getSavings(),
            color: Data.getBalance() >= 0 ? 'green' : 'red'
        })
    },
    toggleForm() {
        this.setState({
            opened: this.state.opened ? false : true
        })
    },
    render() {
        return (
            <header style={{borderColor: User.id() !== '0' ? 'rgba(0,0,0,.1)' : 'transparent'}}>
                <div className="container">
                    {User.id() !== '0' ? <Logo /> : ''}
                    {this.state.user ? <Info data={this.state} /> : ''}
                </div>
            </header>
        )
    }
});

const Logo = React.createClass({
    render() {
        return (
            <div className="logo-wrap">
                <div className="name">w<span className="dot"></span></div>
            </div>
        )
    }
});

const Info = React.createClass({
    render() {
        return (
            <div className="row">
                <div className="user">
                    <span className="name">{User.getInfo().name}</span><a href="/logout">{User.isEn() ? 'logout' : 'выйти'}</a>
                </div>
            </div>
        )
    }
});

module.exports = Header;