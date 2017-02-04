/**
 * Created by wangqun6 on 2017/1/17.
 */

let fis = {};

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
    let parent = this;
    let fn = function () {
        parent.apply(this, arguments);
        constructor.apply(this, arguments);
    };
    let tmp = function () {
    };
    tmp.prototype = parent.prototype;
    let fp = new tmp(),
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
    let clazz = this;

    function F(args) {
        clazz.apply(this, args);
    }

    F.prototype = clazz.prototype;
    return function () {
        return new F(arguments);
    };
};

let file = require("./file.js");
let fs = require("fs");
let cssParser = require("./cssParser.js");
let imgGen = require('./image.js');
let path = require("path");
let crypto = require('crypto');
let hash = crypto.createHash('sha256');

/**
 * obj.cssSrc {string}: css源文件路径,绝对路径
 * [obj.imgDes]{string}：image输出路径，默认是和cssDes同一个文件夹
 * [obj.layout]{string}：布局方式，分为"matrix"和"linear"默认是"linear"
 * [obj.hash]{boolean}：是否给生成的雪碧图添加hash，默认是不添加
 * **/

function getHash(content) {
    hash.update(content);
    return hash.digest('hex').slice(0, 10);
}

module.exports = function (content, obj) {
    let curWorkingDir = process.cwd();
    let res = cssParser(content);
    // todo:要将res.content里面残留的，没有合并的图片复制到目标文件夹里
    let images = {};
    let cssRealOut = path.join.apply(this, [curWorkingDir, obj.cssDes]);
    let content2 = res.content;
    let cssFileName = path.basename(obj.cssSrc).split(".")[0];
    let imgRealOutputDir = obj.imgDes ? path.join(curWorkingDir, obj.imgDes) : cssRealOut;

    if (res.map && res.map.length > 0) {
        res.map.forEach(function (data) {
            images[data.image] = file.wrap(path.join.apply(this, [path.dirname(obj.cssSrc), data.image]));
        });
        let css = imgGen(file, res.map, images, {
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

