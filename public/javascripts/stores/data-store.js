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
let _income     = [];
let _month      = moment().month();

function _add(entry) {
    entry.time      = moment().unix();
    entry.userId    = User.id();

    if (entry.type === 'expense') {
        _handleExpense(entry)
    } else {
        _handleIncome(entry)
    }

    entry.balance = _balance;
    entry.savings = _saved;

    reqwest({
        url: '/add-entry',
        method: 'post',
        data: {data: JSON.stringify(entry)},
        success(data) {
            _updateEntry(data.entry)
        }
    })
}

function _updateBalance(value) {
    _balance = parseInt(value);

    reqwest({
        method: 'post',
        url: '/balance/update/',
        data: {value: _balance, userId: User.id()}
    })
}

function _updateSavings(value) {
    _saved = parseInt(value);

    reqwest({
        method: 'post',
        url: '/savings/update/',
        data: {value: _saved, userId: User.id()}
    })
}

function _update(entry) {
    if (entry.type === 'expense') {
        _balance += entry.oldValue;
        _balance -= entry.value;

        if (entry.category && entry.category.code === 'savings') {
            _saved -= entry.oldValue;
            _saved += entry.value;
        }
    } else {
        _balance -= entry.oldValue;
        _balance += entry.value;

        if (entry.category && entry.category.code === 'savings') {
            _saved += entry.oldValue;
            _saved -= entry.value;
            _saved = _saved >= 0 ? _saved : 0;
        }

    }

    entry.balance = _balance;
    entry.savings = _saved;

    reqwest({
        url: '/update-entry',
        method: 'post',
        data: {data: JSON.stringify(entry)}
    })
}

function _handleIncome(entry) {
    _income.unshift(entry);

    if (entry.category && entry.category.code === 'savings') {
        _saved -= entry.value;
        _saved = _saved >= 0 ? _saved : 0;
    }

    _balance += entry.value;
}

function _handleExpense(entry) {
    _expense.unshift(entry);
    _balance -= entry.value;

    if (entry.category && entry.category.code === 'savings') {
        _saved += entry.value;
    }
}

function _remove(entry) {
    let i;
    if (entry.type === 'expense') {
        i = _expense.indexOf(entry);
        _expense.splice(i, 1);
        _balance += entry.value;

        if (entry.category && entry.category.code === 'savings') {
            _saved -= entry.value;
            _saved = _saved >= 0 ? _saved : 0;
        }

    } else {
        i = _income.indexOf(entry);
        _income.splice(i, 1);
        _balance -= entry.value;

        if (entry.category && entry.category.code === 'savings') {
            _saved += entry.value;
        }
    }

    entry.balance = _balance;
    entry.savings = _saved;

    reqwest({
        url: '/remove-entry/',
        method: 'post',
        data: entry,
        success(data) {

        }
    })
}

function _updateEntry(entry) {
    if (entry.type === 'expense') {
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
        success: _setInitData,
        data: {userId: User.id()}

    })
}

function _setInitData(data) {
    _setData(data);
    Data.emitChange();
}

function _setData(data) {
    _income     = data.income ? data.income : [];
    _expense    = data.expense ? data.expense : [];

    Data.emitChange();
}

function _fetch(params) {
    _month = params.month ? params.month : _month;
    params.userId = User.id();

    reqwest({
        url: '/fetch/',
        method: 'post',
        data: params,
        success: _setInitData
    })
}

function _getTopCategories() {
    return {expense: _getGrouped(_expense), income: _getGrouped(_income)};
}

function _getGrouped(arr) {
    let grouped = [];
    _.each(arr, function(e) {
        if (!e.category) return;

        let group = _.find(grouped, (el) => el.name === e.category.name);

        if (group) {
            let i = grouped.indexOf(group);
            grouped[i].value += e.value;
        } else {
            grouped.push({code: e.category.code, name: e.category.name, value: e.value});
        }
    });

    grouped = _.sortBy(grouped, (e) => -e.value);
    return grouped;
}

const Data = assign(EventEmitter.prototype, {
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

    getByFilter(params) {
        _fetch(params);
    },

    getMonth() {
        return _month;
    },

    getCurrentData(params) {
        let data = params.type === 'expense' ? _expense : _income;
        return params.category ? _.filter(data, (entry) => entry.category.code === params.category) : data;
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

    getHighlights() {
        let totalExpense    = 0;
        let totalIncome     = 0;
        _.each(_expense, function(e) { totalExpense += e.value });
        _.each(_income, function(e) { totalIncome += e.value });

        return {
            categories: _getTopCategories(),
            totalExpense: totalExpense,
            totalIncome: totalIncome
        }
    },

    getGraphData() {
        let expense = {},
            income = {},
            month = 0,
            year = 0,
            lastDay = 1,
            max = 0;

        _.each(_expense, function(entry, i) {
            let time = moment(entry.time, 'X').date();
            month = moment(entry.time, 'X').month();
            year = moment(entry.time, 'X').year();
            lastDay = moment(entry.time, 'X').date() > lastDay ? moment(entry.time, 'X').date() : lastDay;
            expense[time] = expense[time] ? expense[time] : 0;
            expense[time] += entry.value;

            max = max > expense[moment(entry.time, 'X').date()] ? max : expense[moment(entry.time, 'X').date()];
        });
        _.each(_income, function(entry, i) {
            let time = moment(entry.time, 'X').date();
            lastDay = moment(entry.time, 'X').date() > lastDay ? moment(entry.time, 'X').date() : lastDay;
            month = moment(entry.time, 'X').month();
            year = moment(entry.time, 'X').year();
            income[time] = income[time] ? income[time] : 0;
            income[time] += entry.value;

            max = max > income[moment(entry.time, 'X').date()] ? max : income[moment(entry.time, 'X').date()];
        });

        return {lastDay: lastDay, month: month, year: year, expense: expense, income: income, max: max}
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
            case Constants.entry.update:
                _update(payload.action.entry);
                break;
            case Constants.balance.updateBalance:
                _updateBalance(payload.action.value);
                break;
            case Constants.balance.updateSavings:
                _updateSavings(payload.action.value);
                break;
        }

        Data.emitChange();

        return true;
    })
});

module.exports = Data;