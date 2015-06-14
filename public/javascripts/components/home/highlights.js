/*** @jsx React.DOM */

const React   = require('react');
const User    = require('../../stores/user-store');
const Data    = require('../../stores/data-store');

function _get() {
    return Data.getHighlights();
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
        return (
            <div className="highlights-wrap">
                <div className="highlights row clearfix">
                    <div className="title">Highlights</div>
                    <div className="row total-wrap">
                        <div className="total expense">${this.state.data.totalExpense}</div>
                        <div className="total income">${this.state.data.totalIncome}</div>
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
        return (
            <div className="category">
                <div className="value">${this.props.value}</div>
                <div className="name">{this.props.name}</div>
            </div>
        )
    }
});

module.exports = Highlights;