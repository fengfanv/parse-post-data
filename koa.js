const Koa = require('koa2');
const koa_static = require('koa-static');
const app = new Koa();
const ParsePostData = require('./parse-post-data')
const ppd = new ParsePostData(__dirname+'/public');

app.use(ppd.koaParse);

app.use(async function(ctx,next){
    console.log(ctx.req.body)
    await next();
})

//释放当前目录下public内的文件
app.use(koa_static(__dirname+'/public'));


app.listen(80, function () {
    console.log('启动成功');
});