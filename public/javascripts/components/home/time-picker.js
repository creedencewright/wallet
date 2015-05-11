const React     = require('react');
const _         = require('underscore');
const moment    = require('moment');

const _months = [0,1,2,3,4,5,6,7,8,9,10,11];

const TimePicker = React.createClass({
    change(m) {
        this.props.changeHandler(m)
    },
    render() {
        let className = "time-picker-wrap " + moment().month(this.props.month).format('MMMM').toLowerCase();
        if (this.props.opened) {
            className += ' active'
        }
        return (
            <div className={className}>
                <a onClick={this.props.close} href="javascript:void(0);" className="close"></a>
                <div className="months clearfix">
                    {_months.map((m) =>
                        <Month change={this.change.bind(this, m)} key={m} month={m} current={this.props.month} />
                    )}
                </div>
            </div>
        )
    }
});

const Month = React.createClass({
    render() {
        let m       = this.props.month,
            month   = moment().month(m);

        return (
            <a onClick={this.props.change} href="javascript:void(0);"
               className={m === this.props.current ? "link month current" : "link month"}>
                {month.format('MMMM')}
            </a>
        )
    }
});

module.exports = TimePicker;