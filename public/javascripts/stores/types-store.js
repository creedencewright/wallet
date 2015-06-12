const Dispatcher      = require('../dispatchers/app-dispatcher');
const assign          = require('object-assign');
const EventEmitter    = require('events').EventEmitter;
const _               = require('underscore');
const reqwest         = require('reqwest');

const CHANGE_EVENT = 'change';

const _expenseTypes   = [];
const _incomeTypes    = [];

function _fetch() {
    reqwest({
        url: '/types/fetch',
        method: 'post',
        success(data) {
            _.each(data, function(type) {
                if (type.type === 'expense') {
                    _expenseTypes.push(type);
                } else {
                    _incomeTypes.push(type);
                }
            })
        }
    })
}

var Type = assign(EventEmitter.prototype, {
    emitChange() {
        this.emit(CHANGE_EVENT);
    },

    addChangeListener(cb) {
        this.on(CHANGE_EVENT, cb);
    },

    removeChangeListener(cb) {
        this.removeListener(CHANGE_EVENT, cb);
    },

    getExpenseTypes() {
        return _expenseTypes;
    },

    getIncomeTypes() {
        return _incomeTypes;
    },

    get() {
        return _expenseTypes.concat(_incomeTypes)
    },

    fetch() {
        _fetch();
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