var Dispatcher      = require('../dispatchers/app-dispatcher');
var Constants       = require('../constants/app-constants');
var assign          = require('object-assign');
var EventEmitter    = require('events').EventEmitter;
var _               = require('underscore');
var reqwest         = require('reqwest');

var CHANGE_EVENT = 'change';

var _expenseTypes   = [];
var _incomeTypes    = [];

function _populate(types) {
    _.each(types, function(type) {
        if (type.type == 'income') {
            _incomeTypes.push(type);
        } else if (type.type == 'expense') {
            _expenseTypes.push(type);
        } else {
            _incomeTypes.push(type);
            _expenseTypes.push(type);
        }
    })
}

var Type = assign(EventEmitter.prototype, {
    emitChange: function() {
        this.emit(CHANGE_EVENT);
    },

    addChangeListener: function(cb) {
        this.on(CHANGE_EVENT, cb);
    },

    removeChangeListener: function(cb) {
        this.removeListener(CHANGE_EVENT, cb);
    },

    getExpenseTypes: function() {
        return _expenseTypes;
    },

    getIncomeTypes: function() {
        return _incomeTypes;
    },

    setTypesFromString: function(str) {
        var types = JSON.parse(str);
        _populate(types);
    },

    dispatcherIndex: Dispatcher.register(function(payload) {
        //var action = payload.action;
        //switch(action.actionType) {
            //case Constants.data.ADD:
            //    _add(payload.action.data);
            //    break;
        //}

        //User.emitChange();

        return true;
    })
});

module.exports = Type;