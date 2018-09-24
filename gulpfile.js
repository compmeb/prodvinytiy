"use strict";

var gulp = require("gulp"),
    autoprefixer = require("gulp-autoprefixer"),
    cssbeautify = require("gulp-cssbeautify"),
    removeComments = require('gulp-strip-css-comments'),
    rename = require("gulp-rename"),
    sass = require("gulp-sass"),
    sourcemaps = require('gulp-sourcemaps'),
    cssnano = require("gulp-clean-css"),
    rigger = require("gulp-rigger"),
    uglify = require("gulp-uglify"),
    watch = require("gulp-watch"),
    plumber = require("gulp-plumber"),
    imagemin = require("gulp-imagemin"),
    run = require("run-sequence"),
    rimraf = require("rimraf"),
    notify = require('gulp-notify'),
    webserver = require("browser-sync");



/* Paths to source/build/watch files
=========================*/

var path = {
    build: {
        html: "build/",
        js: "build/js/",
        css: "build/css/",
        img: "build/img/",
        fonts: "build/fonts/"
    },
    src: {
        html: "src/*.{htm,html}",
        js: "src/js/*.js",
        css: "src/style/main.scss",
        img: "src/img/**/*.*",
        fonts: "src/fonts/**/*.*"
    },
    watch: {
        html: "src/**/*.{htm,html}",
        js: "src/js/**/*.js",
        css: "src/style/**/*.scss",
        img: "src/img/**/*.*",
        fonts: "src/fonts/**/*.*"
    },
    clean: "./build"
};



/* Webserver config
=========================*/

var config = {
    server: "build/",
    notify: false,
    open: true,
    ui: false,
    host: 'localhost',
    port: 9000,
    logPrefix: "Frontend_Dnsoft"
};

/* Notify config
=========================*/
var onError = function(err) {
    notify.onError({
    title:    "Error in " + err.plugin,
    message: err.message
    })(err);
    // beep(2);
    this.emit('end');
};


/* Tasks
=========================*/

gulp.task("webserver", function () {
    webserver(config);
});


gulp.task("html:build", function () {
    return gulp.src(path.src.html)
        .pipe(plumber({ errorHandler: onError }))
        .pipe(rigger())
        .pipe(gulp.dest(path.build.html))
        .pipe(webserver.reload({stream: true}));
});


gulp.task("css:build", function () {
    gulp.src(path.src.css)
        .pipe(plumber({ errorHandler: onError }))
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(autoprefixer({
            browsers: ["last 5 versions"],
            cascade: true
        }))
        .pipe(removeComments())
        .pipe(cssbeautify())
        .pipe(gulp.dest(path.build.css))
        .pipe(cssnano())
        .pipe(rename({suffix:'.min', prefix: ''}))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.css))
        .pipe(webserver.reload({stream: true}));
});


gulp.task("js:build", function () {
    gulp.src(path.src.js)
        .pipe(plumber({ errorHandler: onError }))
        .pipe(rigger())
        .pipe(sourcemaps.init())
        .pipe(gulp.dest(path.build.js))
        .pipe(uglify())
        .pipe(removeComments())
        .pipe(rename({suffix:'.min', prefix: ''}))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.js))
        .pipe(webserver.reload({stream: true}));
});
 
/* No sourcemaps
========================*/

gulp.task("js:final", function () {
    gulp.src(path.src.js)
        .pipe(plumber({ errorHandler: onError }))
        .pipe(rigger())
        .pipe(gulp.dest(path.build.js))
        .pipe(uglify())
        .pipe(removeComments())
        .pipe(rename({suffix:'.min', prefix: ''}))
        .pipe(gulp.dest(path.build.js))
        .pipe(webserver.reload({stream: true}));
});

gulp.task("css:final", function () {
    gulp.src(path.src.css)
        .pipe(plumber({ errorHandler: onError }))
        .pipe(sass())
        .pipe(autoprefixer({
            browsers: ["last 5 versions"],
            cascade: true
        }))
        .pipe(removeComments())
        .pipe(cssbeautify())
        .pipe(gulp.dest(path.build.css))
        .pipe(cssnano())
        .pipe(rename({suffix:'.min', prefix: ''}))
        .pipe(gulp.dest(path.build.css))
        .pipe(webserver.reload({stream: true}));
});



gulp.task("fonts:build", function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts));
});


gulp.task("image:build", function () {
    gulp.src(path.src.img)
        .pipe(imagemin({
            optimizationLevel: 3,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img));
});


gulp.task("clean", function (cb) {
    rimraf(path.clean, cb);
});


gulp.task('build', function (cb) {
    run(
        "clean",
        "html:build",
        "css:build",
        "js:build",
        "fonts:build",
        "image:build"
    , cb);
});



gulp.task("watch", function() {
    watch([path.watch.html], function(event, cb) {
        gulp.start("html:build");
    });
    watch([path.watch.css], function(event, cb) {
        gulp.start("css:build");
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start("js:build");
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start("image:build");
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start("fonts:build");
    });
});

/* Production
======================*/

gulp.task('prod', function (cb) {
    run(
        "clean",
        "html:build",
        "css:final",
        "js:final",
        "fonts:build",
        "image:build"
    , cb);
});

/* Development
===================*/

gulp.task("default", function (cb) {
   run(
       "clean",
       "build",
       "webserver",
       "watch"
   , cb);
});
