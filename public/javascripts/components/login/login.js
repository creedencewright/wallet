/*** @jsx React.DOM */
var React   = require('react');
var Router  = require('react-router');

var Login = React.createClass({
    switchForm(form) {
        this.props.onSwitch(form)
    },

    login(e) {
        this.refs.form.getDOMNode().submit();
    },

    render() {
        return (
            <div className="login-form">
                <form ref="form" action="/login/" method="post">
                    <div className="form-group">
                        <label>
                            <input autoComplete="off" ref="email" type="text" name="email" className="form-control"/>
                            <span>Email</span>
                        </label>
                    </div>
                    <div className="form-group">
                        <label>
                            <input autoComplete="off" ref="password" name="password" type="text" className="form-control"/>
                            <span>Password</span>
                        </label>
                    </div>
                    <div className="reg-block form-group">
                        <label>
                            <span>Balance</span>
                            <input ref="balance" name="balance" type="text" className="form-control"/>
                        </label>
                    </div>
                    <div className="reg-block form-group">
                        <label>
                            <span>Savings</span>
                            <input ref="savings" name="savings" type="text" className="form-control"/>
                        </label>
                    </div>
                    <div className="reg-block form-group btns">
                        <div className="hidden">
                            <input type="submit"/>
                        </div>
                        <a onClick={this.register} href="javascript:void(0)" className="btn btn-success">Register</a>
                        <br/>
                    </div>
                    <div className="log-block form-group btns">
                        <div className="hidden">
                            <input type="submit"/>
                        </div>
                        <a onClick={this.login} href="javascript:void(0)" className="btn btn-success">Log in</a>
                    </div>
                </form>
                <a href="javascript:void(0);" className="to-register switch-btn" onClick={this.switchForm.bind(this, 'register')}>New here?</a>
            </div>
        )
    }
});

module.exports = Login;