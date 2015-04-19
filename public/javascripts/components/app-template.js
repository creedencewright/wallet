/*** @jsx React.DOM */
var React = require('react');
var Header = require('./common/header');

var Template = React.createClass({
    render: function() {
        return (
            <div>
                <Header />
                {this.props.children}
            </div>
        )
    }
});

module.exports = Template;