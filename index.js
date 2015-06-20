#!/usr/bin/env node
'use strict'

var path = require('path')
var columnify = require('columnify')
var pkg = require('./package')
var queue = require('./lib/queue')(done)
var scan = require('./lib/scan')
var git = require('./lib/git')

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
      queue(git.check, [repo], function (err, result) {
        if (err) return
        result.dir = path.relative(dir.cwd, repo)
        return result
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
    results = columnify(results, { columns: ['dir', 'branch', 'ahead', 'dirty', 'untracked'] })
  }

  console.log(results)
}
