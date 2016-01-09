'use strict'

var fs = require('fs')
var path = require('path')
var filter = require('patterns')([/^\./, /\/\./])

module.exports = function (dir) {
  dir = path.resolve(dir)

  if (filter.match(dir)) return []

  var content = fs.readdirSync(dir)

  if (~content.indexOf('.git')) return [dir]

  return content.map(joinPathWith(dir)).filter(isDir).reduce(function (result, dir) {
    var stat = fs.lstatSync(dir)
    if (stat.isSymbolicLink()) return result
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
