const fs = require('fs')
const path = require('path')

function exists(path) {
  return fs.existsSync(path) || path.existsSync(path)
}

function isDir(path) {
  return exists(path) && fs.statSync(path).isDirectory()
}

function getFiles(dir) {
  try {
    return fs.readdirSync(dir)
  } catch (e) {
    return []
  }
}

export function getAllDirs(dir) {
  const all = getFiles(dir)
  return all.reduce((dirs, next) => {
    if (isDir(path.join(dir, next))) {
      dirs.push(next)
    }
    return dirs
  }, [])
}

export function walkParallel(dir, done) {
  let results = []
  fs.readdir(dir, (err, list) => {
    if (err) return done(err)
    let pending = list.length
    if (!pending) return done(null, results)
    list.forEach(file => {
      file = path.resolve(dir, file)
      fs.stat(file, (err, stat) => {
        if (stat && stat.isDirectory()) {
          walkParallel(file, (err, res) => {
            results = results.concat(res)
            if (!--pending) done(null, results)
          })
        } else {
          results.push(file)
          if (!--pending) done(null, results)
        }
      })
    })
  })
}

export function walkSerial(dir, done) {
  let results = []
  fs.readdir(dir, (err, list) => {
    if (err) return done(err)
    let i = 0
    ;(function next() {
      let file = list[i++]
      if (!file) return done(null, results)
      file = dir + '/' + file
      fs.stat(file, (err, stat) => {
        if (stat && stat.isDirectory()) {
          walkSerial(file, (err, res) => {
            results = results.concat(res)
            next()
          })
        } else {
          results.push(file)
          next()
        }
      })
    })()
  })
}
