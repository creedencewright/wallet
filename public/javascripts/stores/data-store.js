const Dispatcher      = require('../dispatchers/app-dispatcher');
const Constants       = require('../constants/app-constants');
const assign          = require('object-assign');
const EventEmitter    = require('events').EventEmitter;
const _               = require('underscore');
const reqwest         = require('reqwest');
const moment          = require('moment');
const User            = require('./user-store');

const CHANGE_EVENT = 'change';

let _balance    = 0;
let _saved      = 0;
let _expense    = [];
let _savings    = [];
let _income     = [];

function _add(entry) {
    entry.time      = moment().unix();
    entry.userId    = User.id();

    if (entry.type === 'expense') {
        _handleExpense(entry)
    } else if (entry.type === 'savings') {
        _handleSavings(entry)
    } else {
        _handleIncome(entry)
    }

    entry.balance = _balance;
    entry.savings = _saved;

    reqwest({
        url: '/add-entry',
        method: 'post',
        data: entry,
        success(data) {
            console.log(data)
            _update(data.entry)
        }
    })
}

function _handleIncome(entry) {
    _income.unshift(entry);
    _balance += entry.value;
}

function _handleExpense(entry) {
    _expense.unshift(entry);
    _balance -= entry.value;
}

function _handleSavings(entry) {
    _savings.unshift(entry);
    _saved += entry.value;
    _balance -= entry.value;
}

function _remove(entry) {
    let i;
    if (entry.type === 'expense') {
        i = _expense.indexOf(entry);
        _expense.splice(i, 1);
        _balance += entry.value;

    } else if (entry.type === 'savings') {
        i = _savings.indexOf(entry);
        _savings.splice(i ,1);
        _balance    += entry.value;
        _saved      -= entry.value;

    } else {
        i = _income.indexOf(entry);
        _income.splice(i, 1);
        _balance -= entry.value;
    }

    entry.balance = _balance;
    entry.savings = _savings;

    reqwest({
        url: '/remove-entry/',
        method: 'post',
        data: entry,
        success(data) {
        }
    })
}

function _update(entry) {
    if (entry.type === 'savings') {
        let toUpdate = _.find(_savings, function(v) {
            return v.time == entry.time
        });

        let ind = _savings.indexOf(toUpdate);
        assign(_savings[ind], entry);

    } else if (entry.type === 'expense') {
        let toUpdate = _.find(_expense, function(v) {
            return v.time == entry.time
        });

        let ind = _expense.indexOf(toUpdate);
        assign(_expense[ind], entry);

    } else {
        let toUpdate = _.find(_income, function(v) {
            return v.time == entry.time
        });

        let ind = _income.indexOf(toUpdate);
        assign(_income[ind], entry);
    }
}

function _fetchInitData() {
    reqwest({
        url: '/fetch-all/',
        method: 'post',
        success: _setInitData
    })
}

function _setInitData(data) {
    _savings    = data.savings ? data.savings : [];
    _income     = data.income ? data.income : [];
    _expense    = data.expense ? data.expense : [];

    Data.emitChange();
}

function _fetch(params) {
    reqwest({
        url: '/fetch/',
        method: 'post',
        data: params,
        success: _setInitData
    })
}

var Data = assign(EventEmitter.prototype, {
    emitChange() {
        this.emit(CHANGE_EVENT);
    },

    fetchInitData() {
        _fetchInitData()
    },

    addChangeListener(cb) {
        this.on(CHANGE_EVENT, cb);
    },

    removeChangeListener(cb) {
        this.removeListener(CHANGE_EVENT, cb);
    },

    fetch(params) {
        _fetch(params)
    },

    getCurrentData(params) {
        if (params.type === 'expense') {
            return _expense
        } else if (params.type === 'savings') {
            return _savings
        } else {
            return _income
        }
    },

    setBalance(val) {
        _balance = val;
    },

    setSavings(val) {
        _saved = val;
    },

    getSavings() {
        return _saved;
    },

    getBalance() {
        return _balance;
    },

    getGraphData() {
        let expense = {},
            max = 0;

        _.each(_expense, function(entry, i) {
            expense[moment(entry.time, 'X').date()] = expense[moment(entry.time, 'X').date()] ? expense[moment(entry.time, 'X').date()] : 0;
            expense[moment(entry.time, 'X').date()] += entry.value;

            max = max > expense[moment(entry.time, 'X').date()] ? max : expense[moment(entry.time, 'X').date()];
        })

        return {expense: expense, max: max}
    },

    dispatcherIndex: Dispatcher.register(function(payload) {
        let action = payload.action;
        switch(action.actionType) {
            case Constants.entry.add:
                _add(payload.action.entry);
                break;
            case Constants.entry.remove:
                _remove(payload.action.entry);
                break;
        }

        Data.emitChange();

        return true;
    })
});

module.exports = Data;