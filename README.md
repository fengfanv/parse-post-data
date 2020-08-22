# parse-post-data - 模块中间件

node接收及解析post数据模块中间件

#### 作者：Fengfanv

------

#### 来源：

本中间件源于 [JS-library -> node](https://github.com/fengfanv/JS-library/tree/master/node/YUMA_uploadFiles) 里上传文件(YUMA_uploadFiles)及上传文件夹(YUMA_uploadFolder)案例

[文件上传案例](https://github.com/fengfanv/JS-library/tree/master/node/YUMA_uploadFiles) | [文件夹上传案例](https://github.com/fengfanv/JS-library/tree/master/node/YUMA_uploadFolder)

#### 应用模块：

1、http、https

2、express

#### 支持解析POST编码格式：

1、'application/json'

2、'application/x-www-form-urlencoded'

3、'multipart/form-data'

4、其它编码格式的数据，接收完毕不会做数据处理，直接返回接收后的原数据

### 使用方法

##### 1、http、https模块使用案例
```javascript
const http = require('http');
const postDataParse = require('./parse-post-data');//引入parse-post-data.js
http.createServer(async function (request, response) {
	await postDataParse.parse(request);//解析post数据
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
const postDataParse = require('./parse-post-data');//引入parse-post-data.js

app.use(postDataParse.parse);//挂载中间件

app.post('/api/uploadFiles',function(req,res){
	console.log(req.body);
	res.end(JSON.stringify(req.body))
});

//...

http.createServer(app).listen(80,function(){
	console.log(80,'服务启动成功！');
});
```

