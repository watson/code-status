'use strict'

var fs = require('fs')
var path = require('path')
var debug = require('debug')('git-status')
var filter = require('patterns')([/^\./, /\/\./])

module.exports = function (cwd, dir) {
  if (!dir) dir = cwd
  dir = path.resolve(dir)

  if (filter.match(dir)) {
    debug('skipping filtered directory', dir)
    return []
  } else {
    debug('searching directory', dir)
  }

  var content = fs.readdirSync(dir)

  if (~content.indexOf('.git')) return [dir]

  return content.map(joinWith(dir)).filter(isDir).reduce(function (result, dir) {
    return result.concat(module.exports(cwd, dir))
  }, [])
}

var isDir = function (path) {
  try {
    return fs.statSync(path).isDirectory()
  } catch (e) {
    return false
  }
}

var joinWith = function (a) {
  return function (b) {
    return path.join(a, b)
  }
}
