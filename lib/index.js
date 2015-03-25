var fs = require("fs");

var assign = require("lodash.assign");
var MongoClient = require("mongodb").MongoClient;

function mongun (config, cb) {

  var defaults = {
    host: "mongodb://localhost",
    port: 27017,
    database: "test",
    collection: null,
    data: null,
  };

  var s = assign({}, defaults, config);

  if (s.collection == null) return cb(Error("Must provide a collection name"))

  var data = s.data;
  var url = s.host + ":" + s.port + "/" + s.database
  
  if (typeof s.preprocess === "function")
    data = data.map(config.preprocess)

  MongoClient.connect(url, function (err, db) {
    if (err) return cb(err);
    db.collection(s.collection).insert(data, function (err, result) {
      if (err) return cb(err);
      db.close();
      cb(null, result);
    });
  });
}

module.exports = mongun;