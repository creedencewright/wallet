/*** @jsx React.DOM */

const React     = require('react');
const _         = require('underscore');
const User      = require('../../stores/user-store');
const Data      = require('../../stores/data-store');
const Actions   = require('../../actions/app-actions');
const moment    = require('moment');

function _get() {
    return Data.getHighlights();
}

function _isTop() {
    let doc = document.documentElement;
    let top = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);

    return top < 50
}

function _getValue(v, color, size) {
    let value   = User.isEn() ? `$${v}` : v,
        sign    = User.isEn() ? '' : (<span className={`rub ${size} ${color}`}></span>);

    return {v: (<span className="value-num">{value}</span>), sign: sign}
}

const Highlights = React.createClass({
    getInitialState() {
        return { data: _get() };
    },

    componentWillMount() {
        Data.addChangeListener(this._onChange);
    },

    _onChange() {
        this.setState({
            data: _get()
        })
    },

    componentWillUnmount() {
        Data.removeChangeListener(this._onChange);
    },

    render() {
        let expense = _getValue(this.state.data.totalExpense, 'medium', 'red');
        let income = _getValue(this.state.data.totalIncome, 'medium', 'green');
        let month = moment().set({date: 1, month: Data.getMonth()});

        return (
            <div className="highlights-wrap">
                <Current />
                <div className="highlights row clearfix">
                    <div className="title">{month.format('MMMM')}</div>
                    <div className="row total-wrap">
                        <div className="total expense">{[expense.v, expense.sign]}</div>
                        <div className="total income">{[income.v, income.sign]}</div>
                    </div>
                    <div className="row categories">
                        {this.state.data.categories.expense.map((e, i) =>
                            <Category categorySelect={this.props.categorySelect} key={i} type="expense" code={e.code} value={e.value} name={e.name} />
                        )}
                    </div>
                    <div className="row categories">
                        {this.state.data.categories.income.map((e, i) =>
                            <Category categorySelect={this.props.categorySelect} key={i} type="income" code={e.code} value={e.value} name={e.name} />
                        )}
                    </div>
                </div>
            </div>
        )
    }
});

const Current = React.createClass({
    getInitialState() {
        return {
            isTop: _isTop(),
            edit: false,
            isSavings: false
        }
    },

    componentDidMount() {
        window.addEventListener('scroll', _.throttle(this.handleScroll.bind(this), 200));
        window.addEventListener('click', this.closeEdit);
    },

    handleScroll() {
        this.setState({
            isTop: _isTop()
        })
    },

    toggleSavings(e) {
        let classes = e.target.className.split(' ');

        if (this.state.edit || classes.indexOf('active') != -1) return;

        this.setState({
            isSavings: this.state.isSavings ? false : true
        });
    },

    edit() {
        this.setState({edit: true});
        let val = this.state.isSavings ? Data.getSavings() : Data.getBalance();
        this.refs.edit.getDOMNode().value = val;
    },

    keyup(e) {
        if (e.keyCode === 13) this.update();
        if (e.keyCode === 27) this.setState({edit: false});
    },

    closeEdit(e) {
        let classes = e.target.className.split(' '),
            edit = classes.indexOf('value-num') != -1 || classes.indexOf('rub') != -1 || classes.indexOf('value-edit') != -1

        if (edit || !this.state.edit) return;

        this.update();
    },

    update() {
        this.setState({edit: false});

        if (this.state.isSavings) {
            Actions.balance.updateSavings(this.refs.edit.getDOMNode().value);
        } else {
            Actions.balance.updateBalance(this.refs.edit.getDOMNode().value);
        }
    },

    render() {
        let total = _getValue(Data.getBalance(), this.state.isTop ? 'medium' : 'big', this.state.isTop ? 'white' : 'black');
        let savings = _getValue(Data.getSavings(), this.state.isTop ? 'medium' : 'big', this.state.isTop ? 'white' : 'black');

        let wrapClass = this.state.isSavings ? "savings money-now" : 'money-now';
        if (this.state.edit) wrapClass += ' edit';

        return (
            <div className={this.state.isTop ? "balance-wrap" : "fixed balance-wrap"}>
                <div className="now-title">
                    <a className={!this.state.isSavings ? "active" : ''} onClick={this.toggleSavings} href="javascript:void(0);">{User.isEn() ? 'balance' : 'баланс'}</a>
                    <a className={this.state.isSavings ? "active" : ''} onClick={this.toggleSavings} href="javascript:void(0);">{User.isEn() ? 'savings' : 'сбережения'}</a>
                </div>
                <div onClick={this.edit} className={wrapClass}>
                    <div className="value-wrap">
                        {!this.state.isSavings ? [total.v, total.sign] : [savings.v, savings.sign]}
                    </div>
                    <input onKeyUp={this.keyup} ref="edit" className="value-edit" type="text"/>
                </div>
            </div>
        )
    }
});

const Category = React.createClass({
    render() {
        let isIncome = this.props.type === 'income';
        let value = _getValue(this.props.value, 'small', isIncome ? 'green' : 'red');
        let category = {name: this.props.name, code: this.props.code, tab: this.props.type};

        return (
            <div onClick={this.props.categorySelect.bind(true, category)} className={isIncome ? "income category" : 'category'}>
                <div className="value">{[value.v, value.sign]}</div>
                <div className="name">{this.props.name}</div>
            </div>
        )
    }
});

module.exports = Highlights;