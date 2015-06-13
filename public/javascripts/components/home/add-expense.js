/*** @jsx React.DOM */
const React   = require('react');
const _       = require('underscore');
const Actions = require('../../actions/app-actions');
const Type    = require('../../stores/types-store');

function _getTypes() {
    return Type.get();
}

function _fetchTypes() {
    return Type.fetch();
}

const AddExpense = React.createClass({
    getInitialState() {
        let types = this.getCurrentTypes(this.props.tab);
        return {
            tab: this.props.tab,
            category: false,
            types: types.all,
            currentTypes: types.current
        }
    },

    getCurrentTypes(tab) {
        let types = _getTypes();
        return {
            all: types,
            current: tab === 'income' ? _.filter(types, (t) => t.type === 'income') : _.filter(types, (t) => t.type === 'expense')
        }
    },

    componentWillMount() {
        Type.addChangeListener(this._onChange);
    },

    componentDidMount() {
        _fetchTypes();
    },

    _onChange() {
        let types = this.getCurrentTypes(this.state.tab);

        this.setState({
            types: types.all,
            currentTypes: types.current
        })
    },

    componentWillUnmount() {
        Type.removeChangeListener(this._onChange);
    },

    add(e) {
        e.preventDefault();
        this.setState({opened: false})

        let category = _.find(this.state.types, (t) => t.code === this.state.category);

        var entry = {
            category: category ? {name: category.name, code: category.code} : false,
            type: this.state.tab,
            value: parseFloat(this.refs.amount.getDOMNode().value)
        }

        Actions.entry.add(entry);
    },

    componentWillUpdate(props) {
        if (props.tab !== this.props.tab) {
            let types = this.getCurrentTypes(props.tab);
            this.state.tab = props.tab;
            this.state.currentTypes = types.current;
            this.state.types = types.all;
        }
    },

    toggleForm() {
        this.setState({
            opened: this.state.opened ? false : true
        })
    },

    handleTypeChange(event) {
        this.setState({
            tab: event.target.value,
            currentTypes: event.target.value === 'income' ? _.filter(this.state.types, (t) => t.type === 'income') : _.filter(this.state.types, (t) => t.type === 'expense')
        })
    },

    typeClickHandler(code) {
        this.setState({category: code});
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

                        <div className="entry-tab">
                            <label>
                                <input checked={this.state.tab === 'expense' ? 'checked' : false} onChange={this.handleTypeChange} type="radio" name="type" value="expense"/>
                                <span className="name">Expense</span>
                            </label>
                            <label className="income">
                                <input checked={this.state.tab === 'income' ? 'checked' : false} onChange={this.handleTypeChange} type="radio" name="type" value="income"/>
                                <span className="name">Income</span>
                            </label>
                        </div>
                        <Types typeClickHandler={this.typeClickHandler} tab={this.state.tab} types={this.state.currentTypes} />
                    </form>
                </div>
            </div>
        )
    }
});

const Types = React.createClass({
    getInitialState() {
        return {
            type: false
        }
    },

    clickHandler(code) {
        this.setState({type: code});
        this.props.typeClickHandler(code);
    },

    render() {
        return (
            <div className="entry-type">
                <div className="types">
                    <a className={!this.state.type ? 'active' : ''} href="javascript:void(0);" onClick={this.clickHandler.bind(this, false)} >None</a>
                    {this.props.types.map(function(type, i) {
                        return <a onClick={this.clickHandler.bind(this, type.code)} className={this.state.type === type.code ? 'active' : ''} href="javascript:void(0);" key={i} >{type.name}</a>
                    }.bind(this))}
                </div>
            </div>
        )
    }
});

module.exports = AddExpense;