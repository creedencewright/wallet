var express     = require('express');
var router      = express.Router();
var UserModel   = require('../models/User');
var moment      = require('moment');
var passport    = require('passport');

/* GET home page. */
router.post('/up/', function(req, res, next) {
    var email       = req.body.email,
        password    = req.body.password,
        id          = moment().unix();

    var user = new UserModel({
        username: email,
        password: password,
        id: parseInt(id)
    });

    user.save(function(err, data) {
        if (err) {
            console.log(err);
        } else {
            res.json(data)
        }
    })
});

router.post('/in/', function(req, res, next) {
    passport.authenticate('local',
        function(err, user, info) {
            return err
                ? next(err)
                : user
                ? req.logIn(user, function(err) {
                    if (err) {
                        return err
                    } else {
                        res.json(user)
                    }
            })
                : res.redirect('/404');
        }
    )(req, res, next);
});

module.exports = router;
