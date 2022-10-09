const express = require('express') // const는 바뀌지 않는 상수, require은 express라는 모듈을 가져올 때 사용
const app = express() // express를 함수처럼 호출, app에는 객체가 담김
const port = 3000 
var fs = require('fs');
var bodyParser = require('body-parser');
var compression = require('compression');
const helmet = require('helmet')
app.use(helmet())

var indexRouter = require('./routes/index')
var topicRouter = require('./routes/topic')

// 정적인 파일을 서비스하는 미들웨어(public 파일 아래에 있는 파일들을 url로 접근이 가능)
app.use(express.static('public'))

//bodyparser가 만들어낸 미들웨어를 표현하는 식
// 사용자가 전송한 포스트 데이터를 내부적으로 분석
app.use(bodyParser.urlencoded({ extended: false }))

// compression가 만들어낸 미들웨어를 표현하는 식
// 미들웨어가 app.use를 통해 장착됨 -> 요청이 들어올 때마다 compression 미들웨어가 실행된다.
app.use(compression());

// filelist 미들웨어 만들어서 사용
app.get('*', function(request, response, next){
  fs.readdir('./data', function(error, filelist){
    request.list = filelist;
    next();
  });
})

// /topic으로 시작하는 주소들에게 indexRouter라는 미들웨어를 적용하겠다.
app.use('/', indexRouter);
// /topic으로 시작하는 주소들에게 topicRouter라는 미들웨어를 적용하겠다.
app.use('/topic', topicRouter);

app.use((req,res)=>{
	res.status(404).send('not found');
});

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

app.listen(port, function(){
  console.log(`Example app listening on port ${port}`)
});