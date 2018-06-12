const config = require('./config')
const path = require('path')
const gulp = require('gulp')
const htmlmin = require('gulp-htmlmin')
const gulpif = require('gulp-if')
const plumber = require('gulp-plumber')
const notify = require('gulp-notify')
const fuleinclude = require('gulp-file-include')
const del = require('del')
const chalk = require('chalk')
const gulpSequence = require('gulp-sequence')
const uglify = require('gulp-uglify')
const stylus = require('gulp-stylus')
const sass = require('gulp-sass')
const less = require('gulp-less')
const postcss = require('gulp-postcss')
const cleanCss = require('gulp-clean-css')
const babel = require('gulp-babel')

const isProduction = process.env.NODE_ENV === 'production'
const sourceMap = {
  stylus,
  sass,
  less
}

const webpack = require('webpack')
const webpackStream = require('webpack-stream')
const webpackConfig = require('./webpack.config.js')

function onErr(err) {
  const title = err.plugin + ' ' + err.name
  const msg = err.message
  const errContent = msg.replace(/\n/g, '\\A ')
  notify.onError({
    title,
    message: errContent,
    sound: true
  })(err)
  this.emit('end')
}

function runTasks(tasks) {
  return new Promise((resolve, reject) => {
    del(path.join(__dirname, './', 'dist'))
      .then(_ => {
        console.log(
          chalk.green(`
          =========================
          Tasks Clean Done
          =========================
          `)
        )
        gulpSequence(tasks, () => {
          console.log(
            chalk.green(`
              =======================
              Mission Completed!
              =======================
            `)
          )
          resolve('completed')
        })
      })
      .catch(e => {})
  })
}

gulp.task('scripts', function(callback) {
  return gulp
    .src(config.dev.scripts)
    .pipe(plumber(onErr))
    .pipe(
      gulpif(
        isProduction,
        babel({
          presets: ['env']
        })
      )
    )
    .pipe(gulpif(config.useWebpack, webpackStream(webpackConfig, webpack)))
    .pipe(gulpif(isProduction, uglify()))
    .pipe(gulp.dest(config.build.scripts))
})

gulp.task('html', _ => {
  return gulp
    .src(config.dev.html)
    .pipe(plumber(onErr))
    .pipe(
      fuleinclude({
        prefix: '@@',
        basepath: path.join(__dirname, './', 'src/include/')
      })
    )
    .pipe(
      gulpif(
        isProduction,
        htmlmin({
          removeComments: true,
          collapseWhitespace: true,
          minifyJS: true,
          minifyCSS: true
        })
      )
    )
    .pipe(gulp.dest(config.build.html))
})

Object.keys(sourceMap).forEach(key => {
  let fn = sourceMap[key]
  gulp.task(key, _ => {
    return gulp
      .src(config.dev.styles[key])
      .pipe(plumber(onErr))
      .pipe(fn())
      .pipe(gulpif(isProduction, cleanCss({ debug: true })))
      .pipe(postcss('./.postcssrc.js'))
      .pipe(gulp.dest(config.build.styles))
  })
})

gulp.task('styles', _ => {
  const tasks = ['stylus', 'sass', 'less']
  runTasks(tasks).then(() => {
    console.log(chalk.cyan('styles compiled.\n'))
  })
})

gulp.task('static', () => {
  return gulp.src(config.dev.static).pipe(gulp.dest(config.build.static))
})

gulp.task('clean', () => {
  del('./dist').then(paths => {
    console.log('Deleted files and folders:\n', paths.join('\n'))
  })
})

gulp.task('build', _ => {
  const tasks = ['html', 'static']
  runTasks(tasks).then(res => {
    console.log(res)
    console.log(
      chalk.cyan(`
      =======================
      Build Completed.
      =======================
    `)
    )
  })
})

gulp.task('default', () => {
  console.log(
    chalk.green(
      `
  Build Setup
    开发环境： npm run dev
    生产环境： npm run build
    执行压缩： gulp zip
    编译页面： gulp html
    编译脚本： gulp script
    编译样式： gulp styles
    语法检测： gulp eslint
    压缩图片： gulp images
    `
    )
  )
})
