#!/usr/bin/env node
'use strict'

var path = require('path')
var git = require('git-state')
var queue = require('queuealot')(done)
var columnify = require('columnify')
var pkg = require('./package')
var scan = require('./lib/scan')

var argv = require('minimist')(process.argv.slice(2))
var dirs = argv._.length ? argv._ : [process.cwd()]

if (argv.version || argv.v) return version()
if (argv.help || argv.h) return help()

dirs
  .map(function (dir) {
    return { cwd: dir, repos: scan(dir) }
  })
  .forEach(function (dir) {
    dir.repos.forEach(function (repo) {
      queue(function (cb) {
        git.check(repo, function (err, result) {
          if (err) return cb(err)
          result.dir = path.relative(dir.cwd, repo)
          cb(null, result)
        })
      })
    })
  })

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

function done (err, results) {
  if (err) throw err

  results = results.filter(function (result) { return result.issues })

  if (argv.simple) {
    results = results.map(function (result) {
      return Object.keys(result).map(function (key) { return result[key] })
    }).join('\n')
  } else {
    results = columnify(results, { columns: ['dir', 'branch', 'ahead', 'dirty', 'untracked'] })
  }

  console.log(results)
}
