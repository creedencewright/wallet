/*** @jsx React.DOM */
var React   = require('react');
var Router  = require('react-router');
var Link    = Router.Link;
var User    = require('../../stores/user-store');
var Actions = require('../../actions/app-actions');

var Register = React.createClass({
    register: function(e) {
        e.preventDefault();
        Actions.user.add({
            email: this.refs.email.getDOMNode().value,
            password: this.refs.password.getDOMNode().value,
            balance: this.refs.balance.getDOMNode().value,
            savings: this.refs.savings.getDOMNode().value
        });
    },
    render: function() {
        return (
            <div className="register-form">
                <form onSubmit={this.register}>
                    <div className="form-group">
                        <label>
                            <span>Email</span>
                            <input ref="email" type="text" name="email" className="form-control"/>
                        </label>
                    </div>
                    <div className="form-group">
                        <label>
                            <span>Password</span>
                            <input ref="password" name="password" type="text" className="form-control"/>
                        </label>
                    </div>
                    <div className="form-group">
                        <label>
                            <span>Balance</span>
                            <input ref="balance" name="balance" type="text" className="form-control"/>
                        </label>
                    </div>
                    <div className="form-group">
                        <label>
                            <span>Savings</span>
                            <input ref="savings" name="savings" type="text" className="form-control"/>
                        </label>
                    </div>
                    <div className="form-group btns">
                        <div className="hidden">
                            <input type="submit"/>
                        </div>
                        <a onClick={this.register} href="javascript:void(0)" className="btn btn-success">Register</a>
                        <br/>
                        <Link to="login" className="btn btn-default">Log In</Link>
                    </div>
                </form>
            </div>
        )
    }
});

module.exports = Register;