'use strict';

const React = require('react');
const Snap  = require('snapsvg');
const Data  = require('../../stores/data-store');
const _     = require('underscore');
const _w    = 1100;
const _maxH = 300;
let _h      = 60;

const _savingsColor     = '#03A9F4';
const _savingsPinColor  = '#4FC3F7';
const _expenseColor     = '#f44336';
const _expensePinColor  = '#e57373';
const _incomeColor      = '#4CAF50';
const _incomePinColor   = '#81C784';
const _incomeFillColor  = 'rgba(76,175,80,1)';

let _s      = false;
let _d      = 0;
let _hover = false;
let _lines = {};
let _pins = {};
let _tooltip = {};
let _tooltipTimeout = false;

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
            p.hover(this.pinHover.bind(this, p), _.throttle(this.pinHoverLeave.bind(this, p), 300));
            pcover.hover(this.pinHover.bind(this, p), _.throttle(this.pinHoverLeave.bind(this, p), 300));

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
        if (!this.state.big || _tooltip[pin.id]) return;
        let x = pin.attr('cx') - 70;
        let y = parseInt(pin.attr('cy')) + 10;
        let shadow = _s.filter(Snap.filter.shadow(0,4,3,'rgba(0,0,0)','.2'));
        let rect = _s.rect(x, y, 140, 50);
        let text = _s.text(x+20,y+20,'Day:'+pin.attr('day')+'-'+pin.attr('value'))
        _tooltip[pin.id] = _s.g(rect, text);
        rect.attr({
            'fill-opacity': '0',
            filter: shadow,
            fill: '#fff',
        })
        rect.animate({
            transform: 'translate(0,10)',
            'fill-opacity': '1'
        }, 200)
    },
    pinHoverLeave(pin) {
        clearTimeout(_tooltipTimeout);
        _tooltipTimeout = setTimeout(function(){
            _tooltip[pin.id].remove();
            _tooltip[pin.id] = false;
        }, 500);
    },
    render() {
        return (
            <div className="graph-wrap" style={{height: 'auto'}} >
                <div className="t-max">{this.state.max}</div>
                <div className="r-max">{this.state.days}</div>
                <div className="min"></div>
                <svg style={{height: this.state.height+20}} id="svgGraphWrap"></svg>
                <a href='javascript:void(0)' onClick={this.toggleHeight}>{this.state.big ? 'Less' : 'More'}</a>
                {this.state.big ? <Dash /> : ''}
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