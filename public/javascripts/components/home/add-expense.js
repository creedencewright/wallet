/*** @jsx React.DOM */
var React   = require('react');
var _       = require('underscore');
var Actions = require('../../actions/app-actions');

var AddExpense = React.createClass({
    getInitialState() {
        return {
            type: this.props.type
        }
    },

    add(e) {
        e.preventDefault();
        this.setState({opened: false})
        var entry = {
            type: this.state.type,
            value: parseFloat(this.refs.amount.getDOMNode().value)
        }
        Actions.entry.add(entry);
    },

    componentWillUpdate(props, state) {
        if (props.type !== this.props.type) {
            this.state.type = props.type;
        }
    },

    toggleForm() {
        this.setState({
            opened: this.state.opened ? false : true
        })
    },

    handleTypeChange(event) {
        this.setState({type: event.target.value})
    },

    render() {
        return (
            <div className="add-entry">
                <div className={this.state.opened ? 'opened add-wrap' : 'add-wrap'}>
                    <a className="open" onClick={this.state.opened ? this.add : this.toggleForm} href="javascript:void(0)"></a>
                    <form onSubmit={this.add} className="add-block expense">
                        <a href="javascript:void(0);" onClick={this.toggleForm} className="close"></a>
                        <label className="form-group">
                            <input autoComplete="off" ref="amount" className="form-control" type="text" name="amount" placeholder="Amount"/>
                        </label>

                        <div className="entry-type">
                            <label>
                                <input checked={this.state.type === 'expense' ? 'checked' : false} onChange={this.handleTypeChange} type="radio" name="type" value="expense"/>
                                <span className="name">Expense</span>
                            </label>
                            <label>
                                <input checked={this.state.type === 'savings' ? 'checked' : false} onChange={this.handleTypeChange} type="radio" name="type" value="savings"/>
                                <span className="name">Savings</span>
                            </label>
                            <label className="income">
                                <input checked={this.state.type === 'income' ? 'checked' : false} onChange={this.handleTypeChange} type="radio" name="type" value="income"/>
                                <span className="name">Income</span>
                            </label>
                        </div>
                    </form>
                </div>
            </div>
        )
    }
});

module.exports = AddExpense;