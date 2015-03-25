var expect = require("chai").expect;

var rewire = require("rewire");

var mongun;


function mongoClientStub () {
  var url, collection, data, called;

  var db = {
    close: function () { called = true; },
    collection: function (_collection) {
      collection = _collection;
      return {
        insert: function (_data, cb) {
          data = _data;
          process.nextTick(function () { cb(null); });
        }
      }
    }
  }

  return {
    connect: function (_url, cb) {
      url = _url;
      process.nextTick(function () { cb(null, db); });
    },
    __getCollection: function () { return collection; },
    __getUrl: function () { return url; },
    __getData: function () { return data; },
    __getCalled: function () { return called; }
  }
}

describe("mongun", function () {

  var stub, config;

  beforeEach(function () {
    config = {host: "abc", port: 123, database: "xyz", collection: "blah"};
    stub = mongoClientStub();
    mongun = rewire("../lib");
    mongun.__set__("MongoClient", stub);
  });

  it("requires a collection name", function (done) {
    delete config.collection;
    mongun(config, function (err) {
      expect(err.message).to.equal("Must provide a collection name");
      done();

    });
  });

  it("gets the url right", function (done) {
    mongun(config, function (err) {
      expect(stub.__getUrl()).to.equal("abc:123/xyz");
      done()
    });
  });

  it("allows a preprocessing step", function (done) {
    config.data = [{key: 1}, {key: 2}, {key: 3}];
    config.preprocess = function (item) {
      item.square = item.key * item.key;
      return item;
    };
    mongun(config, function (err) {
      expect(stub.__getData()).to.deep.equal([
        {key: 1, square: 1}, {key: 2, square: 4}, {key: 3, square: 9}
      ]);
      done();
    });
  });

  it("closes the database connection", function (done) {
    mongun(config, function () {
      expect(stub.__getCalled()).to.equal(true);
      done();
    });
  });

});