var Constants    = require('../constants/app-constants');
var Dispatcher   = require('../dispatchers/app-dispatcher');

module.exports = {
    user: {

    },
    entry: {
        add: function(entry) {
            Dispatcher.handleViewAction({
                actionType: Constants.entry.add,
                entry: entry
            })
        },
        update: function(entry) {
            Dispatcher.handleViewAction({
                actionType: Constants.entry.update,
                entry: entry
            })
        },
        remove: function(entry) {
            Dispatcher.handleViewAction({
                actionType: Constants.entry.remove,
                entry: entry
            })
        }
    },
    balance: {
        updateBalance: function(value) {
            Dispatcher.handleViewAction({
                actionType: Constants.balance.updateBalance,
                value: value
            })
        },
        updateSavings: function(value) {
            Dispatcher.handleViewAction({
                actionType: Constants.balance.updateSavings,
                value: value
            })
        }
    }
}