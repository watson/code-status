'use strict'

var path = require('path')
var test = require('tape')
var git = require('../lib/git')

test('#check()', function (t) {
  var dir = process.cwd()
  git.check(dir, function (err, result) {
    t.error(err)
    t.deepEqual(Object.keys(result), ['branch', 'ahead', 'dirty', 'untracked'])
    t.equal(typeof result.branch, 'string')
    t.equal(typeof result.ahead, 'number')
    t.equal(typeof result.dirty, 'number')
    t.equal(typeof result.untracked, 'number')
    t.end()
  })
})
