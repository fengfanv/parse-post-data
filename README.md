# parse-post-data - 数据接收解析模块

node接收及解析post数据接收解析模块

#### 作者：Fengfanv

------

#### 来源：

本中间件源于 [JS-library -> node](https://github.com/fengfanv/JS-library/tree/master/node/YUMA_uploadFiles) 里上传文件(YUMA_uploadFiles)及上传文件夹(YUMA_uploadFolder)案例

[文件上传案例](https://github.com/fengfanv/JS-library/tree/master/node/YUMA_uploadFiles) | [文件夹上传案例](https://github.com/fengfanv/JS-library/tree/master/node/YUMA_uploadFolder)

#### 应用模块：

1、http、https

2、express

3、koa2

#### 支持解析POST编码格式：

1、'application/json'

2、'application/x-www-form-urlencoded'

3、'multipart/form-data'

4、其它编码格式的数据，接收完毕不会做数据处理，直接返回接收后的原数据

### 使用方法

##### 1、http、https模块使用案例
```javascript
const http = require('http');
const ParsePostData = require('./parse-post-data');//引入parse-post-data.js

const ppd = new ParsePostData();//默认设置
//const ppd = new ParsePostData(__dirname+'/public');//设置接收文件类型数据，文件保存地址
http.createServer(async function (request, response) {
	await ppd.parse(request);//解析post数据
	console.log(request.body)
	
	//...
	
}).listen(80,function(){
	console.log(80,'服务启动成功！');
});
```
##### 2、express模块使用案例
```javascript
const http = require('http');
const express = require('express');
const app = new express();
const ParsePostData = require('./parse-post-data');//引入parse-post-data.js

const ppd = new ParsePostData();//默认设置
//const ppd = new ParsePostData(__dirname+'/public');//设置接收文件类型数据，文件保存地址

app.use(ppd.parse);//挂载模块

app.post('/api/uploadFiles',function(req,res){
	console.log(req.body);
	res.end(JSON.stringify(req.body))
});

//...

http.createServer(app).listen(80,function(){
	console.log(80,'服务启动成功！');
});
```
##### 2、koa2模块使用案例
```javascript
const Koa = require('koa2');
const koa_static = require('koa-static');
const app = new Koa();
const ParsePostData = require('./parse-post-data');
const pdp = new ParsePostData(__dirname+'/public');

app.use(ppd.koaParse);//挂载模块

app.use(async function(ctx,next){
    console.log(ctx.req.body)
    await next();
	
	//...
});

//...

//释放当前目录下public内的文件
app.use(koa_static(__dirname+'/public'));

app.listen(80, function () {
    console.log('启动成功');
});
```

