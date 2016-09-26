#!/usr/bin/env node
'use strict'

var path = require('path')
var git = require('git-state')
var Table = require('cli-table')
var chalk = require('chalk')
var queue = require('queuealot')(done)
var columnify = require('columnify')
var pkg = require('./package')
var scan = require('./lib/scan')

var argv = require('minimist')(process.argv.slice(2))
var dirs = argv._.length ? argv._ : [process.cwd()]

if (argv.version || argv.v) {
  version()
  process.exit()
}

if (argv.help || argv.h) {
  help()
  process.exit()
}

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
    '  --coloured, -c coloured output\n' +
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
  } if (argv.coloured || argv.c) {
    var table = new Table({
      head: [
        chalk.cyan('Directory'),
        chalk.cyan('Branch'),
        chalk.cyan('Ahead'),
        chalk.cyan('Dirty'),
        chalk.cyan('Untracked')
      ]
    })

    results.map(function (result) {

      var method = result.dirty == 0
        ? result.ahead == 0
          ? result.untracked == 0
            ? chalk.grey
            : chalk.yellow
          : chalk.green
        : chalk.red
      table.push([
        method(result.dir),
        method(result.branch),
        method(result.ahead),
        method(result.dirty),
        method(result.untracked)
      ])
    })
    results = table.toString()
  } else {
    results = columnify(results, { columns: ['dir', 'branch', 'ahead', 'dirty', 'untracked'] })
  }

  console.log(results)
}
