/*** @jsx React.DOM */

const React   = require('react');
const User    = require('../../stores/user-store');
const Data    = require('../../stores/data-store');

function _get() {
    return Data.getHighlights();
}

function _getValue(v, color, size) {
    let value   = User.isEn() ? `$${v}` : v,
        sign    = User.isEn() ? '' : (<span className={`rub ${size} ${color}`}></span>);

    return {v: value, sign: sign}
}

const Highlights = React.createClass({
    getInitialState() {
        return {
            data: _get()
        };
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
        let total = _getValue(Data.getBalance(), 'big', 'green');

        return (
            <div className="highlights-wrap">
                <div className="money-now">{[total.v, total.sign]}</div>
                <div className="highlights row clearfix">
                    <div className="title">{User.isEn() ? 'Highlights' : 'В этом месяце'}</div>
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