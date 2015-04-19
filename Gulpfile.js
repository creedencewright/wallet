var browserify  = require('browserify');
var gulp        = require('gulp');
var source      = require("vinyl-source-stream");
var reactify    = require('reactify');
var reload      = require('gulp-livereload');
var less        = require('gulp-less');
var notify      = require('gulp-notify');
var plumber     = require('gulp-plumber');
var minifycss   = require('gulp-minify-css');
var gaze        = require('gaze');

gulp.task('browserify', function(){
    var b = browserify();
    b.transform(reactify);
    b.add('./public/javascripts/main.js');
    return b.bundle()
        .on('error', notify.onError(function(err){
            return err.toString()
        }))
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('./public/javascripts/'))
        .pipe(reload());
});

gulp.task('less', function() {
    var path = './public/stylesheets/';
    gulp.src(path + "style.less")
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(less())
        .pipe(minifycss())
        .pipe(gulp.dest(path))
        .pipe(reload());
});

gulp.task('watch', ['browserify', 'less'], function() {
    gaze(['./public/javascripts/**/*.js', '!./public/javascripts/bundle.js'], function() {
        this.on('added', function() {
            gulp.start('browserify');
        });
        this.on('changed', function() {
            gulp.start('browserify');
        })
    });

    gaze('./public/stylesheets/**/*.less', function() {
        this.on('added', function() {
            gulp.start('less');
        });
        this.on('changed', function() {
            gulp.start('less');
        })
    });

    reload.listen();
});

gulp.task('default', ['watch']);
