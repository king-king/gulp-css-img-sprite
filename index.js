/**
 * Created by wangqun6 on 2017/1/17.
 */

var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var pluginName = 'gulp-css-img-sprite';
var css_img_sprite = require('./lib/css-img-sprite');
var path = require('path');

module.exports = function (obj) {
    return through.obj(function (file, encoding, cb) {
        if (file.isStream()) {
            this.emit('error', new PluginError(pluginName, 'Streams are not supported!'));
            return cb();
        }

        if (file.isBuffer()) {
            try {
                var content = css_img_sprite(file.contents.toString(), {
                    cssDes: path.dirname(path.join(obj.cssDesDir, file.relative)),
                    imgDes: obj.imgDesDir,
                    cssSrc: file.path,
                    layout: obj.layout,
                    hash: obj.hash
                });
                file.contents = Buffer.from(content);
            } catch (err) {
                this.emit('error', new PluginError(pluginName, err.toString()));
                return cb();
            }
        }

        // make sure the file goes through the next gulp plugin
        this.push(file);

        // tell the stream engine that we are done with this file
        cb();
    });
};