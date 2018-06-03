const config = require('./config')
const path = require('path')
const gulp = require('gulp')
const htmlmin = require('gulp-htmlmin')
const gulpif = require('gulp-if')
const plumber = require('gulp-plumber')
const fuleinclude = require('gulp-file-include')
const del = require('del')
const chalk = require('chalk')
const gulpSequence = require('gulp-sequence')
const stylus = require('gulp-stylus')
const postcss = require('gulp-postcss')
const cleanCss = require('gulp-clean-css')

const isProduction = process.env.NODE_ENV === 'production'

function resolve1(dir) {
  return path.join(__dirname, '', dir)
}

function onErr(err) {
  console.log(1)
  console.log(err)
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

gulp.task('html', _ => {
  return gulp
    .src([resolve1('/**/*.html'), '!/src/include/**/*'])
    .pipe(plumber(onErr))
    .pipe(
      fuleinclude({
        prefix: '@@',
        basepath: resolve1('src/include/')
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
    .pipe(gulp.dest(resolve1('dist')))
})

gulp.task('styles', _ => {
  return gulp
    .src(config.dev.styles)
    .pipe(plumber(onErr))
    .pipe(stylus())
    .pipe(gulpif(isProduction, cleanCss({ debug: true })))
    .pipe(postcss('./.postcssrc.js'))
    .pipe(gulp.dest(config.build.styles))
})

gulp.task('static', () => {
  return gulp.src('./static/**/*').pipe(gulp.dest(resolve1('dist/static')))
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
