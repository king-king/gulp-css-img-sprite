/**
 * Created by wangqun6 on 2017/1/17.
 */

var fis = {};

//register global letiable
Object.defineProperty(global, 'fis', {
    enumerable: true,
    writable: false,
    value: fis
});

//oo
Function.prototype.derive = function (constructor, proto) {
    if (typeof constructor === 'object') {
        proto = constructor;
        constructor = proto.constructor || function () {
            };
        delete proto.constructor;
    }
    var parent = this;
    var fn = function () {
        parent.apply(this, arguments);
        constructor.apply(this, arguments);
    };
    var tmp = function () {
    };
    tmp.prototype = parent.prototype;
    var fp = new tmp(),
        cp = constructor.prototype,
        key;
    for (key in cp) {
        if (cp.hasOwnProperty(key)) {
            fp[key] = cp[key];
        }
    }
    proto = proto || {};
    for (key in proto) {
        if (proto.hasOwnProperty(key)) {
            fp[key] = proto[key];
        }
    }
    fp.constructor = constructor.prototype.constructor;
    fn.prototype = fp;
    return fn;
};

//factory
Function.prototype.factory = function () {
    var clazz = this;

    function F(args) {
        clazz.apply(this, args);
    }

    F.prototype = clazz.prototype;
    return function () {
        return new F(arguments);
    };
};

var file = require("./file.js");
var fs = require("fs");
var cssParser = require("./cssParser.js");
var imgGen = require('./image.js');
var path = require("path");
var crypto = require('crypto');
var hash = crypto.createHash('sha256');

/**
 * obj.cssSrc {string}: css源文件路径,绝对路径
 * [obj.cssDes]{string}：输出css的路径（相对），默认是和css源文件同一个文件夹
 * [obj.imgDes]{string}：输出image的路径（相对），默认是和cssDes同一个文件夹
 * [obj.layout]{string}：布局方式，分为"matrix"和"linear"默认是"linear"
 * [obj.hash]{boolean}：是否给生成的雪碧图添加hash，默认是不添加
 * **/

module.exports = function (content, obj) {
    var curWorkingDir = process.cwd();
    var res = cssParser(content);
    // todo:要将res.content里面残留的，没有合并的图片复制到目标文件夹里
    var images = {};
    var cssRealOut = path.join.apply(this, [curWorkingDir, obj.cssDes]);
    var content2 = res.content;
    var cssFileName = path.basename(obj.cssSrc).split(".")[0];
    var imgRealOutputDir = obj.imgDes ? path.join(curWorkingDir, obj.imgDes) : cssRealOut;

    if (res.map && res.map.length > 0) {
        res.map.forEach(function (data) {
            images[data.image] = file.wrap(path.join.apply(this, [path.dirname(obj.cssSrc), data.image]));
        });
        var css = imgGen(file, res.map, images, {
            cssFileName: cssFileName,
            cssRealOutputDir: cssRealOut,
            layout: obj.layout,
            imgRealOutputDir: imgRealOutputDir,
            hash: obj.hash
        });
        content2 = content2 + css;

        return content2;
    }
    else {
        // 添加没有需要压缩的情况
        return content2;
    }
};

