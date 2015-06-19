/*** @jsx React.DOM */

'use strict';

const React         = require('react');
const User          = require('../../stores/user-store');
const Data          = require('../../stores/data-store');
const Actions       = require('../../actions/app-actions');
const AddExpense    = require('./add-expense');
const _             = require('underscore');
const Highlights    = require('./highlights');
const TimePicker    = require('./time-picker');
const Graph         = require('./graph');
const moment        = require('moment');

moment.locale('ru');
console.log(moment.locale());

if (!User.isEn()) moment.locale('ru');


function _getCurrentData(params) {
    return Data.getCurrentData(params);
}
function _fetch(params) {
    return Data.getByFilter(params);
}
function _getValue(v, color) {
    let value   = User.isEn() ? `$${v}` : v,
        sign    = User.isEn() ? '' : (<span className={`rub small ${color}`}></span>);

    return {v: value, sign: sign}
}

const Expense = React.createClass({
    getInitialState() {
        return {
            data: [],
            tab: 'expense',
            loading: true,
            monthPicker: false,
            month: moment().month(),
            year: moment().year()
        };
    },

    _onChange() {
        this.setState({
            data: _getCurrentData({type: this.state.tab}),
            loading: false
        })
    },

    componentDidUpdate() {
        if (this.state.loading) {
            this.setState({loading: false});
        }
    },

    componentWillMount() {
        Data.addChangeListener(this._onChange);
    },

    componentWillUnmount() {
        Data.removeChangeListener(this._onChange);
    },

    componentDidMount() {
        Data.fetchInitData();
    },

    toggleForm() {
        this.setState({
            opened: this.state.opened ? false : true
        })
    },

    setTab(tab) {
        this.setState({
            tab: tab,
            loading: true,
            data: _getCurrentData({type: tab})
        });
    },

    monthChange(month, e) {
        _fetch({month: month, year: this.state.year});

        this.setState({
            month: month
        });
    },

    togglePicker() {
        this.setState({
            monthPicker: this.state.monthPicker ? false : true
        })
    },

    render() {
        return (
            <div>
                <div className="container">
                    <div className="main-info-wrap">
                        <div className="col-md-8 col-lg-8">
                            <Graph />
                        </div>
                        <div className="col-md-4 col-lg-4">
                            <Highlights data={this.state.data} />
                        </div>
                    </div>
                    <div className="col-sm-8 table-wrap">
                        <div className="title-wrap">
                            <AddExpense tab={this.state.tab} addEvent={this.toggleForm} />
                            <Tabs onClick={this.setTab} tab={this.state.tab} />
                            <TimePicker close={this.togglePicker} opened={this.state.monthPicker} changeHandler={this.monthChange} month={this.state.month} />
                            <a onClick={this.togglePicker} href="javascript:void(0);" className="link current-month">
                                {moment().month(this.state.month).format('MMMM')}
                            </a>
                        </div>
                        <Entries loading={this.state.loading} data={this.state.data} />
                    </div>
                </div>
            </div>
        )
    }
});

const Tabs = React.createClass({
    click(tab) {
        this.props.onClick(tab)
    },
    render() {
        return (
            <div className="tabs">
                <a
                    href="javascript:void(0);"
                    onClick={this.click.bind(this, 'expense')}
                    className={this.props.tab == 'expense' ? 'expense active' : 'expense'}>{User.isEn() ? 'Expense' : 'Расходы'}</a>
                <a
                    href="javascript:void(0);"
                    onClick={this.click.bind(this, 'income')}
                    className={this.props.tab == 'income' ? 'income active' : 'income'}>{User.isEn() ? 'Income' : 'Доходы'}</a>
            </div>
        )
    }
});

const Entries = React.createClass({
    render: function() {
        return (
            <div className={this.props.loading ? 'loading row entries-wrap expense' : 'row entries-wrap expense'}>
                {this.props.data.map((entry, i) =>
                        <Entry entry={entry} key={i} />
                )}
            </div>
        )
    }
});

const Entry = React.createClass({
    remove() {
        Actions.entry.remove(this.props.entry);
    },
    render() {
        let entry   = this.props.entry,
            value   = _getValue(entry.value, entry.type === 'expense' ? 'red' : 'green'),
            time    = entry ? moment(entry.time, 'X') : 0;
        
        return (
            <div className="col-sm-12 entry-wrap">
                <div className={entry.type + ' entry'}>
                    <a href="javascript:void(0);" onClick={this.remove} className="remove"></a>
                    <div className={entry.category ? `type-img ${entry.category.code}` : 'type-img none'}></div>
                    <div className={entry.category ? "value-wrap w-cat" : 'value-wrap'}>
                        <span className="value">{[value.v, value.sign]}</span>
                        <span className="category">{entry.category ? entry.category.name : '' }</span>
                    </div>
                    <div className="time">{moment(time).calendar()}</div>
                </div>
            </div>
        )
    }
});

module.exports = Expense;
