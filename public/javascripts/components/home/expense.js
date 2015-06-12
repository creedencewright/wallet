/*** @jsx React.DOM */

const React         = require('react');
const User          = require('../../stores/user-store');
const Data          = require('../../stores/data-store');
const Actions       = require('../../actions/app-actions');
const AddExpense    = require('./add-expense');
const _             = require('underscore');
const moment        = require('moment');
const Highlights    = require('./highlights');
const TimePicker    = require('./time-picker');

function _getCurrentData(params) {
    return Data.getCurrentData(params);
}
function _fetch(params) {
    return Data.fetch(params);
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
                <Highlights />
                <div className="container">
                    <div className="col-sm-9 title-wrap">
                        <AddExpense tab={this.state.tab} addEvent={this.toggleForm} />
                        <Tabs onClick={this.setTab} tab={this.state.tab} />
                        <TimePicker close={this.togglePicker} opened={this.state.monthPicker} changeHandler={this.monthChange} month={this.state.month} />
                        <a onClick={this.togglePicker} href="javascript:void(0);" className="link current-month">
                            {moment().month(this.state.month).format('MMMM')}
                        </a>
                        <hr/>
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
                    className={this.props.tab == 'expense' ? 'expense active' : 'expense'}>Expense</a>
                <a
                    href="javascript:void(0);"
                    onClick={this.click.bind(this, 'income')}
                    className={this.props.tab == 'income' ? 'income active' : 'income'}>Income</a>
            </div>
        )
    }
});

const Entries = React.createClass({
    render: function() {
        return (
            <div className={this.props.loading ? 'loading entries-wrap expense' : 'entries-wrap expense'}>
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
            sign    = entry.type === 'expense' ? '-' : '+',
            time    = entry ? moment(entry.time, 'X') : 0;
        
        return (
            <div className="col-sm-12">
                <div className={entry.type + ' entry'}>
                    <a href="javascript:void(0);" onClick={this.remove} className="remove"></a>
                    <div className={entry.category ? `type-img ${entry.category.code}` : 'type-img none'}></div>
                    <div className="value">
                        <span>{sign + entry.value }</span><br/>
                        <span className="time">{moment(time).calendar()}</span>
                    </div>
                </div>
                <hr/>
            </div>
        )
    }
});

module.exports = Expense;
