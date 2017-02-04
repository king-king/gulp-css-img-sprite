/**
 * Created by wangqun6 on 2017/1/17.
 */

var fis = {};

//register global variable
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
 * obj.cssSrc ： css源文件路径
 * [obj.cssDes]：css文件输出路径，默认是和css源文件同一个文件夹
 * [obj.imgDes]：image输出路径，默认是和cssDes同一个文件夹
 * [obj.layout]：布局方式，分为"matrix"和"linear"默认是"linear"
 * [obj.imgFlag]：三个选项：'hash','time','no',默认是hash
 * [obj.cssFlag]：三个选项：'hash','time','no',默认是hash
 *
 * **/

function getHash(content) {
    hash.update(content);
    return hash.digest('hex').slice(0, 10);
}

module.exports = function (obj) {
    var curWorkingDir = process.cwd();
    var content = fs.readFileSync(obj.cssSrc, "utf-8");
    var res = cssParser(content);
    // todo:要将res.content里面残留的，没有合并的图片复制到目标文件夹里
    var images = {};
    var cssRealOut = path.join.apply(this, [curWorkingDir, obj.cssDes]);
    var content2 = res.content;
    var cssFileName = path.basename(obj.cssSrc).split(".")[0];
    var hashFlag = "";
    var imgRealOutputDir = obj.imgDes ? path.join(curWorkingDir, obj.imgDes) : cssRealOut;

    // 先处理不能合并的图片，将这些图片复制到生成目录里，并且修改css文件中图片的引用路径
    // content2 = content2.replace(/background(?:-image)?.*url\(\s*["']((?:\S)*)["'].*;/g, function (str, url) {
    //     // 计算新的url
    //     var imgName = path.basename(url);
    //     var newUrl = path.join(path.relative(cssRealOut, imgRealOutputDir), imgName);
    //     return str.replace(url, newUrl);
    // });


    if (res.map && res.map.length > 0) {
        res.map.forEach(function (data) {
            images[data.image] = file.wrap(path.join.apply(this, [path.dirname(obj.cssSrc), data.image]));
        });
        var css = imgGen(file, res.map, images, {
            cssFileName: cssFileName,
            cssRealOutputDir: cssRealOut,
            layout: obj.layout,
            imgRealOutputDir: imgRealOutputDir
        });
        content2 = content2 + css;

        function getTime() {
            return (new Date()).getTime();
        }

        if (obj["imgFlag"]) {
            if (obj["imgFlag"] === "hash") {
                hashFlag = getHash(content2);
            } else if (obj["imgFlag"] === "time") {
                hashFlag = getTime();
            }
        } else {
            hashFlag = getHash(content2);
        }
        fs.writeFile(path.join.apply(this, [cssRealOut, cssFileName + "" + hashFlag + ".css"]), content2, function (err) {
            if (!err) {
                console.log("合并成功");
            } else {
                console.log(err);
            }
        });
    }
    else {
        if (obj["imgFlag"]) {
            if (obj["imgFlag"] === "hash") {
                hashFlag = getHash(content);
            } else if (obj["imgFlag"] === "time") {
                hashFlag = getTime();
            }
        } else {
            hashFlag = getHash(content2);
        }
        // 添加没有需要压缩的情况
        fs.writeFile(path.join.apply(this, [cssRealOut, cssFileName + "" + hashFlag + ".css"]), content, function (err) {
            if (!err) {
                console.log("没有需要合并的内容");
            } else {
                console.log(err);
            }
        });
    }
};

