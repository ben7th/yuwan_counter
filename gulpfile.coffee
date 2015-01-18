gulp   = require 'gulp'
util   = require 'gulp-util'
concat = require 'gulp-concat'

smaps  = require 'gulp-sourcemaps'
coffee = require 'gulp-coffee'
sass   = require 'gulp-ruby-sass'
haml   = require 'gulp-ruby-haml'

# 防止编译 coffee 过程中 watch 进程中止
plumber = require("gulp-plumber")

app =
  src:
    js: 'src/js/**/*.coffee'
  dist:
    js: 'dist/js'

gulp.task 'js', ->
  gulp.src app.src.js
    .pipe plumber()
    # .pipe smaps.init()
    .pipe coffee()
    # .pipe smaps.write('../maps')
    .pipe gulp.dest(app.dist.js)

gulp.task 'build', [
  'js'
]

gulp.task 'default', ['build']

gulp.task 'watch', ['build'], ->
  gulp.watch app.src.js, ['js']