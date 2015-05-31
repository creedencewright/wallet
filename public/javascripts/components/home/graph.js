const React = require('react');
const Snap  = require('snapsvg');
const Data  = require('../../stores/data-store');
const _     = require('underscore');
const _w    = 1000;
const _h    = 390;

let _s      = false;

let _d      = 0;

function _get() {
    return Data.getGraphData()
}

function _build(max, data) {
    let line = 'M0,390 L';
    let pins = [];

    _.each(data, function(entry, day) {
        let x   = day * _d;
        let y = _h - (entry * _h) / max;

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
        let exLine = _s.path('M0,390, L1000,390');
        exLine.attr({stroke: 'rgba(4,169,244,1)', fill: 'transparent', 'stroke-width':'1'})
        this.setState({
            exLine: exLine
        })
    },
    _onChange() {
        let days = 31,
            data = _get();
        _d = _w/days;

        this.setState({
            data: data,
            days: days,
            max: data.max
        });

        this.build();
    },
    build() {
        let expense = _build(this.state.data.max, this.state.data.expense);
        let line = expense.line;
        this.state.exLine.animate({d: line}, 500);

        this.dropPins(expense.pins);
    },
    dropPins(pins) {
        _.each(pins, function(pin) {
            let pcover = _s.circle(pin.x,pin.y,10);
            let p = _s.circle(pin.x,pin.y,5);
            pcover.attr({fill: '#fff'});
            p.attr({stroke: '#5ad', 'stroke-width':2, fill: '#fff'});
        })
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