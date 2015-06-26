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

require('moment/locale/ru');

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

    return {v: (<span className="val">{value}</span>), sign: sign}
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
            category: false,
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

    categorySelect(data) {
        this.setState({
            data: _getCurrentData({
                type: data.tab ? data.tab : this.state.tab,
                category: data.code
            }),
            category: data.code ? data.name : false,
            tab: data.tab ? data.tab : this.state.tab
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
                    </div>
                    <div className="col-sm-8 table-wrap">
                        <div className="title-wrap">
                            <AddExpense tab={this.state.tab} addEvent={this.toggleForm} />
                            <Tabs categoryClick={this.categorySelect} category={this.state.category} onClick={this.setTab} tab={this.state.tab} />
                            <TimePicker close={this.togglePicker} opened={this.state.monthPicker} changeHandler={this.monthChange} month={this.state.month} />
                            <a onClick={this.togglePicker} href="javascript:void(0);" className="link current-month">
                                {moment().month(this.state.month).format('MMMM')}
                            </a>
                        </div>
                        <Entries categoryClick={this.categorySelect} loading={this.state.loading} data={this.state.data} />
                    </div>
                    <div className="col-sm-4 col-md-4 col-lg-4">
                        <Highlights data={this.state.data} categorySelect={this.categorySelect} />
                    </div>
                </div>
            </div>
        )
    }
});

const Tabs = React.createClass({
    getInitialState() {
        return {category: ''}
    },

    click(tab) {
        this.props.onClick(tab)
    },

    componentWillReceiveProps(nextProps) {
        this.setState({
            category: nextProps.category ? nextProps.category : this.state.category
        })
    },

    categoryClose() {
        this.props.categoryClick({tab: this.props.tab, code: false});
    },

    render() {
        let categoryClass = this.props.category ? `${this.props.tab} category active` : `${this.props.tab} category`;
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
                <a onClick={this.categoryClose} href="javascript:void(0);" className={categoryClass}>{this.props.category ? this.props.category : this.state.category}</a>
            </div>
        )
    }
});

const Entries = React.createClass({
    render: function() {
        let wrapClass = this.props.loading ? 'loading row entries-wrap expense' : 'row entries-wrap expense';
        if (!this.props.data.length) wrapClass += ' no-data'
        return (
            <div className={wrapClass}>
                <div className="no-data-msg">{User.isEn() ? 'No entries yet.' : 'Нет записей.'}</div>
                {this.props.data.map((entry, i) =>
                        <Entry categoryClick={this.props.categoryClick} entry={entry} key={i} />
                )}
            </div>
        )
    }
});

const Entry = React.createClass({
    getInitialState() {
        return {
            edit: false
        }
    },

    edit() {
        this.setState({edit: true});
    },

    closeEdit(e) {
        let classes = e.target.className.split(' ');
        if (classes.indexOf('val') != -1 || classes.indexOf('rub') != -1) return;
        this.update();
    },

    keydown(e) {
        if (e.keyCode === 13) this.update();
        if (e.keyCode === 27) this.setState({edit: false});
    },

    update() {
        this.setState({edit: false});

        let value = this.refs.value.getDOMNode().value;
        if (!value) return;

        let entry = this.props.entry;

        entry.oldValue = entry.value;
        entry.value = parseInt(value);
        Actions.entry.update(entry);
    },

    categoryClick(category) {
        this.props.categoryClick({
            tab: false,
            name: category.name,
            code: category.code
        });
    },

    remove() {
        Actions.entry.remove(this.props.entry);
    },

    render() {
        let entry   = this.props.entry,
            value   = _getValue(entry.value, entry.type === 'expense' ? 'red' : 'green'),
            time    = entry ? moment(entry.time, 'X') : 0;

        return (
            <div onClick={this.closeEdit} className="col-sm-12 entry-wrap">
                <div className={entry.type + ' entry'}>
                    <a href="javascript:void(0);" onClick={this.remove} className="remove"></a>
                    <div className={entry.category ? `type-img ${entry.category.code}` : 'type-img none'}></div>
                    <div className={entry.category ? "value-wrap w-cat" : 'value-wrap'}>
                        <input onKeyDown={this.keydown} ref="value" defaultValue={entry.value} className={this.state.edit ? 'val active' : 'val'} type="text"/>
                        <span onClick={this.edit} className="value">{[value.v, value.sign]}</span>
                        <span onClick={this.categoryClick.bind(this, entry.category)} className="category">{entry.category ? entry.category.name : '' }</span>
                    </div>
                    <div className="time">{moment(time).calendar()}</div>
                </div>
            </div>
        )
    }
});

module.exports = Expense;
