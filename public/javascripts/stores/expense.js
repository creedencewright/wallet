var assign          = require('object-assign');
var EventEmitter    = require('events').EventEmitter;
var _               = require('underscore');
var reqwest         = require('reqwest');
var moment          = require('moment');
var User            = require('./user-store');

var CHANGE_EVENT = 'change';

var _expense    = [];

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

var Expense = assign(EventEmitter.prototype, {
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
    }
});

module.exports = Expense;