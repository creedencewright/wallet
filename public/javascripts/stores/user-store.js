var Dispatcher   = require('../dispatchers/app-dispatcher');
var Constants    = require('../constants/app-constants');
var assign          = require('object-assign');
var EventEmitter    = require('events').EventEmitter;
var _               = require('underscore');
var reqwest         = require('reqwest');

var CHANGE_EVENT = 'change';

var _user = {
    id: false,
    name: ''
}

function _add(user) {
    reqwest({
        url: '/register/',
        method: 'post',
        data: user,
        success: function(data) {
            if (data) {
                window.location('/');
            }
        }
    })
}

function _login(user) {
    reqwest({
        url: '/login/',
        method: 'post',
        data: user,
        success: function(data) {
            if (data) {
                window.location('/');
            }
        }
    })
}

var User = assign(EventEmitter.prototype, {
    emitChange: function() {
        this.emit(CHANGE_EVENT);
    },

    addChangeListener: function(cb) {
        this.on(CHANGE_EVENT, cb);
    },

    removeChangeListener: function(cb) {
        this.removeListener(CHANGE_EVENT, cb);
    },

    setData: function(data) {
        assign(_user, data);
    },
    
    getInfo: function() {
        return _user;
    },

    id: function() {
        return _user.id;
    },

    dispatcherIndex: Dispatcher.register(function(payload) {
        var action = payload.action;
        switch(action.actionType) {
            case Constants.user.ADD:
                _add(payload.action.user);
                break;
            case Constants.user.LOGIN:
                _login(payload.action.user);
                break;
        }

        User.emitChange();

        return true;
    })
});

module.exports = User;