'use strict'

var fs = require('fs')
var path = require('path')
var filter = require('patterns')([/^\./, /\/\./])
var debug = require('./debug')

module.exports = function (dir) {
  dir = path.resolve(dir)

  if (filter.match(dir)) {
    debug('skipping filtered directory', dir)
    return []
  } else {
    debug('searching directory', dir)
  }

  var content = fs.readdirSync(dir)

  if (~content.indexOf('.git')) return [dir]

  return content.map(joinPathWith(dir)).filter(isDir).reduce(function (result, dir) {
    return result.concat(module.exports(dir))
  }, [])
}

var isDir = function (path) {
  try {
    return fs.statSync(path).isDirectory()
  } catch (e) {
    return false
  }
}

var joinPathWith = function (a) {
  return function (b) {
    return path.join(a, b)
  }
}
