'use strict';

const React = require('react');
const Snap  = require('snapsvg');
const Data  = require('../../stores/data-store');
const _     = require('underscore');
const _w    = 1000;
const _h    = 300;

const _savingsColor     = '#03A9F4';
const _savingsPinColor  = '#4FC3F7';
const _expenseColor     = '#f44336';
const _expensePinColor  = '#e57373';
const _incomeColor      = '#4CAF50';
const _incomePinColor   = '#81C784';

let _s      = false;
let _d      = 0;
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

        pins.push({x:x,y:y});
    });

    return {line: line, pins: pins}
}

const Graph = React.createClass({
    getInitialState() {
        return {
            data: {}
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

        exLine.attr({stroke: _expenseColor, fill: 'transparent', 'stroke-width':'1'});
        saLine.attr({stroke: _savingsColor, fill: 'transparent', 'stroke-width':'1'});
        inLine.attr({stroke: _incomeColor, fill: 'transparent', 'stroke-width':'1'});

        exLine.hover(function(){
            exLine.animate({'stroke-width': '2'}, 100);
            _.each(_pins.expense.pin, (p) => p.animate({r:5}, 100));
            _.each(_pins.expense.cover, (c) => c.animate({r:10}, 100));
        }, function(){
            exLine.animate({'stroke-width': '1'}, 100);
            _.each(_pins.expense.pin, (p) => p.animate({r:2}, 100));
            _.each(_pins.expense.cover, (c) => c.animate({r:5}, 100));
        });
        saLine.hover(function(){
            saLine.animate({'stroke-width': '2'}, 100);
            _.each(_pins.savings.pin, (p) => p.animate({r:5}, 100));
            _.each(_pins.savings.cover, (c) => c.animate({r:10}, 100));
        }, function(){
            saLine.animate({'stroke-width': '1'}, 100);
            _.each(_pins.savings.pin, (p) => p.animate({r:2}, 100));
            _.each(_pins.savings.cover, (c) => c.animate({r:5}, 100));
        });
        inLine.hover(function(){
            inLine.animate({'stroke-width': '2'}, 100);
            _.each(_pins.income.pin, (p) => p.animate({r:5}, 100));
            _.each(_pins.income.cover, (c) => c.animate({r:10}, 100));
        }, function(){
            inLine.animate({'stroke-width': '1'}, 100);
            _.each(_pins.income.pin, (p) => p.animate({r:2}, 100));
            _.each(_pins.income.cover, (c) => c.animate({r:5}, 100));
        });

        _lines = {
            expense:    {line: exLine},
            savings:    {line: saLine},
            income:     {line: inLine},
        }
    },
    _onChange() {
        let data = _get(),
            days = 31;

        _d = _w/days;

        this.setState({
            data: data,
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
    dropPins(pins, line, pinColor) {
        _pins = _pins ? _pins : {};
        _pins[line] = {pin:[],cover:[]};

        _.each(pins, function(pin) {
            let pcover = _s.circle(pin.x,pin.y,5);
            let p = _s.circle(pin.x,pin.y,2);
            pcover.attr({fill: 'rgba(255,255,255,0)'});
            p.attr({stroke: 'rgba(255,255,255,0)', 'stroke-width':2, fill: 'rgba(255,255,255,0)'});

            pcover.animate({fill:'#fff'}, 400);
            p.animate({fill:'#fff', stroke: pinColor}, 400);

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
    render() {
        return (
            <div className="graph-wrap">
                <div className="t-max">{this.state.max}</div>
                <div className="r-max">{this.state.days}</div>
                <div className="min">0</div>
                <svg id="svgGraphWrap"></svg>
            </div>
        )
    }
});

module.exports = Graph;