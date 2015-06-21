'use strict';

const _expenseColor     = '#f44336';
const _expensePinColor  = '#e57373';
const _incomeColor      = '#4CAF50';
const _incomePinColor   = '#81C784';

const User      = require('../../stores/user-store');
const React     = require('react');
const Snap      = require('snapsvg');
const moment    = require('moment');
const Data      = require('../../stores/data-store');
const _         = require('underscore');

let _w      = 0;
let _h      = 300;
let _lines  = {};
let _s      = false;
let _d      = 0;
let _pins = {};

function _get() {
    return Data.getGraphData()
}
function _getValue(v) {
    let value   = User.isEn() ? `$${v}` : v,
        sign    = User.isEn() ? '' : (<span className="rub x-small white"></span>);

    return {v: value, sign: sign}
}

function _build(max, data) {
    let line = `M10, ${_h+10} L`;
    let pins = [];

    _.each(data, function(entry, day) {
        let x   = day * _d - 10;
        let y = 10 + _h - (entry * _h) / max;

        line += x + ',' + y + ',';

        pins.push({x:x,y:y,day:day,value:entry});
    });

    return {line: line, pins: pins}
}

const Graph = React.createClass({
    tooltipTimeout: false,
    getInitialState() {
        return {
            data: {},
            noData: true,
            big: false,
            tooltip: false,
            height: _h
        }
    },

    componentDidMount() {
        let svg = this.refs.svg.getDOMNode(),
            rect = svg.getBoundingClientRect();

        _w = rect.width;

        _s = Snap('#svgGraphWrap');
        this.setState({
            data: _get(),
            rect: rect
        });
        this.draw();
    },

    componentWillMount() {
        Data.addChangeListener(this._onChange);
    },

    componentWillUnmount() {
        Data.removeChangeListener(this._onChange);
    },

    draw() {
        let exLine = _s.path(`M0,${_h}, L1000,${_h}`);
        let inLine = _s.path(`M0,${_h}, L1000,${_h}`);

        exLine.attr({stroke: _expenseColor, fill: _expenseColor, 'fill-opacity':'0','stroke-width':'1'});
        inLine.attr({stroke: _incomeColor, fill: _incomeColor, 'fill-opacity':'0','stroke-width':'1'});

        _lines = {
            expense:    {line: exLine},
            income:     {line: inLine}
        };
    },

    _onChange() {
        let data = _get(),
            days = data.lastDay;

        _d = _w/days;

        let noData = !_.keys(data.expense).length && !_.keys(data.income).length;

        this.setState({
            data: data,
            noData: noData,
            month: Data.getMonth(),
            year: data.year,
            days: days,
            max: data.max
        });

        this.build(data);
    },

    build(data) {
        let expense = _build(data.max, data.expense);
        let income  = _build(data.max, data.income);

        _lines.expense.line.animate({d: expense.line}, 200);
        _lines.income.line.animate({d: income.line}, 200);

        if (_.keys(_pins).length) this.removePins();

        this.dropPins(expense.pins, 'expense', _expensePinColor);
        this.dropPins(income.pins, 'income', _incomePinColor);
    },

    removePins() {
        _.each(_pins, function(sect) {
                _.each(sect, function(p) {
                    _.each(p, function(el) {
                        el.remove()
                    })
                });
            }.bind(this)
        );
    },

    dropPins(pins, line, color) {
        _pins = _pins ? _pins : {};
        _pins[line] = {pin:[],cover:[]};

        _.each(pins, function(pin) {
            let pcover = _s.circle(pin.x,pin.y,5);
            let p = _s.circle(pin.x,pin.y,2);
            pcover.attr({fill: '#fff', 'fill-opacity':'0'});
            p.attr({
                value: pin.value,
                day: pin.day,
                stroke: color,
                'stroke-opacity':'0',
                'stroke-width':2,
                fill: 'rgba(255,255,255,0)'
            });

            pcover.animate({'fill-opacity':'1'}, 400);
            p.animate({fill:'#fff', 'stroke-opacity': '1'}, 400);
            p.hover(this.pinHover.bind(this, p), this.pinHoverLeave.bind(this, p));
            pcover.hover(this.pinHover.bind(this, p), this.pinHoverLeave.bind(this, p));

            _pins[line].pin.push(p);
            _pins[line].cover.push(pcover);
        }.bind(this));
    },

    toggleHeight(){
        _h = this.state.big ? 60 : _maxH;
        this.setState({
            height: _h,
            big: this.state.big ? false : true
        });

        this._onChange();
    },

    pinHoverLeave(pin) {
        pin.animate({r: 2}, 50);
        this.tooltipTimeout = setTimeout(function() {
            this.setState({
                tooltip: {
                    active: false
                }
            })
        }.bind(this), 3000);
    },

    pinHover(pin) {
        if (this.tooltipTimeout) {
            clearTimeout(this.tooltipTimeout);
            this.tooltipTimeout = false;
        }

        let svg = this.refs.svg.getDOMNode();
        let svgRect = svg.getBoundingClientRect();

        pin.animate({r: 5}, 200, mina.easeinout);

        this.setState({
            tooltip: {
                year: this.state.year,
                month: this.state.month,
                day: pin.attr('day'),
                color: pin.attr('stroke'),
                left: parseFloat(pin.attr('cx')),
                top: parseFloat(pin.attr('cy')),
                active: true,
                value: pin.attr('value')
            }
        })
    },

    render() {
        let day = moment().set({
            date: this.state.days,
            month: this.state.month,
            year: this.state.year
        });

        return (
            <div className={this.state.noData ? "graph-wrap no-data" : "graph-wrap"}>
                <div className="no-data-msg">{User.isEn() ? 'No data yet.' : 'Пока недостаточно данных.'}</div>
                <div className="info">
                    <div className="month">{day.format('MMMM')}</div>
                    <div className="expense">{User.isEn() ? 'Expense' : 'Расходы'}</div>
                    <div className="income">{User.isEn() ? 'Income' : 'Доходы'}</div>
                </div>
                <Tooltip data={this.state.data} rect={this.state.rect} tooltip={this.state.tooltip} />
                <div className="t-max">{day.format('MMMM, D')}</div>
                <div className="t-min">{day.set('date', 1).format('MMMM, D')}</div>
                <svg ref="svg" id="svgGraphWrap"></svg>
            </div>
        )
    }
});

