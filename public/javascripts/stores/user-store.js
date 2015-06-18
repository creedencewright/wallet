const Dispatcher   = require('../dispatchers/app-dispatcher');
const Constants    = require('../constants/app-constants');
const assign          = require('object-assign');
const EventEmitter    = require('events').EventEmitter;
const _               = require('underscore');
const reqwest         = require('reqwest');

const CHANGE_EVENT = 'change';

let _user = {
    id: false,
    name: ''
}

function _getLang() {
    return _user.lang;
}

const User = assign(EventEmitter.prototype, {
    emitChange() {
        this.emit(CHANGE_EVENT);
    },

    addChangeListener(cb) {
        this.on(CHANGE_EVENT, cb);
    },

    removeChangeListener(cb) {
        this.removeListener(CHANGE_EVENT, cb);
    },

    setData(data) {
        assign(_user, data);
    },
    
    getInfo() {
        return _user;
    },

    isEn() {
        return _getLang() === 'en'
    },

    id() {
        return _user.id;
    },

    dispatcherIndex: Dispatcher.register(function(payload) {
        var action = payload.action;
        switch(action.actionType) {

        }

        User.emitChange();

        return true;
    })
});

module.exports = User;