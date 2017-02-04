/**
 * Created by wangqun6 on 2017/1/17.
 */

let through = require('through2');
let gutil = require('gulp-util');
let PluginError = gutil.PluginError;
let pluginName = 'gulp-css-img-sprite';
let css_img_sprite = require('./lib/css-img-sprite');
let path = require('path');

module.exports = function (obj) {
    return through.obj(function (file, encoding, cb) {
        if (file.isStream()) {
            this.emit('error', new PluginError(pluginName, 'Streams are not supported!'));
            return cb();
        }

        if (file.isBuffer()) {
            try {
                let content = css_img_sprite(file.contents.toString(), {
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