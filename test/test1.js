/**
 * Created by king-king on 2017/2/4.
 */
var sprite = require('../index');
var gulp = require("gulp");

var outDir = "build";

gulp.src("css/**/*.css")
    .pipe(sprite({
        cssDesDir: outDir,
        imgDesDir: "build/image",
        hash: true
    }))
    .pipe(gulp.dest(outDir));

