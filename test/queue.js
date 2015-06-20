'use strict'

var test = require('tape')
var Queue = require('../lib/queue')

test('no jobs', function (t) {
  var called = false
  Queue(function () {
    called = true
  })
  setTimeout(function () {
    t.equal(called, false)
    t.end()
  }, 50)
})

test('2 jobs', function (t) {
  var calls = 0
  var queue = Queue(function (err, results) {
    t.error(err)
    t.equal(calls, 2)
    t.deepEqual(results, ['r12', 'r34'])
    t.end()
  })
  var fn1 = function (a, b, cb) {
    t.equal(calls, 0)
    t.equal(a, 1)
    t.equal(b, 2)
    calls++
    cb(null, 'r' + a + b)
  }
  var fn2 = function (a, b, cb) {
    t.equal(calls, 1)
    t.equal(a, 3)
    t.equal(b, 4)
    calls++
    cb(null, 'r' + a + b)
  }
  queue(fn1, [1, 2])
  queue(fn2, [3, 4])
})

test('callback', function (t) {
  var queue = Queue(function (err, results) {
    t.error(err)
    t.deepEqual(results, ['r12foo', 'r34'])
    t.end()
  })
  var fn1 = function (a, b, cb) {
    cb(null, 'r' + a + b)
  }
  var fn2 = function (a, b, cb) {
    cb(null, 'r' + a + b)
  }
  queue(fn1, [1, 2], function (err, result) {
    t.error(err)
    t.equal(result, 'r12')
    return result + 'foo'
  })
  queue(fn2, [3, 4])
})

test('callback - error', function (t) {
  var queue = Queue(function (err, results) {
    t.equal(err, 'error')
    t.deepEqual(results, ['r12foo'])
    t.end()
  })
  var fn1 = function (a, b, cb) {
    cb('error', 'r' + a + b)
  }
  var fn2 = function (a, b, cb) {
    cb(null, 'r' + a + b)
  }
  queue(fn1, [1, 2], function (err, result) {
    t.equal(err, 'error')
    t.equal(result, 'r12')
    return result + 'foo'
  })
  queue(fn2, [3, 4])
})

test('error - no callback', function (t) {
  var calls = 0
  var queue = Queue(function (err, results) {
    t.equal(err, 'error')
    t.equal(calls, 1)
    t.deepEqual(results, ['r12'])
    t.end()
  })
  var fn1 = function (a, b, cb) {
    calls++
    cb('error', 'r' + a + b)
  }
  var fn2 = function (a, b, cb) {
    calls++
    cb(null, 'r' + a + b)
  }
  queue(fn1, [1, 2])
  queue(fn2, [3, 4])
})

test('error - with callback', function (t) {
  var calls = 0
  var queue = Queue(function (err, results) {
    t.equal(err, 'error')
    t.equal(calls, 1)
    t.deepEqual(results, ['r12foo'])
    t.end()
  })
  var fn1 = function (a, b, cb) {
    calls++
    cb('error', 'r' + a + b)
  }
  var fn2 = function (a, b, cb) {
    calls++
    cb(null, 'r' + a + b)
  }
  queue(fn1, [1, 2], function (err, result) {
    t.equal(err, 'error')
    t.equal(result, 'r12')
    return result + 'foo'
  })
  queue(fn2, [3, 4])
})
