'use strict'

var path = require('path')
var test = require('tape')
var git = require('../lib/git')

test('#check()', function (t) {
  var cwd = path.join(process.cwd(), '..')
  var dir = process.cwd()
  git.check(cwd, dir, function (err, result) {
    t.error(err)
    t.deepEqual(Object.keys(result), ['dir', 'branch', 'ahead', 'dirty', 'untracked'])
    t.equal(result.dir, path.relative(cwd, dir))
    t.equal(typeof result.branch, 'string')
    t.equal(typeof result.ahead, 'number')
    t.equal(typeof result.dirty, 'number')
    t.equal(typeof result.untracked, 'number')
    t.end()
  })
})
