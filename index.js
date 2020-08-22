//源码创建
var http = require('http');
var fs = require('fs');
var util = require('util');
var url = require('url');
var path = require('path');
var querystring = require('querystring');
var postDataParse = require('./parse-post-data');

const express = require('express');
const app = new express();
app.use(express.static('./public'));
app.use(postDataParse.parse);
app.post('/api/setName',function(req,res){
	console.log(req.body);
});
app.post('/api/uploadFiles',function(req,res){
	console.log(req.body);
	res.end(JSON.stringify(req.body))
});
http.createServer(app).listen(80,function(){
	console.log(80,'服务启动成功！');
});

// const PUBLIC_PATH = path.join(__dirname, "/\public\/"); //项目地址
// http.createServer(async function (request, response) {

// 	await postDataParse.parse(request);//解析post数据
// 	console.log(request.body)

// }).listen(80);

