/*** @jsx React.DOM */
var React   = require('react');
var Router  = require('react-router');
var Link    = Router.Link;
var Actions = require('../../actions/app-actions');

var Login = React.createClass({
    login: function(e) {
        e.preventDefault();
        Actions.user.login({
            email: this.refs.email.getDOMNode().value,
            password: this.refs.password.getDOMNode().value
        });
    },
    render: function() {
        return (
            <div className="login-form">
                <form onSubmit={this.login}>
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
                    <div className="form-group btns">
                        <div className="hidden">
                            <input type="submit"/>
                        </div>
                        <a onClick={this.login} href="javascript:void(0)" className="btn btn-success">Log in</a>
                        <Link to="register" className="btn btn-default">Register</Link>
                    </div>
                </form>
            </div>
        )
    }
});

module.exports = Login;