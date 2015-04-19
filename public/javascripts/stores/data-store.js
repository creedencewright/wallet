var Dispatcher      = require('../dispatchers/app-dispatcher');
var Constants       = require('../constants/app-constants');
var assign          = require('object-assign');
var EventEmitter    = require('events').EventEmitter;
var _               = require('underscore');
var reqwest         = require('reqwest');
var moment          = require('moment');
var User            = require('./user-store');

var CHANGE_EVENT = 'change';

var _balance    = 0;
var _savings    = 0;
var _expense    = [];
var _income     = [];

function _add(entry) {
    entry.time      = moment().unix();
    entry.userId    = User.id();

    if (entry.type == 'expense') {
        _expense.unshift(entry);
        Data.recount(0 - entry.value);

        if (_expense.length == 6) {
            _expense.pop();
        }
    } else {
        _income.unshift(entry);
        if (_income.length == 6) {
            _income.pop();
        }
        Data.recount(entry.value);
    }

    entry.balance = _balance;

    reqwest({
        url: '/add-entry',
        method: 'post',
        data: entry,
        success: function(data) {
            console.log(data);
            Data.updateEntry(data.entry);
        }
    })
}

function _remove(entry) {
    if (entry.type== 'expense') {
        var i = _expense.indexOf(entry);
        _expense.splice(i, 1);
    } else {
        var i = _income.indexOf(entry);
        _income.splice(i, 1);
    }

    reqwest({
        url: '/remove-entry/',
        method: 'post',
        data: entry,
        success: function(data) {
            console.log(data);
        }
    })
}

function _addSavings(savings) {
    savings.time    = moment().unix();
    savings.userId  = User.id();
    _expense.unshift(savings);

    if (_expense.length == 6) {
        _expense.pop();
    }

    _savings += savings.value;
    Data.recount(0 - savings.value);

    savings.balance = _balance;
    savings.savings = _savings;

    reqwest({
        url: '/add-savings',
        method: 'post',
        data: savings,
        success: function(data) {
            console.log(data);
            Data.updateEntry(data.entry);
        }
    })
}

function _fetch(params, cb) {
    reqwest({
        method: 'post',
        url: '/fetch-entries/',
        data: params,
        success: function(entries) {
            if (params.type == 'expense') {
                _.each(entries, function(entry) {
                    _expense.push(entry);
                })
            } else {
                _.each(entries, function(entry) {
                    _income.push(entry);
                })
            }

            cb();
        }
    });
}

function _updateExpense(entry) {
    var toUpdate = _.find(_expense, function(v) {
        return v.time == entry.time
    });

    var ind = _expense.indexOf(toUpdate);
    assign(_expense[ind], entry);
}

var Data = assign(EventEmitter.prototype, {
    emitChange: function() {
        this.emit(CHANGE_EVENT);
    },

    recount: function(value) {
        _balance += value;
        this.emit(CHANGE_EVENT);
    },

    fetch: function(params) {
        _fetch(params, _.bind(this.emitChange, this));
    },

    updateEntry: function(entry) {
        if (entry.type == 'expense') {
            _updateExpense(entry);
        } else {
            _updateIncome(entry);
        }

        this.emitChange();
    },

    addChangeListener: function(cb) {
        this.on(CHANGE_EVENT, cb);
    },

    removeChangeListener: function(cb) {
        this.removeListener(CHANGE_EVENT, cb);
    },

    getExpenses: function() {
        return _expense;
    },

    setBalance: function(val) {
        _balance = val;
    },
    setSavings: function(val) {
        _savings = val;
    },
    getSavings: function(val) {
        return _savings;
    },

    getIncomes: function() {
        return _income;
    },

    getBalance: function() {
        return _balance;
    },

    dispatcherIndex: Dispatcher.register(function(payload) {
        var action = payload.action;
        switch(action.actionType) {
            case Constants.entry.add:
                _add(payload.action.entry);
                break;
            case Constants.entry.remove:
                _remove(payload.action.entry);
                break;
            case Constants.savings.add:
                _addSavings(payload.action.savings);
                break;
        }

        Data.emitChange();

        return true;
    })
});

module.exports = Data;