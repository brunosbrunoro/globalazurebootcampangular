var gulp = require('gulp');
var plugins = require('gulp-load-plugins');
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var path = require('path');
var merge = require('merge-stream');
var minifyHtml = require("gulp-minify-html");
var minifyCss = require("gulp-minify-css");
var uglify = require("gulp-uglify");
var ngmin = require('gulp-ngmin');
var concat = require('gulp-concat');
var inject = require('gulp-inject');
var mainBowerFiles = require('gulp-main-bower-files');
var flatten = require('gulp-flatten');
var zip = require('gulp-zip');
var replace = require('gulp-replace');
var debug = require('gulp-debug');
var reload = browserSync.reload;

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('minify-html', function() {
    return gulp.src(['dist/**/*.html'])
        .pipe(minifyHtml())
        .pipe(gulp.dest('dist'));
});

gulp.task('css', function() {
    return gulp.src('app/css/**/*.css')
        .pipe(minifyCss())
        .pipe(concat('style.css'))
        .pipe(gulp.dest('dist/css'));
});

gulp.task('js', function() {

    gulp.src(['app/scripts/**/*.js'])
        .pipe(concat('app.js'))
        .pipe(gulp.dest('dist/scripts'));

    return gulp.src(['app/js/**/*.js'])
        .pipe(concat('script.js'))
        .pipe(gulp.dest('dist/scripts'));

});

gulp.task('copy', function() {
    var app = gulp.src([
        'app/*',
        '!app/images',
        '!app/plugins',
        '!app/styles',
        '!app/scripts',
        '!app/views',
        '!app/js',
        '!app/includes',
        '!app/.buildignore',
        '!app/*.html',
    ], {
        dot: true
    }).pipe(gulp.dest('dist'));

    var bower = gulp.src('./bower.json')
        .pipe(mainBowerFiles())
        .pipe(flatten())
        .pipe(gulp.dest('dist/bower'));

    gulp.src('bower_components/font-awesome/fonts/*')
        .pipe(gulp.dest('dist/fonts/'));

    gulp.src('bower_components/font-awesome/css/font-awesome.css')
        .pipe(gulp.dest('dist/bower/'));

    gulp.src('bower_components/bootstrap/dist/css/bootstrap.css')
        .pipe(gulp.dest('dist/bower/'));

    gulp.src('bower_components/angular-i18n/angular-locale_pt-br.js')
        .pipe(gulp.dest('dist/bower/'));

    gulp.src('bower_components/glyphicons/fonts/*')
        .pipe(gulp.dest('dist/fonts/'));

    return merge(app, bower);
});

gulp.task('copy:html', function() {
    return gulp.src(['app/**/*.html', '!app/index.html']) // path to your files
        .pipe(gulp.dest('dist'));
})

gulp.task('html:inject', function() {

    var target = gulp.src('app/index.html');

    var sources = gulp.src([
        'dist/scripts/**/*.js',
        'dist/css/**/*.css'
    ], { read: false });

    sources.pipe(debug());

    var bower = gulp.src(['dist/bower/jquery.js',
        'dist/bower/jquery.*.js',
        'dist/bower/moment.js',
        'dist/bower/angular.js',
        'dist/bower/angular-b*.js',
        'dist/bower/api-check.js',
        'dist/bower/bootstrap.js',
        'dist/bower/**/*.js',
        'dist/bower/**/*.css'
    ], { read: false });

    target.pipe(inject(sources, { ignorePath: 'dist/', name: 'inject' }))
        .pipe(inject(bower, { ignorePath: 'dist/', name: 'bower' }))
        .pipe(gulp.dest('dist'));

    return gulp.src('dist/**/*');
});

gulp.task('zip', function() {
    return gulp.src('dist/**/*')
        .pipe(zip('dist.zip'))
        .pipe(gulp.dest('.'));
});


gulp.task('build', ['clean'], function(cb) {
    runSequence(
        'copy',
        'js',
        'css',
        'copy:html',
        'html:inject',
        'minify-html',
        'zip',
        cb);
});


gulp.task('serve', ['build'], function() {

    browserSync({
        notify: true,
        server: {
            baseDir: ['dist'],
        }
    });
    gulp.watch(['app/*.html', 'app/views/**/*.html'], ['copy:html', reload]);
    gulp.watch(['app/css/**/*.css'], ['css', reload]);
    gulp.watch(['app/scripts/**/*.js'], ['build', reload]);
});