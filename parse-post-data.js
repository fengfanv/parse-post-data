/**
 * 文件名：parse-post-data.js
 * 作者：https://github.com/fengfanv
 * 描述：post数据解析器
 * 修改时间：2024年3月8日
 * 资源地址：https://github.com/fengfanv/parse-post-data
 * parseFormData方法案例（上传文件）：https://github.com/fengfanv/JS-library/tree/master/node/YUMA_uploadFiles
 * parseFormData方法案例（上传文件夹）：https://github.com/fengfanv/JS-library/tree/master/node/YUMA_uploadFolder
 * zipFile（制作formdata文件）：https://github.com/fengfanv/JS-library/tree/master/node/zipFile
 */
const fs = require('fs');
const qs = require('querystring');
//匹配POST提交数据方式正则
const contentTypeRegExp = {
    'application/json': new RegExp('application/json', 'i'),
    //编码格式：序列化的json字符串
    'application/x-www-form-urlencoded': new RegExp('application/x-www-form-urlencoded', 'i'),
    //编码格式：key1=val1&key2=val2
    'multipart/form-data': new RegExp('multipart/form-data', 'i'),
    //编码格式：可以上传文件等二进制数据，上传表单键值对，最后会转化为一条信息，信息内的每条数据，以边界字符串为单元，用分隔符分开
    'text/plain': new RegExp('text/plain', 'i')
};
//支持http,https
/**
 * 解析post数据
 * @param {*} request 
 * @param {any} config post数据解析配置，如配置上传文件的保存地址
 * @param {*} next 
 */
exports.parsePost = function (request, config, next) {
    return new Promise(function (resolve, reject) {
        if (request.method == 'POST') {
            var header = request.headers;
            var contentType = typeof header['content-type'] != 'undefined' ? header['content-type'] : null;
            if (contentTypeRegExp['multipart/form-data'].exec(contentType)) {
                //multipart/form-data编码数据，用binary方式接收
                request.setEncoding('binary');
            };
            var postData = '';
            request.on('data', function (chunk) {
                postData += chunk;//这种方式接收数据有1gb左右的限制
            });
            request.on('end', function () {
                if (contentTypeRegExp['application/json'].exec(contentType)) {
                    let data = null;
                    if (new RegExp('^{[^]*}$', 'i').test(postData.trim())) {
                        //json字符串
                        data = JSON.parse(postData);
                    } else {
                        //key1=val1&key2=val2，这里用来兼容jquery的content-type不准确的问题
                        data = qs.parse(postData);
                    }
                    request.body = data;
                    next && next();
                    resolve(data);
                } else if (contentTypeRegExp['application/x-www-form-urlencoded'].exec(contentType)) {
                    let data = qs.parse(postData);
                    request.body = data;
                    next && next();
                    resolve(data);
                } else if (contentTypeRegExp['multipart/form-data'].exec(contentType)) {
                    let storageFilePath = typeof config != 'undefined' && typeof config.storageFilePath != 'undefined' ? config.storageFilePath : undefined;
                    //解析formdata数据
                    parseFormData(postData, storageFilePath).then((data) => {
                        let newData = {};
                        for (let key in data) {
                            newData[key] = data[key].data;
                        }
                        //console.log(newData);
                        request.body = newData;
                        next && next();
                        resolve(newData);
                    }).catch((err) => {
                        reject(err)
                    })
                } else {
                    //其它方式的编码数据不处理，直接返回
                    next && next();
                    resolve(postData);
                }
            });
            request.on('error', function (err) {
                reject(err);
            });
        } else {
            next && next();
            resolve();
        }
    })
};


