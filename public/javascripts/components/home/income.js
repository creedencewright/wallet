/*** @jsx React.DOM */

var React           = require('react');
var User            = require('../../stores/user-store');
var Data            = require('../../stores/data-store');
var AddEntry        = require('./add-entry');
var _               = require('underscore');
var EntryWatchMixin = require('../../mixins/entry-watch-mixin');
var moment          = require('moment');

function getEntries() {
    return Data.getIncomes();
}
function fetch(params) {
    return Data.fetch(params);
}

var Expense = React.createClass({
    mixins: [EntryWatchMixin(getEntries)],
    getInitialState: function() {
        return {
            data: getEntries(),
            time: moment().startOf('month').unix(),
            endTime: moment().endOf('month').unix(),
            loading: true
        };
    },
    componentDidMount: function() {
        this.setState({loading: true});
        fetch({type: 'income', start: this.state.time, end: this.state.endTime});
    },
    toggleForm: function() {
        this.setState({
            opened: this.state.opened ? false : true
        })
    },
    render: function() {
        return (
            <div className="col-sm-6 title-wrap">
                <div className={this.state.opened ? 'opened add-entry' : 'add-entry'}>
                    <a onClick={this.toggleForm} href="javascript:void(0)"></a>
                    <AddEntry type="income" addEvent={this.toggleForm} />
                </div>
                <div className="tabs">
                    <a href="javascript:void(0);" className="active">Income</a>
                </div>
                <hr/>
                <div className="entries-wrap">
                    {this.state.data.map(function(entry, i){
                        return <Entry entry={entry} key={i} />
                    })}
                </div>
            </div>
        )
    }
});

var Entry = React.createClass({
    render: function() {
        var time = moment.unix(this.props.entry.time);

        return (
            <div>
                <div className="entry income" data-id={this.props.entry._id}>
                    <a href="javascript:void(0);" data-id={this.props.entry._id} className="remove"></a>
                    <div className="type-img"></div>
                    <div className="value">
                        <span>+{this.props.entry.value}</span><br/>
                        <span className="time">{moment(time).fromNow()}</span>
                    </div>
                </div>
                <hr/>
            </div>
        )
    }
});

module.exports = Expense;
