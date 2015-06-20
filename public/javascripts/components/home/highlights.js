/*** @jsx React.DOM */

const React     = require('react');
const _         = require('underscore');
const User      = require('../../stores/user-store');
const Data      = require('../../stores/data-store');
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

    return {v: value, sign: sign}
}

const Highlights = React.createClass({
    getInitialState() {
        return {
            isTop: _isTop(),
            data: _get()
        };
    },

    componentDidMount() {
        window.addEventListener('scroll', _.throttle(this.handleScroll.bind(this), 100));
    },

    handleScroll() {
        this.setState({
            isTop: _isTop()
        })
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
        let total = _getValue(Data.getBalance(), 'big', this.state.isTop ? 'white' : 'black');
        let month = moment().set({date: 1, month: Data.getMonth()});

        return (
            <div className="highlights-wrap">
                <div className={this.state.isTop ? "money-now" : "money-now fixed"}>{[total.v, total.sign]}</div>
                <div className="highlights row clearfix">
                    <div className="title">{month.format('MMMM')}</div>
                    <div className="row total-wrap">
                        <div className="total expense">{[expense.v, expense.sign]}</div>
                        <div className="total income">{[income.v, income.sign]}</div>
                    </div>
                    <div className="row categories">
                        {this.state.data.categories.map((e, i) => <Category key={i} value={e.value} name={e.name} />)}
                    </div>
                </div>
            </div>
        )
    }
});

const Category = React.createClass({
    render() {
        let value = _getValue(this.props.value, 'small', 'red');

        return (
            <div className="category">
                <div className="value">{[value.v, value.sign]}</div>
                <div className="name">{this.props.name}</div>
            </div>
        )
    }
});

module.exports = Highlights;