const Tooltip = React.createClass({
    getInitialState() {
        return {active: false}
    },

    getDefaultPosition() {
        let rect = this.state.rect;

        return {
            left: rect.left + rect.width/2 - 350,
            top: rect.top + rect.height + 30
        }
    },

    componentWillReceiveProps(props) {
        let date;
        let m = moment().set({year: this.state.year, month: this.state.month})
        if (props.tooltip.active) {
            m.set({date: props.tooltip.day});
            date = m.format('DD/MM');
        } else {
            let m = moment().set({year: this.state.year, month: this.state.month})
            date = `${m.format('MMMM')}`;
        }

        this.setState({
            date: date,
            year: props.tooltip.year ? props.tooltip.year : this.state.year,
            month: props.tooltip.month ? props.tooltip.month : this.state.month,
            active: props.tooltip.active,
            left: props.tooltip ? props.tooltip.left + 17 : this.state.left,
            top: props.tooltip ? props.tooltip.top - 15 : this.state.top,
            rect: this.props.rect
        })
    },

    render() {
        let z;

        if (!this.state.active && this.state.rect) {
            z = -1;
        } else {
            z = 100;
        }

        let style = {
            backgroundColor: this.props.tooltip.color,
            left: this.state.left,
            top: this.state.top,
            zIndex: z
        };

        let triangleStyle = {
            borderColor: `transparent ${this.props.tooltip.color} transparent transparent`
        };

        let value = _getValue(this.props.tooltip.value);

        return (
            <div style={style} className={this.state.active ? 'graph-tooltip active' : 'graph-tooltip'}>
                <div className="triangle" style={triangleStyle}></div>
                <div className="data">
                    <div className="date">{this.state.date}</div>
                    <div className="value pin">{[value.v, value.sign]}</div>
                </div>
            </div>
        )
    }
});

module.exports = Graph;