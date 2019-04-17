"use strict";

// neo4j cypher helper module
var env = process.env.NODE_ENV || 'development';
var config = require('../config/config')[env];
var neo4j = require('neo4j-driver').v1;

var driver = neo4j.driver(config.neo4j, neo4j.auth.basic(config.username, config.password));


exports.getSession = function (context) {
  if (context.neo4jSession) {
    return context.neo4jSession;
  } else {
    context.neo4jSession = driver.session();
    return context.neo4jSession;
  }
};

exports.dbWhere = function (name, keys) {
  if (_.isArray(name)) {
    _.map(name, (obj) => {
      return _whereTemplate(obj.name, obj.key, obj.paramKey);
    });
  } else if (keys && keys.length) {
    return 'WHERE ' + _.map(keys, (key) => {
      return _whereTemplate(name, key);
    }).join(' AND ');
  }
};

exports.getCurrentDate = function () {
  var value = new Date();
  return new neo4j.types.DateTime(
    value.getUTCFullYear(),
    value.getUTCMonth() + 1, //because neo4j DateTime.months start from 1 instead of 0.
    value.getUTCDate(),
    value.getUTCHours(),
    value.getUTCMinutes(),
    value.getUTCSeconds(),
    value.getUTCMilliseconds() * 1000000,
    value.getTimezoneOffset() * 60
  );
}

function whereTemplate(name, key, paramKey) {
  return name + '.' + key + '={' + (paramKey || key) + '}';
}