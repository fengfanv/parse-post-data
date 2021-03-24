//源码创建
var http = require('http');

const { parsePost } = require('./parse-post-data');//引入解析post数据模块

// //express测试区
// const express = require('express');
// const app = new express();
// app.use(express.static('./public'));
// //接收处理普通数据
// app.post('/api/setName',async function(req,res){
// 	const data = await parsePost(req);
// 	console.log(req.body);
// 	res.send(JSON.stringify({"status":"true","message":"接收成功~"}));
// });

// //接收处理文件
// app.post('/api/uploadFiles',async function(req,res){
// 	const data = await parsePost(req,{
// 		storageFilePath:"./public"   //当前接口接收的文件保存在哪里
// 	});
// 	console.log(req.body);
// 	/*处理后参数打印
// 	{
// 		files: './public/无标题.png',   //这里files是参数名字，这里files返回保存的文件地址
// 		obj: '{"objId":1,"objText":"我是fengfanv"}',
// 		id: '741852123456',
// 		name: 'fengfanv'
// 	}
// 	*/
// 	res.send(JSON.stringify({"status":"true","message":"接收成功~"}));
// });

// http.createServer(app).listen(80,function(){
// 	console.log(80,'服务启动成功！');
// });



//http,https模块试验区
const fs = require('fs');
const url = require('url');
const path = require('path');
const querystring = require('querystring');
//静态文件地址
const PUBLIC_PATH = path.join(__dirname, "public");
function app(request, response) {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
    response.setHeader("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    response.setHeader("Access-control-max-age", "1000");

    //处理复杂请求的预检请求
    if (request.method === 'OPTIONS') {
        response.writeHead(200, {
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild, sessionToken ',
            'Access-Control-Allow-Methods': 'PUT, POST, GET, DELETE, OPTIONS'
        });
        return false;
    };
    let pathname = url.parse(request.url).pathname;
    fs.stat(path.join(PUBLIC_PATH, decodeURI(pathname)), function (err, stat) {
        if (err) {
            if (pathname == '/api/setName' && request.method == 'POST') {
                setName(request, response);
            } else if (pathname == '/api/uploadFiles' && request.method == 'POST') {
                uploadFiles(request, response);
            } else if (pathname == '/api/queryData' && request.method == 'GET') {
                queryData(request, response);
            } else {
                response.statusCode = 404;
                response.setHeader('Content-Type', 'text/plain;charset=utf-8');
                response.end('404 ' + pathname);
            }
        } else {
            fs.readFile(path.join(PUBLIC_PATH, decodeURI(pathname)), function (err, file) {
                if (err) {
                    //访问根路径 / 时会走这里
                    console.error('index.js', '读取文件路径：', path.join(PUBLIC_PATH, decodeURI(pathname)));
                    response.statusCode = 404;
                    response.end('404 ' + pathname);
                    return false;
                }
                response.statusCode = 200;
                response.end(file);
            })
        }
    })
}
async function setName(request, response) {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/json;charset=utf-8');

    const data = await parsePost(request);
    console.log(request.body);
    
    response.end(JSON.stringify({ "status": "true", "message": "接收成功~" }));
}
async function uploadFiles(request, response) {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/json;charset=utf-8');

    const data = await parsePost(request, {
        storageFilePath: "./public"   //当前接口接收的文件保存在哪里
    });
    console.log(request.body);
    
    response.end(JSON.stringify({ "status": "true", "message": "接收成功~" }));
}
function queryData(request, response) {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/json;charset=utf-8');
    
    let urlParams = url.parse(request.url).query;
    let data = querystring.parse(urlParams) || {};

    console.log(data);

    response.end(JSON.stringify({ "status": "true", "message": "接收成功~" }));
}
http.createServer(app).listen(80, () => {
    console.log('端口：80，服务已启动！');
});



// //koa2试验区
// const Koa = require('koa');
// const app = new Koa();
// app.use(async function (ctx) {
// 	if (ctx.url === '/api/setName' && ctx.method === 'POST') {
// 		const data = await parsePost(ctx.req);
// 		console.log(ctx.req.body);
// 		ctx.body = JSON.stringify({ "status": "true", "message": "接收成功~" })
// 	} else if (ctx.url === '/api/uploadFiles' && ctx.method === 'POST') {
// 		const data = await parsePost(ctx.req, {
// 			storageFilePath: "./public"   //当前接口接收的文件保存在哪里
// 		});
// 		console.log(ctx.req.body);
// 		ctx.body = JSON.stringify({ "status": "true", "message": "接收成功~" })
// 	} else {
// 		ctx.body = '404，没有这个页面！';
// 	}
// });

// app.listen(80, function () {
// 	console.log('Koa2 启动成功！');
// });




