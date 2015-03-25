var path = require("path");
var fs = require("fs");

var MongoClient = require("mongodb").MongoClient;

var targetDb = process.argv[2]
var collection = process.argv[3];
var jsonLocation = path.join(process.cwd(), process.argv[4]);
var path = process.argv[5]

var url = "mongodb://localhost:27017/" + targetDb;

var data = JSON.parse(fs.readFileSync(jsonLocation).toString());

if (path) data = data[path];

if (!Array.isArray(data)) {
  throw new Error("Data should be an array");
}

data.forEach(function (d) { delete d._id });

console.log(collection);

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  db.collection(collection).insert(data, function (err, result) {
    if (err) throw err;

    console.log(result);

    // console.log("Inserted " + result.ops.length + " records.");
    db.close();
  });
});