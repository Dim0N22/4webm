var gulp = require('gulp');
var gutil = require('gulp-util');
var using = require('gulp-using');
var sourcemaps = require('gulp-sourcemaps');
var filesize = require('gulp-size');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');


var destBuild = './public/build/';

gulp.task('js', function () {
    gulp.src(['./public/**/*.js', '!./public/vendors/**', '!./public/build/**'])
        .pipe(using({}))
        .pipe(sourcemaps.init())
        .pipe(concat('app.js'))
        .pipe(gutil.env.type === 'production' ? uglify() : gutil.noop())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(destBuild))
        .pipe(filesize({showFiles: true}))
        .on('error', gutil.log);

});

gulp.task('vendor_js', function () {
    return gulp.src([
        './public/vendors/js/jquery-2.1.4.min.js',
        './public/vendors/js/bootstrap.min.js',
        './public/vendors/js/js.cookie-2.0.3.min.js',
        './public/vendors/js/mousetrap.min.js'
    ]) // jquery must be first
        .pipe(using({}))
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(concat('vendor.js'))
        .pipe(gutil.env.type === 'production' ? uglify() : gutil.noop())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(destBuild))
        .pipe(filesize({showFiles: true}))
        .on('error', gutil.log);
});

gulp.task('default', ['js', 'vendor_js']);