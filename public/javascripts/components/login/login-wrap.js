/*** @jsx React.DOM */
const React     = require('react');

const LoginWrap = React.createClass({
    getInitialState() {
        return {
            username: '',
            password: '',
            balance: '',
            savings: '',
            form: 'login',
            action: '/login/'
        }
    },
    key(el, e) {
        let state   = {},
            val     = e.target.value;

        if (el === 'balance' || el === 'savings') {
            let reg = /^[0-9]+$/;
            if (val.match(reg) === null) {
                e.stopPropagation();
                e.preventDefault();
                return;
            }
        }

        state[el] = val;
        this.setState(state);
    },
    submit() {
        this.refs.form.getDOMNode().submit();
    },
    switchForm(form) {
        this.setState({form: form, action: '/'+form+'/'})
    },
    render() {
        let switchTo = this.state.form === 'login' ? 'register' : 'login';
        return (
            <div className={"form-wrap " + this.state.form}>
                <div className="login-form">
                    <h1>Hello there.</h1>
                    <form ref="form" action={this.state.action} method="post">
                        <div className="form-group">
                            <label>
                                <input onKeyDown={this.key.bind(this, 'username')} autoComplete="off" ref="username" type="text" name="username" className={this.state.username ? "form-control filled" : 'form-control'}/>
                                <span>Username</span>
                            </label>
                        </div>
                        <div className="form-group">
                            <label>
                                <input onKeyUp={this.key.bind(this, 'password')} autoComplete="off" ref="password" name="password" type="text" className={this.state.password ? "form-control filled" : 'form-control'}/>
                                <span>Password</span>
                            </label>
                        </div>
                        <div className="reg-block">
                            <div className="form-group lang">
                                <label>
                                    <input type="radio" name="lang" value="en"/>
                                    <span className="underlined">English</span>
                                    <span> (USD)</span>
                                </label>
                                <label>
                                    <input type="radio" name="lang" value="ru"/>
                                    <span className="underlined">Русский</span>
                                    <span> (RUB)</span>
                                </label>
                            </div>

                            <div className="form-group balance">
                                <label>
                                    <input onKeyUp={this.key.bind(this, 'balance')} ref="balance" name="balance" type="text" className={this.state.balance ? "form-control filled" : 'form-control'}/>
                                    <span>Balance</span>
                                </label>
                            </div>
                            <div className="form-group savings">
                                <label>
                                    <input onKeyUp={this.key.bind(this, 'savings')} ref="savings" name="savings" type="text" className={this.state.savings ? "form-control filled" : 'form-control'}/>
                                    <span>Savings</span>
                                </label>
                            </div>
                        </div>
                        <div className="form-group btns">
                            <div className="hidden">
                                <input type="submit"/>
                            </div>
                            <a onClick={this.submit} href="javascript:void(0)" className="link button">{this.state.form}</a>
                            <a href="javascript:void(0);" className="link switch-btn" onClick={this.switchForm.bind(this, switchTo)}>{this.state.form === 'login' ? 'New here?' : 'Login'}</a>
                            <br/>
                        </div>
                    </form>
                </div>
            </div>
        )
    }
});

module.exports = LoginWrap;