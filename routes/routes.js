var Type = require('../models/types');
var User = require('../models/user');
var async = require('async');
var moment = require('moment');
var _ = require('underscore');
var passport = require('passport');
var mongoose = require('mongoose');
var Entry = require('../models/data')(mongoose);

module.exports = function(app) {

    //==== TYPES ====
    app.post('/types/fetch', function(req, res) {
        Type.find({}, function(err, types) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(types));
        });
    });
    //==== TYPES ====

    /* GET home page. */
    app.get('/', function(req, res) {
        //var types = [
        //    {
        //        name: {
        //            ru: "Транспорт",
        //            en: "Transport"
        //        },
        //        code: 'transport',
        //        type: 'expense'
        //    }
        //];
        //_.each(types, function(type) {
        //    Type.create(type);
        //})
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
        var data = {
            logged: req.user.id,
            balance: req.user.balance,
            savings: req.user.savings,
            lang: req.user.lang,
            name: req.user.local.username
        };

        res.render('index', data);
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

    app.post('/register', function(req, res, next) {
        passport.authenticate('local-signup', function(err, user, info) {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.json({success: false, error: 'user'});
            }

            req.login(user, function(err) {
                if (err) return next(err);
                return res.json({success: true, id: user.id});
            });

        })(req, res, next);
    });

    app.post('/login', function(req, res, next) {
        passport.authenticate('local-login', function(err, user, info) {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.json({success: false, error: 'user'});
            }

            req.login(user, function(err) {
                if (err) return next(err);
                return res.json({success: true, id: user.id});
            });

        })(req, res, next);
    });

    app.post('/fetch-entries/', function(req, res) {
        Entry.find({
            "type": req.body.type,
            "time": {$gt: req.body.start, $lt: req.body.end}
        }).limit(req.body.limit).sort({"time": -1}).exec(function(err, data) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
        });

    });

    app.post('/fetch-all/', function(req, res) {
        Entry
            .find({
                "userId": req.body.userId,
                "time": {$gt: moment().startOf('month').unix(), $lt: moment().endOf('month').unix()}
            })
            .sort({"time": -1})
            .exec(function(err, data) {
                var grouped = _.groupBy(data, function(entry) {
                    return entry.type
                });
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

        Entry
            .find({
                "userId": req.body.userId,
                "time": timeFilter
            })
            .sort({"time": -1})
            .exec(function(err, data) {
                var grouped = _.groupBy(data, function(entry) {
                    return entry.type
                });
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(grouped));
            });
    });

    app.post('/add-entry', function(req, res) {
        var data = JSON.parse(req.body.data);

        async.parallel({
                entry: function(cb) {
                    Entry.create(data, cb)
                },
                user: function(cb) {
                    var id = data.userId;
                    User.findOneAndUpdate({"id": id}, {
                        "balance": data.balance,
                        "savings": data.savings
                    }, {}, function(e, d) {
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

    app.post('/balance/update', function(req, res) {
        var id = req.body.userId;
        User.findOneAndUpdate({"id": id}, {"balance": req.body.value}, {}, function(err, data) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
        });
    });

    app.post('/savings/update', function(req, res) {
        var id = req.body.userId;
        User.findOneAndUpdate({"id": id}, {"savings": req.body.value}, {}, function(err, data) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
        });
    })

    app.post('/update-entry', function(req, res) {
        var data = JSON.parse(req.body.data);

        async.parallel({
                entry: function(cb) {
                    Entry.update({"id": data.id}, data, {}, cb)
                },
                user: function(cb) {
                    var id = data.userId;
                    User.findOneAndUpdate({"id": id}, {
                        "balance": data.balance,
                        "savings": data.savings
                    }, {}, function(e, d) {
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
                    User.findOneAndUpdate({"id": req.body.userId}, {
                        "balance": req.body.balance,
                        "savings": req.body.savings
                    }, {}, function(e, d) {
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

function _getUpdateUserFields(user, type, value, category) {
    category = category ? category : false;

    var balance = parseInt(user.balance);
    var savings = parseInt(user.savings);

    if (type === 'expense') {
        balance -= value;
    } else {
        balance += value;

        if (category === 'savings') {
            savings -= value;
        }
    }

    return {balance: balance, savings: savings};
}