'use strict';

const _savingsColor     = '#03A9F4';
const _savingsPinColor  = '#4FC3F7';
const _expenseColor     = '#f44336';
const _expensePinColor  = '#e57373';
const _incomeColor      = '#4CAF50';
const _incomePinColor   = '#81C784';
const _incomeFillColor  = 'rgba(76,175,80,1)';

const React     = require('react');
const Snap      = require('snapsvg');
const moment    = require('moment');
const Data      = require('../../stores/data-store');
const _         = require('underscore');
const _w        = 1100;
const _maxH     = 300;

let _h      = 60;
let _s      = false;
let _d      = 0;
let _hover = false;
let _lines = {};
let _pins = {};

function _get() {
    return Data.getGraphData()
}

function _build(max, data) {
    let line = `M10, ${_h+10} L`;
    let pins = [];

    _.each(data, function(entry, day) {
        let x   = day * _d;
        let y = 10 + _h - (entry * _h) / max;

        line += x + ',' + y + ',';

        pins.push({x:x,y:y,day:day,value:entry});
    });

    line += `${_w},${_h}`;

    return {line: line, pins: pins}
}

const Graph = React.createClass({
    getInitialState() {
        return {
            data: {},
            big: false,
            tooltip: false,
            height: _h
        }
    },
    componentDidMount() {
        _s = Snap('#svgGraphWrap');
        this.setState({data: _get()});
        this.draw();
    },
    draw() {
        let exLine = _s.path(`M0,${_h}, L1000,${_h}`);
        let saLine = _s.path(`M0,${_h}, L1000,${_h}`);
        let inLine = _s.path(`M0,${_h}, L1000,${_h}`);

        exLine.attr({stroke: _expenseColor, fill: _expenseColor, 'fill-opacity':'0','stroke-width':'1'});
        saLine.attr({stroke: _savingsColor, fill: _savingsColor, 'fill-opacity':'0','stroke-width':'1'});
        inLine.attr({stroke: _incomeColor, fill: _incomeColor, 'fill-opacity':'0','stroke-width':'1'});

        exLine.hover(function(){
            exLine.animate({'stroke-width': '2'}, 100);
            _.each(_pins.expense.pin, (p) => p.animate({r:5}, 100));
            _.each(_pins.expense.cover, (c) => c.animate({r:10}, 100));
        }.bind(this), function(){
            exLine.animate({'stroke-width': '1'}, 100);
            _.each(_pins.expense.pin, (p) => p.animate({r:2}, 100));
            _.each(_pins.expense.cover, (c) => c.animate({r:5}, 100));
        });
        saLine.hover(function(){
            saLine.animate({'stroke-width': '2'}, 100);
            _.each(_pins.savings.pin, (p) => p.animate({r:5}, 100));
            _.each(_pins.savings.cover, (c) => c.animate({r:10}, 100));
        }.bind(this), function(){
            saLine.animate({'stroke-width': '1'}, 100);
            _.each(_pins.savings.pin, (p) => p.animate({r:2}, 100));
            _.each(_pins.savings.cover, (c) => c.animate({r:5}, 100));
        });
        inLine.hover(function(){
            inLine.animate({'stroke-width': '2'}, 100);
            _.each(_pins.income.pin, (p) => p.animate({r:5}, 100));
            _.each(_pins.income.cover, (c) => c.animate({r:10}, 100));
        }.bind(this), function(){
            inLine.animate({'stroke-width': '1'}, 100);
            _.each(_pins.income.pin, (p) => p.animate({r:2}, 100));
            _.each(_pins.income.cover, (c) => c.animate({r:5}, 100));
        }.bind(this));

        _lines = {
            expense:    {line: exLine},
            savings:    {line: saLine},
            income:     {line: inLine},
        };
    },
    onHover(line, color, lineName) {
        let path = line.attr('d');
        _hover = _s.path(`M0,${_h}, L${_w},${_h}`);
        _hover.attr({d: path, 'fill-opacity': '0', 'stroke-opacity':'0', fill: color, 'stroke-width': '2', stroke: color});
        _hover.animate({'fill-opacity':'.2', 'stroke-opacity':'1'}, 100);
        _hover.hover(function(){}, this.onHoverLeave.bind(this));
    },
    onHoverLeave() {
        _hover.animate({'fill-opacity':'0', 'stroke-opacity':'0'}, 100);
        setTimeout(function(){_hover.remove()},100);
    },
    _onChange() {
        let data = _get(),
            days = moment().set('month', data.month).daysInMonth();

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
        let savings = _build(data.max, data.savings);

        _lines.expense.line.animate({d: expense.line}, 200);
        _lines.savings.line.animate({d: savings.line}, 200);
        _lines.income.line.animate({d: income.line}, 200);

        if (_.keys(_pins).length) this.removePins();

        this.dropPins(expense.pins, 'expense', _expensePinColor);
        this.dropPins(savings.pins, 'savings', _savingsPinColor);
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
            p.hover(this.pinHover.bind(this, p), _.throttle(this.pinHoverLeave.bind(this, p), 2000));
            pcover.hover(this.pinHover.bind(this, p), _.throttle(this.pinHoverLeave.bind(this, p), 2000));

            _pins[line].pin.push(p);
            _pins[line].cover.push(pcover);
        }.bind(this));
    },
    componentWillMount() {
        Data.addChangeListener(this._onChange);
    },

    componentWillUnmount() {
        Data.removeChangeListener(this._onChange);
    },
    toggleHeight(){
        _h = this.state.big ? 60 : _maxH;
        this.setState({
            height: _h,
            big: this.state.big ? false : true
        });

        this._onChange();
    },
    pinHover(pin) {
        let svg = this.refs.svg.getDOMNode();
        let svgRect = svg.getBoundingClientRect();

        let date = moment().set({
            year: this.state.year,
            month: this.state.month,
            date: pin.attr('day')
        }).format('L');
        console.log(date)

        this.setState({
            tooltip: {
                color: pin.attr('stroke'),
                left: parseFloat(pin.attr('cx')) + svgRect.left,
                top: parseFloat(pin.attr('cy')) + svgRect.top,
                visible: true,
                date: date,
                value: pin.attr('value')
            }
        })
    },
    pinHoverLeave(pin) {
        this.setState({
            tooltip: {
                visible: false
            }
        })
    },
    render() {
        return (
            <div className="graph-wrap" style={{height: 'auto'}} >
                <Tooltip tooltip={this.state.tooltip} />
                <div className="t-max">{this.state.max}</div>
                <div className="r-max">{this.state.days}</div>
                <div className="min"></div>
                <svg ref="svg" style={{height: this.state.height+20}} id="svgGraphWrap"></svg>
                <a href='javascript:void(0)' onClick={this.toggleHeight}>{this.state.big ? 'Less' : 'More'}</a>
                {this.state.big ? <Dash /> : ''}
            </div>
        )
    }
});

const Tooltip = React.createClass({
    render() {

        let style = {
            backgroundColor: this.props.tooltip.color,
            left: this.props.tooltip.left - 40,
            top: this.props.tooltip.top - 57
        };

        let triangleStyle = {
            borderColor: this.props.tooltip.color + ' transparent transparent transparent'
        };

        return (
            <div style={style} className={this.props.tooltip.visible ? "vis graph-tooltip" : 'graph-tooltip'}>
                <div className="triangle" style={triangleStyle}></div>
                <div className="date">{this.props.tooltip.date}</div>
                <div className="value">{this.props.tooltip.value}</div>
            </div>
        )
    }
});

const Dash = React.createClass({
    render() {
        return (
            <div className="dash">
                <div>Expense</div>
                <div>Expense</div>
                <div>Expense</div>
            </div>
        )
    }
})

module.exports = Graph;