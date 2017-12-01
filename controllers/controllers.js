// var login = require("../models/login.js");

router.put("/api/login/:username", function(req, res) {
    var condition = "username = " + req.params.username;
  
    console.log("condition", condition);
  
    login.confirm({
      password: req.body.password
    }, condition, function(result) {
      if (result.changedRows == 0) {
        // If no rows were changed, then the ID must not exist, so 404
        return res.status(404).end();
      } else {
        res.status(200).end();
      }
    });
  });