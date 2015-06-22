/*** @jsx React.DOM */
const React     = require('react');
const reqwest   = require('reqwest');

const LoginWrap = React.createClass({
    getInitialState() {
        return {
            username: '',
            password: '',
            balance: 0,
            savings: 0,
            lang: 'en',
            form: 'login',
            action: '/login/',
            errors: {}
        }
    },

    key(el, e) {
        let state   = {errors: {}},
            val     = e.target.value;

        state[el] = val;
        state.errors[el] = false;
        this.setState(state);
    },

    submit(e) {
        e.preventDefault();
        if (this.validate()) {
            reqwest({
                method: 'post',
                url: this.state.action,
                data: this.state,
                success: this.success
            });
        }
    },

    success(data) {
        if (data.success) {
            window.location.href = '/';
            return;
        }

        if (data.error === 'user') {
            this.setState({
                errors: {username: true, password: true}
            })
        }
    },

    validate() {
        let res = true;
        let errors = {};
        let reg = /^[0-9]+$/;

        if (!this.state.username.length) {
            res = false;
            errors.username = true;
        }

        if (!this.state.password.length) {
            res = false;
            errors.password = true;
        }

        if (this.state.form === 'register' && (!(this.state.balance.toString().length) || this.state.balance.toString().match(reg) === null)) {
            res = false;
            errors.balance = true;
        }

        if (this.state.form === 'register' && (!this.state.savings.toString().length || this.state.savings.toString().match(reg) === null)) {
            res = false;
            errors.savings = true;
        }

        this.setState({errors: errors});

        return res;
    },

    setLang(lang) {
        this.setState({lang: lang});
    },

    switchForm(form) {
        this.setState({form: form, action: '/'+form+'/'})
    },

    render() {
        let reg = this.state.lang === 'en' ? 'register' : 'Создать'
        let log = this.state.lang === 'en' ? 'login' : 'Войти'
        let switchTo = this.state.form === 'login' ? reg : log;

        let username = this.state.username ? "form-control filled" : 'form-control';
        let password = this.state.password ? "form-control filled" : 'form-control';
        let balance = this.state.balance !== '' ? "form-control filled" : 'form-control';
        let savings = this.state.savings !== '' ? "form-control filled" : 'form-control';

        if (this.state.errors.username) username += ' error';
        if (this.state.errors.password) password += ' error';
        if (this.state.errors.balance) balance += ' error';
        if (this.state.errors.savings) savings += ' error';

        return (
            <div className={"form-wrap " + this.state.form}>
                <div className="login-form">
                    <h1>{this.state.lang === 'en' ? 'Hello there.' : 'Привет.'}</h1>
                    <form onSubmit={this.submit} ref="form" action={this.state.action} method="post">
                        <div className="form-group">
                            <label>
                                <input onChange={this.key.bind(this, 'username')} autoComplete="off" ref="username" type="text" name="username" className={username}/>
                                <span>{this.state.lang === 'en' ? 'Username' : 'Логин'}</span>
                            </label>
                        </div>
                        <div className="form-group">
                            <label>
                                <input onChange={this.key.bind(this, 'password')} autoComplete="off" ref="password" name="password" type="text" className={password}/>
                                <span>{this.state.lang === 'en' ? 'Password' : 'Пароль'}</span>
                            </label>
                        </div>
                        <div className="reg-block">
                            <div className="form-group lang">
                                <label>
                                    <input checked={this.state.lang === 'en' ? 'checked' : false} onChange={this.setLang.bind(this, 'en')} type="radio" name="lang" value="en"/>
                                    <span className="underlined">English</span>
                                    <span> (USD)</span>
                                </label>
                                <label>
                                    <input checked={this.state.lang === 'ru' ? 'checked' : false} onChange={this.setLang.bind(this, 'ru')} type="radio" name="lang" value="ru"/>
                                    <span className="underlined">Русский</span>
                                    <span> (RUB)</span>
                                </label>
                            </div>

                            <div className="form-group balance">
                                <label>
                                    <input value={this.state.balance} onChange={this.key.bind(this, 'balance')} ref="balance" name="balance" type="text" className={balance}/>
                                    <span>{this.state.lang === 'en' ? 'Balance' : 'Баланс'}</span>
                                </label>
                            </div>
                            <div className="form-group savings">
                                <label>
                                    <input value={this.state.savings} onChange={this.key.bind(this, 'savings')} ref="savings" name="savings" type="text" className={savings}/>
                                    <span>{this.state.lang === 'en' ? 'Savings' : 'Сбережения'}</span>
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
                <div className="logo-wrap">
                    <div className="logo-white"><span className="short">W</span><span className="long">allt</span></div>
                </div>
            </div>
        )
    }
});

module.exports = LoginWrap;