//解析formdata数据
function parseFormData(formdata, storageFilePath) {
    if (typeof storageFilePath == 'undefined') {
        storageFilePath = __dirname;
    }

    return new Promise(function (resolve, reject) {

        var postData = Buffer.from(formdata,'binary');

        //1、找formdata里边界字符串，已便定位formdata中每条数据分别被放在formdata中的哪里
        //找边界字符串，方式1
        // var boundaryStringBuff = Buffer.alloc(40);//已知 边界字符串 是一个40个字符 由英文标点符号和数字和字母组成的字符串，大小为40个字节
        // postData.copy(boundaryStringBuff, 0, 0, 40);
        //找边界字符串，方式2
        let boundaryStringLen = postData.indexOf(Buffer.from('\r\n'));
        var boundaryStringBuff = Buffer.alloc(boundaryStringLen);
        postData.copy(boundaryStringBuff, 0, 0, boundaryStringLen);

        //2、根据上面找到的 边界字符串，把formdata中的每个参数分割出来（把formdata里面的参数分别提取出来）
        var dataArr = [];
        var boundaryStringIndexArr = [];//每个边界字符串在formdata中的位置
        var isLoop = true;
        var start_position = 0;
        while (isLoop) {
            let index = postData.indexOf(boundaryStringBuff, start_position);
            if (index != -1) {
                boundaryStringIndexArr.push(index);
                // start_position = index + 40;
                start_position = index + boundaryStringLen;//这里把40改成boundaryStringLen，是因为边界字符串因为之前randomStr16的bug，可能会导致边界字符串长度大于40，所以才改成这样。
            } else {
                start_position += 1;
            }
            if (start_position > postData.length) {
                isLoop = false;
            }
        }
        // console.log('boundaryStringIndexArr',boundaryStringIndexArr);
        if (boundaryStringIndexArr.length > 1) {
            //已知，如果formdata里有数据，则边界字符串至少有2个以上
            //formdata里不包含数据时，是这个样子(------WebKitFormBoundaryk6lbnizWoclsvxPJ--)，仅存在一个边界字符串。
            for (let i = 0; i < boundaryStringIndexArr.length - 1; i++) {
                let start = boundaryStringIndexArr[i];
                let end = boundaryStringIndexArr[i + 1];
                let itemSize = end - start;
                let itemBuff = Buffer.alloc(itemSize);
                postData.copy(itemBuff, 0, start, end);//将postData里start位置到end位置的数据，复制到itemBuff中。
                dataArr.push(itemBuff);
            }
        }
        // console.log(dataArr.length)

        // for(let i=0;i<dataArr.length;i++){
        //     // let itemBuff = dataArr[i];
        //     //验证每条数据前有 边界字符串和\r\n
        //     // let firstBuff = Buffer.alloc((40+2));
        //     // itemBuff.copy(firstBuff,0,0,(40+2));
        //     // console.log(firstBuff.toString())
        //     //验证每条数据尾部有 \r\n
        //     // let endBuff = Buffer.alloc(2);
        //     // itemBuff.copy(endBuff,0,itemBuff.length-2,itemBuff.length);
        //     // console.log(endBuff.toString()=='\r\n')
        // }

        //3、分析分割后的数据，把formdata中每一个参数的数据状态信息(数据名称、数据类型等)和数据本体提取出来
        var dataBody = {}; //dataBody是用来存放，formdata里每条数据的状态信息和数据体
        if (dataArr.length == 0) {
            //没有数据，直接返回
            resolve(dataBody);
        } else {
            //有数据，则开始分析formdata里每条数据
            eachArr(0);
        }

        //eachArr是更加详细的解析分割提取formdata里每一个参数的方法
        function eachArr(index) {
            if (index >= dataArr.length) {
                //formdata中所有参数处理完成
                resolve(dataBody);
                return false;
            };

            var item = dataArr[index];//这里item现在是formdata中某一条数据的 数据状态信息(数据名称、数据类型等) 和 数据值本体 的结合体。
            var addIndex = index + 1;

            //首先清除formdata每条数据 首部的(边界字符串和\r\n)(------WebKitFormBoundarywoc0ZgNQ2b4ntunb\r\n)
            //然后再清除formdata每条数据 尾部的(\r\n)
            // var valueData = Buffer.alloc(item.length - (40+2) - 2);//(40+2)是首部边界字符串和\r\n的长度。2是尾部\r\n的长度。//console.log(Buffer.from(`\r\n`).length)//2
            // item.copy(valueData, 0, (40+2), item.length - 2);//提取去除了(首部边界字符串及\r\n)和(尾部\r\n)后的数据。
            var valueData = Buffer.alloc(item.length - (boundaryStringLen+2) - 2);//这里把(40+2)改成(boundaryStringLen+2)，是因为边界字符串因为之前randomStr16的bug，可能会导致边界字符串长度大于40，所以才改成这样。
            item.copy(valueData, 0, (boundaryStringLen+2), item.length - 2);

            //每条数据的(首部边界字符串及\r\n)和(尾部\r\n)去除后
            //将每条数据的 数据状态信息(数据名称、数据类型等) 和 数据值本体 分离开来
            //数据状态信息 与 数据值本体 之间通过 \r\n\r\n 分隔开来
            var fenGeFuIndex = valueData.indexOf(Buffer.from('\r\n\r\n'));//获取分隔符(\r\n\r\n)坐标位置
            var valueDataHeader = Buffer.alloc(fenGeFuIndex - 0);//数据状态信息(数据名称、数据类型等)
            valueData.copy(valueDataHeader, 0, 0, fenGeFuIndex);
            var valueDataSelf = Buffer.alloc(valueData.length - fenGeFuIndex - 4);//数据值本体    (valueData.length-fenGeFuIndex是减去(数据状态信息)的大小)(又减4是减去分隔符(\r\n\r\n)的大小)
            valueData.copy(valueDataSelf, 0, fenGeFuIndex + 4, valueData.length);


            //解析每条数据的 数据状态信息
            //把每条数据的 数据状态信息字符串转换成arr，因为一个参数的状态信息不光有数据名称，还有别的数据说明属性，所以要把它换成arr。
            //提取每条数据的 数据状态信息 用utf8编码的，这样可以防止上传文件时，如果文件名称是中文的话无法识别中文的问题。
            var valueDataHeaderUtf8 = valueDataHeader.toString('utf-8');//将 数据状态信息 转成uft8编码的字符串。
            var paramArr_utf8 = valueDataHeaderUtf8.replace(/[\r\n]/g, ";").split(';');
            //把每条数据的 数据状态信息 分别提取到对象中
            var param = {};//用于临时存放某个已被处理好的参数(已处理好的数据状态信息和对象和数据体)的容器
            for (let i = 0; i < paramArr_utf8.length; i++) {
                let paramArrIndex = i;
                if (paramArr_utf8[paramArrIndex].length > 0) {
                    let fuhao = ":";
                    if (paramArr_utf8[paramArrIndex].search(":") != -1) {
                        fuhao = ":";
                    } else {
                        fuhao = "=";
                    }
                    //处理编码为utf8
                    let paramArrItemkey = paramArr_utf8[paramArrIndex].split(fuhao)[0].replace(/\ +/g, "").replace(/['"]/g, "");
                    let paramArrItemvalue = paramArr_utf8[paramArrIndex].split(fuhao)[1].replace(/['"]/g, "");
                    param[paramArrItemkey] = paramArrItemvalue;
                }
            }

            //根据提取的 数据状态信息，处理 数据本体
            if (typeof param['Content-Type'] != 'undefined') {
                //提取文件类的数据本体
                let data = valueDataSelf;

                //这里把文件类数据写入文件
                //跟据config设置的文件名称及文件存放地址
                let primaryFileName = param.filename.replace(/['"]/g, "");//原文件名
                //storageFilePath  自定义配置的上传文件的文件存放地址
                var filename = param.filename.replace(/['"]/g, "");
                //检查上传的文件类数据，是否有文件夹
                if (new RegExp('/+').test(filename)) {
                    //有文件夹
                    //根据配置的config.storageFilePath设置文件存放地址
                    let filePath = storageFilePath + '/' + filename;
                    //1、分析文件地址
                    //所上传的文件夹里面的文件，经过前端formdata处理后的文件路径为：lpr/images/picture.jpg
                    let pathArr = filename.split('/');
                    let pathArrLen = pathArr.length;
                    if (pathArrLen >= 2) {
                        //有文件夹，检测文件夹是否存在，没有则创建
                        function checkDir(checkDirIndex) {

                            if (checkDirIndex == pathArrLen - 1) {
                                //pathArr最后一个是文件，检查到最后一个了，所以开始执行写入文件操作
                                saveFile(filePath, data).then((path) => {
                                    param.data = filePath;
                                    //执行回调
                                    eachArr(addIndex);
                                }).catch((err) => {
                                    param.errMessage = '写入文件失败';
                                    //执行回调
                                    eachArr(addIndex);
                                })
                                return false;
                            }

                            //检测文件夹是否存在
                            let checkDirIndexAdd = checkDirIndex + 1;
                            let dirPath = storageFilePath + '/' + pathArr.slice(0, checkDirIndexAdd).join('/');
                            fs.stat(dirPath, function (pathErr) {
                                if (pathErr) {
                                    //没有文件夹则创建
                                    fs.mkdir(dirPath, function (createDirErr) {
                                        if (createDirErr) {
                                            console.log('folder创建文件夹失败', dirPath, createDirErr);
                                            return false;
                                        }
                                        checkDir(checkDirIndexAdd);
                                    });
                                    return false;
                                }
                                //有文件夹，不用创建，直接检测下一个
                                checkDir(checkDirIndexAdd);
                            });
                        }
                        checkDir(0);
                    } else {
                        //没有文件夹，直接保存文件
                        saveFile(filePath, data).then((path) => {
                            param.data = filePath;
                            //执行回调
                            eachArr(addIndex);
                        }).catch((err) => {
                            param.errMessage = '写入文件失败';
                            //执行回调
                            eachArr(addIndex);
                        })
                    }
                } else {
                    //没有文件夹，直接保存文件
                    let filePath = storageFilePath + '/' + filename;
                    saveFile(filePath, data).then((path) => {
                        param.data = filePath;
                        //执行回调
                        eachArr(addIndex);
                    }).catch((err) => {
                        param.errMessage = '写入文件失败';
                        //执行回调
                        eachArr(addIndex);
                    })
                }
            } else {
                //提取 普通数据体，普通数据用utf8编码的，防止出现中文字无法识别的问题
                let dataBody_utf8 = valueDataSelf.toString('utf-8');//转换成utf8编码字符串
                let data_utf8 = dataBody_utf8.replace(/[\r\n]/g, "");//除去换行符

                //处理编码为utf8，直接将数据存入
                param.data = data_utf8; //将处理好的 普通数据体写入到param中
                eachArr(addIndex);
            }

            //将这个整理好的formdata参数存入到dataBody中
            dataBody[param.name] = param;
        }
    })
}


//保存文件
/**
 * 
 * @param {*} path 保存地址
 * @param {*} data 文件数据本体
 */
function saveFile(path, data) {
    return new Promise((resolve, reject) => {
        //创建可写流文件
        let writerStream = fs.createWriteStream(path);
        writerStream.write(data, 'binary');
        writerStream.end();//标记文件末尾

        writerStream.on('finish', function () {
            //finish 写入文件结束
            console.log('保存文件成功', path);
            resolve(path)
        });
        writerStream.on('error', function (err) {
            console.log('保存文件失败', path, err);
            // console.log(err.stack);
            reject(err)
        });
    })
}

