'use strict'

module.exports = function (done) {
  var queue = []
  var results = []

  var next = function () {
    var job = queue.shift()

    if (!job) return done(null, results)

    var fn = job[0]
    var args = job[1] || []
    var cb = job[2]

    args = args.concat(function (err, result) {
      if (cb) result = cb(err, result)
      results.push(result)
      if (err) return done(err, results)
      next()
    })

    fn.apply(null, args)
  }

  return function (fn, args, cb) {
    if (!queue.length) process.nextTick(next)
    queue.push([fn, args, cb])
  }
}
