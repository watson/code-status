'use strict'

var path = require('path')
var test = require('tape')
var mkdirp = require('mkdirp')
var afterAll = require('after-all-results')
var scan = require('../lib/scan')

test('scan - cwd', function (t) {
  t.deepEqual(scan(process.cwd()), [process.cwd()])
  t.end()
})

test('scan - ./', function (t) {
  t.deepEqual(scan('./'), [process.cwd()])
  t.end()
})

test('scan - .', function (t) {
  t.deepEqual(scan('.'), [process.cwd()])
  t.end()
})

test('scan - test/sandbox', function (t) {
  var next = afterAll(function (err) {
    t.error(err)
    t.deepEqual(scan('test-sandbox'), [
      path.join(process.cwd(), 'test-sandbox', 'p1'),
      path.join(process.cwd(), 'test-sandbox', 'p2')
    ])
    t.end()
  })

  mkdirp(path.join(process.cwd(), 'test-sandbox', 'p1', '.git'), next())
  mkdirp(path.join(process.cwd(), 'test-sandbox', 'p1', 'sub'), next())
  mkdirp(path.join(process.cwd(), 'test-sandbox', 'p2', '.git'), next())
  mkdirp(path.join(process.cwd(), 'test-sandbox', 'p3', 'sub'), next())
  mkdirp(path.join(process.cwd(), 'test-sandbox', '.p4', '.git'), next())
})
