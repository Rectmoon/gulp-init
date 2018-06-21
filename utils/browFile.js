const fs = require('fs')
const gutil = require('gulp-util')
const browserify = require('browserify')
const through = require('through2')
module.exports = browFile

function browFile() {
  return through.obj((chunk, enc, cb) => {
    if (chunk.isNull()) return cb(null, chunk)
    if (chunk.isStream()) {
      this.emit(
        'error',
        new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported')
      )
      return cb()
    }
    const fileContents = fs.readFileSync(chunk.path)
    try {
      browserify(chunk.path).bundle((err, res) => {
        if (err) {
          console.log('语法错误，取消browserify: ' + err)
          chunk.contents = Buffer.from(fileContents)
          return cb(null, chunk)
        }
        chunk.contents = res
        cb(null, chunk)
      })
    } catch (e) {
      console.log('语法错误，取消browserify')
      return callback(null, chunk)
    }
  })
}
