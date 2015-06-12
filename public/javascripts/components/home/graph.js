'use strict';

const _savingsColor     = '#03A9F4';
const _savingsPinColor  = '#4FC3F7';
const _expenseColor     = '#f44336';
const _expensePinColor  = '#e57373';
const _incomeColor      = '#4CAF50';
const _incomePinColor   = '#81C784';

const React     = require('react');
const Snap      = require('snapsvg');
const moment    = require('moment');
const Data      = require('../../stores/data-store');
const _         = require('underscore');
const _w        = 1100;
const _maxH     = 300;

let _h      = 60;
let _lines  = {};
let _s      = false;
let _d      = 0;
let _pins = {};

function _get() {
    return Data.getGraphData()
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

    //line += `${_w},${_h}`;

    return {line: line, pins: pins}
}

const Graph = React.createClass({
    tooltipTimeout: false,
    getInitialState() {
        return {
            data: {},
            big: false,
            tooltip: false,
            height: _h
        }
    },

    componentDidMount() {
        let svg = this.refs.svg.getDOMNode();

        _s = Snap('#svgGraphWrap');
        this.setState({
            data: _get(),
            rect: svg.getBoundingClientRect()
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

        this.setState({
            data: data,
            month: data.month,
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
            p.hover(this.pinHover.bind(this, p), this.pinHoverLeave);
            pcover.hover(this.pinHover.bind(this, p), this.pinHoverLeave);

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

    pinHoverLeave() {
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

        this.setState({
            tooltip: {
                year: this.state.year,
                month: this.state.month,
                day: pin.attr('day'),
                color: pin.attr('stroke'),
                left: parseFloat(pin.attr('cx')) + svgRect.left,
                top: parseFloat(pin.attr('cy')) + svgRect.top,
                active: true,
                value: pin.attr('value')
            }
        })
    },

    render() {
        return (
            <div className="graph-wrap" style={{height: 'auto'}} >
                <Tooltip data={this.state.data} rect={this.state.rect} tooltip={this.state.tooltip} />
                <div className="t-max">{this.state.max}</div>
                <div className="r-max">{this.state.days}</div>
                <div className="min"></div>
                <svg ref="svg" style={{height: this.state.height+20}} id="svgGraphWrap"></svg>
                <a href='javascript:void(0)' onClick={this.toggleHeight}>{this.state.big ? 'Less' : 'More'}</a>
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
            date = `${m.format('MMMM')} ${m.format('D')}`;
        } else {
            let m = moment().set({year: this.state.year, month: this.state.month})
            date = `${m.format('MMMM')}`;
        }
        this.setState({
            date: date,
            year: props.tooltip.year ? props.tooltip.year : this.state.year,
            month: props.tooltip.month ? props.tooltip.month : this.state.month,
            active: props.tooltip.active,
            rect: this.props.rect
        })
    },

    render() {
        let left, top;

        if (!this.state.active && this.state.rect) {
            let pos = this.getDefaultPosition();
            left = pos.left;
            top = pos.top;
        } else {
            left = this.props.tooltip.left - 45;
            top = this.props.tooltip.top - 67;
        }

        let style = {
            backgroundColor: this.props.tooltip.color,
            left: left,
            top: top
        };

        let triangleStyle = {
            borderColor: this.props.tooltip.color + ' transparent transparent transparent'
        };

        return (
            <div style={style} className={this.state.active ? 'graph-tooltip active' : 'graph-tooltip'}>
                <div className="triangle" style={triangleStyle}></div>
                <div className="date">{this.state.date}</div>
                <div className="value pin">{this.props.tooltip.value}</div>
            </div>
        )
    }
});

const Dash = React.createClass({
    getSumm(arr) {
        let sum = 0;
        _.each(arr, (v) => sum += parseInt(v));

        return sum;
    },

    render() {
        return (
            <div className="dash">
                <div className="value">{this.getSumm(_.values(this.props.data.expense))}</div>
                <div className="value">{this.getSumm(_.values(this.props.data.income))}</div>
            </div>
        )
    }
})

module.exports = Graph;