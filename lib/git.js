'use strict'

var os = require('os')
var path = require('path')
var exec = require('child_process').exec
var afterAll = require('after-all-results')
var debug = require('./debug')

exports.check = function (cwd, dir, cb) {
  debug('processing git project', dir)

  var next = afterAll(function (err, results) {
    if (err) return cb(err)

    var branch = results[0]
    var ahead = results[1]
    var status = results[2]

    cb(null, {
      dir: path.relative(cwd, dir),
      branch: branch,
      ahead: ahead,
      dirty: status.dirty,
      untracked: status.untracked
    })
  })

  branch(dir, next())
  ahead(dir, next())
  status(dir, next())
}

var status = function (cwd, cb) {
  exec('git status -s', { cwd: cwd }, function (err, stdout, stderr) {
    if (err) return cb(err)
    var status = { dirty: 0, untracked: 0 }
    stdout.trim().split(os.EOL).forEach(function (file) {
      if (file.substr(0, 2) === '??') status.untracked++
      else status.dirty++
    })
    cb(null, status)
  })
}

var branch = function (cwd, cb) {
  exec('cat .git/HEAD', { cwd: cwd }, function (err, stdout, stderr) {
    if (err) return cb(err)
    stdout = stdout.trim()
    var branch = stdout.indexOf('ref:') === 0 ? stdout.substr(16) : stdout
    cb(null, branch)
  })
}

var ahead = function (cwd, cb) {
  exec('git rev-list HEAD --not --remotes', { cwd: cwd }, function (err, stdout, stderr) {
    if (err) return cb(null, NaN) // depending on the state of the git repo, the command might return non-0 exit code
    stdout = stdout.trim()
    cb(null, !stdout ? 0 : parseInt(stdout.split(os.EOL).length, 10))
  })
}
