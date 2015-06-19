#!/usr/bin/env node
'use strict'

var os = require('os')
var fs = require('fs')
var path = require('path')
var queue = require('queue-async')(1)
var exec = require('child_process').exec
var debug = require('debug')('git-status')
var columnify = require('columnify')
var afterAll = require('after-all-results')
var filter = require('patterns')([/^\./, /\/\./])
var pkg = require('./package')

var argv = require('minimist')(process.argv.slice(2))
var dirs = argv._.length ? argv._ : [process.cwd()]

if (argv.version || argv.v) return version()
if (argv.help || argv.h) return help()

function version () {
  console.log(pkg.version)
  process.exit()
}

function help () {
  console.log(
    pkg.name + ' ' + pkg.version + '\n' +
    pkg.description + '\n\n' +
    'Usage:\n' +
    '  ' + pkg.name + ' [options] [paths]\n\n' +
    'The paths defaults to the current direcotry if not specified.\n\n' +
    'Options:\n' +
    '  --help, -h     show this help\n' +
    '  --version, -v  show version\n' +
    '  --simple       make the output more simple for easy grepping'
  )
  process.exit()
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

var outputResults = function (results) {
  results = results.filter(function (result) {
    return result.branch !== 'master' ||
           result.ahead || Number.isNaN(result.ahead) ||
           result.dirty || result.untracked
  })

  if (argv.simple) {
    results = results.map(function (result) {
      return Object.keys(result).map(function (key) { return result[key] })
    }).join('\n')
  } else {
    results = columnify(results)
  }

  console.log(results)
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

var processGitDir = function (cwd, dir, cb) {
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

var processDir = function (cwd, dir) {
  if (!dir) dir = cwd
  dir = path.resolve(dir)

  if (filter.match(dir)) return debug('skipping filtered directory', dir)
  else debug('searching directory', dir)

  var content = fs.readdirSync(dir)

  if (~content.indexOf('.git')) queue.defer(processGitDir, cwd, dir)
  else content.map(joinWith(dir)).filter(isDir).forEach(processDir.bind(null, cwd))
}

dirs.forEach(function (dir) {
  processDir(dir)
})

queue.awaitAll(function (err, results) {
  if (err) throw err
  outputResults(results)
})
