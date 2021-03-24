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
const { parsePost } = require('./parse-post-data');//引入parse-post-data.js

http.createServer(async function (request, response) {
	await parsePost(request);//解析post数据
	console.log(request.body)
	
	response.end(JSON.stringify(request.body))//返回响应数据
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
const { parsePost } = require('./parse-post-data');//引入parse-post-data.js

app.post('/api/uploadFiles',async function(req,res){
	await parsePost(req,{"storageFilePath":"./public"});//解析post数据，并且给指定接口配置上传文件的文件保存位置
	
	console.log(req.body);
	res.send(JSON.stringify(req.body))//返回响应数据
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

const { parsePost } = require('./parse-post-data');//引入parse-post-data.js

app.use(async function(ctx,next){
	await parsePost(ctx.req);//解析post数据
    console.log(ctx.req.body)
    ctx.body = JSON.stringify(ctx.req.body)//返回响应数据
	
	//...
});

//...

//释放当前目录下public内的文件
app.use(koa_static(__dirname+'/public'));

app.listen(80, function () {
    console.log('启动成功');
});
```

### 最近更新
> `2021-3-24` 1、简化及统一使用方法 2、加入配置指定接口上传文件保存位置配置项

