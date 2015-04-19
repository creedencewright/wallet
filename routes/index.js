var express = require('express');
var router  = express.Router();
var UserModel = require('../models/User');

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.isAuthenticated());
  console.log(req.user);
  var data = {
    logged: req.isAuthenticated() ? 1 : 0
  }

  res.render('index', data);
});

module.exports = router;
