var Constants    = require('../constants/app-constants');
var Dispatcher   = require('../dispatchers/app-dispatcher');

module.exports = {
    user: {
        add: function(user) {
            Dispatcher.handleViewAction({
                actionType: Constants.user.ADD,
                user: user
            })
        },
        login: function(user) {
            Dispatcher.handleViewAction({
                actionType: Constants.user.LOGIN,
                user: user
            })
        }
    },
    entry: {
        add: function(entry) {
            Dispatcher.handleViewAction({
                actionType: Constants.entry.add,
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
    savings: {
        add: function(savings) {
            Dispatcher.handleViewAction({
                actionType: Constants.savings.add,
                savings: savings
            })
        }
    }
}