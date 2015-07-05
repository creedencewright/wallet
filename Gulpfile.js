var browserify  = require('browserify');
var gulp        = require('gulp');
var source      = require("vinyl-source-stream");
var reactify    = require('reactify');
var merge       = require('merge-stream');
var reload      = require('gulp-livereload');
var less        = require('gulp-less');
var notify      = require('gulp-notify');
var plumber     = require('gulp-plumber');
var minifycss   = require('gulp-minify-css');
var gaze        = require('gaze');
var babelify    = require('babelify');
var prefix      = require('gulp-autoprefixer');
var sprite      = require('gulp.spritesmith');
var watch       = require('gulp-watch');
var purify      = require('gulp-purifycss');

gulp.task('browserify', function(){
    var b = browserify();
    b.transform(babelify);
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

gulp.task('sprite', function () {
    var spriteData = gulp.src('./public/images/sprite/*').pipe(sprite({
        imgName: 'sprite.png',
        padding: 2,
        imgPath: "./../images/sprite.png",
        cssName: 'sprite.less'
    }));

    var imgStream = spriteData.img
        //.pipe(imagemin())
        .pipe(gulp.dest('./public/images/'));

    var cssStream = spriteData.css
        .pipe(gulp.dest('./public/stylesheets/'));

    return merge(imgStream, cssStream);
});

gulp.task('less', function() {
    var path = './public/stylesheets/';
    gulp.src(path + "style.less")
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(less())
        .pipe(prefix(['last 2 versions']))
        .pipe(purify(['./public/javascripts/bundle.js', './views/**/*.jade']))
        .pipe(minifycss())
        .pipe(gulp.dest(path))
        .pipe(reload());
});

gulp.task('watch', ['browserify', 'less', 'sprite'], function() {
    gaze('public/images/sprite/*.png', function() {
        this.on('added', function() {
            gulp.start('sprite');
        });
        this.on('changed', function() {
            gulp.start('sprite');
        });
        this.on('deleted', function() {
            gulp.start('sprite');
        });
    });

    gaze(['public/javascripts/**/*.js', '!public/javascripts/bundle.js'], function() {
        this.on('added', function() {
            gulp.start('browserify');
        });
        this.on('changed', function() {
            gulp.start('browserify');
        })
    });

    gaze('public/stylesheets/**/*.less', function() {
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
