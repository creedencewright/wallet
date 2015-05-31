var Type    = require('../models/types');
var Entry   = require('../models/data');
var User    = require('../models/user');
var async   = require('async');
var moment  = require('moment');
var _       = require('underscore');

module.exports = function(app, passport) {

    /* GET home page. */
    app.get('/', function(req, res) {
        var data = {
            logged: req.isAuthenticated() ? 1 : 0
        }

        if (req.isAuthenticated()) {
            res.redirect('/home');
        } else {
            res.render('index', data);
        }
    });

    /* GET home page. */
    app.get('/home', isLoggedIn, function(req, res) {
        Type.find().lean().exec(function(err, types){
            var data = {
                logged: req.user.id,
                balance: req.user.balance,
                savings: req.user.savings,
                name: req.user.local.email,
                types: JSON.stringify(types)
            };

            res.render('index', data);
        });
    });

    //Login / Register
    app.get('/login', function(req, res) {
        res.redirect('/');
    });
    app.get('/register', function(req, res) {
        res.redirect('/');
    });
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    app.post('/register', passport.authenticate('local-signup', {
        successRedirect: '/home', // redirect to the secure profile section
        failureRedirect: '/', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/home', // redirect to the secure profile section
        failureRedirect : '/', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    app.post('/fetch-entries/', function(req, res) {
        Entry.find({"type": req.body.type, "time": {$gt: req.body.start, $lt: req.body.end}}).limit(req.body.limit).sort({"time":-1}).exec(function(err,data) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
        });

    });

    app.post('/fetch-all/', function(req, res) {
        Entry
            .find({
                "userId": req.user.id,
                "time": {$gt: moment().startOf('month').unix(), $lt: moment().endOf('month').unix()}
            })
            .sort({"time":-1})
            .exec(function(err, data) {
                var grouped = _.groupBy(data, function(entry) { return entry.type });
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(grouped));
            });
    });

    app.post('/fetch/', function(req, res) {
        var timeStart = moment(),
            timeEnd = moment();

        timeStart
            .set('year', parseInt(req.body.year))
            .set('month', parseInt(req.body.month))
            .set('date', 1)
            .set('hour', 0)
            .set('minutes', 0)
            .set('seconds', 0);

        timeEnd
            .set('year', parseInt(req.body.year))
            .set('month', parseInt(req.body.month))
            .set('date', timeStart.daysInMonth())
            .set('hour', 23)
            .set('minutes', 59)
            .set('seconds', 59);

        var timeFilter = {$gte: timeStart.unix(), $lte: timeEnd.unix()};
        console.log(timeFilter)

        Entry
            .find({
                "userId": req.user.id,
                "time": timeFilter
            })
            .sort({"time":-1})
            .exec(function(err, data) {
                var grouped = _.groupBy(data, function(entry) { return entry.type });
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(grouped));
            });
    });

    app.post('/add-entry', function(req, res) {
        async.parallel({
                entry: function(cb) {
                    Entry.create(req.body, cb)
                },
                user: function(cb) {
                    var id = req.body.userId;
                    User.findOneAndUpdate({"id": id}, {"balance": req.body.balance, "savings": req.body.savings}, {}, function(e, d) {
                        cb(e, d);
                    });
                }
            },
            function(err, result) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(result));
            }
        );
    });
    app.post('/add-savings', function(req, res) {
        async.parallel({
                entry: function(cb) {
                    Entry.create(req.body, cb)
                },
                user: function(cb) {
                    var id = req.body.userId;
                    User.findOneAndUpdate({"id": id}, {"balance": req.body.balance, "savings": req.body.savings}, {}, function(e, d) {
                        cb(e, d);
                    });
                }
            },
            function(err, result) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(result));
            }
        );
    });

    app.post('/remove-entry/', function(req, res) {
        console.log(req.body);
        async.parallel({
                entry: function(cb) {
                    Entry.remove({"id": req.body.id}, cb);
                },
                user: function(cb) {
                    User.findOneAndUpdate({"id": req.body.userId}, {"balance": req.body.balance, "savings": req.body.savings}, {}, function(e, d) {
                        cb(e, d);
                    });
                }
            },
            function(err, result) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(result));
            }
        )
    });

    //404
    app.get('/404', function(req, res) {
        res.render('404');
    });
}

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()) {
        return next();
    }

    // if they aren't redirect them to the home page
    res.redirect('/');
}