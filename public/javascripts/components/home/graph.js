const React = require('react');
const Snap  = require('snapsvg');
const Data  = require('../../stores/data-store');
const _     = require('underscore');
const _w    = 1200;
const _h    = 400;

let _d      = 0;

function _get() {
    return Data.getGraphData()
}

function _build(max, data) {
    let line = 'M0,400 L';
    _.each(data, function(entry, day) {
        let x   = day * _d;
        let y = _h - (entry * _h) / max;

        line += x + ',' + y + ',';
    });

    return {line: line}
}

const Graph = React.createClass({
    getInitialState() {
        return {
            data: {}
        }
    },
    componentDidMount() {
        this.setState({data: _get()});
        this.draw();
    },
    draw() {
        let s = Snap('#svgGraphWrap');
        let exLine = s.path('M0,400, L1200,400');
        exLine.attr({stroke: 'rgba(4,169,244,1)', fill: 'transparent', 'stroke-width':'4'})
        this.setState({
            exLine: exLine
        })
    },
    _onChange() {
        let days = 30,
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
        console.log(this.state.data.expense);
        let line = expense.line;
        this.state.exLine.animate({d: line}, 500);
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