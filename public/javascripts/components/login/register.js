/*** @jsx React.DOM */
const React   = require('react');
const Router  = require('react-router');
const Link    = Router.Link;
const User    = require('../../stores/user-store');
const Actions = require('../../actions/app-actions');

const Register = React.createClass({
    switchForm(form) {
        this.props.onSwitch(form)
    },

    register(e) {
        this.refs.form.getDOMNode().submit();
    },
    render() {
        return (
            <div className="register-form">
                <form ref="form">
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
                    </div>
                </form>
                <a href="javascript:void(0);" className="to-register switch-btn" onClick={this.switchForm.bind(this, 'login')}>Login</a>
            </div>
        )
    }
});

module.exports = Register;