var Dispatcher  = require('./dispatcher');
var assign      = require('object-assign');

module.exports = assign(Dispatcher.prototype, {
    handleViewAction: function(action) {
        console.log('action', action);
        this.dispatch({
            source: 'VIEW_ACTION',
            action: action
        })
    }
})