#!/usr/bin/env node
'use strict'

var queue = require('queue-async')(1)
var columnify = require('columnify')
var pkg = require('./package')
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
  .forEach(function (result) {
    result.repos.forEach(function (repo) {
      queue.defer(git.check, result.cwd, repo)
    })
  })

queue.awaitAll(function (err, results) {
  if (err) throw err
  outputResults(results)
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

function outputResults (results) {
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
