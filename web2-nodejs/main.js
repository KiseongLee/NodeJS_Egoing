// node js 내장 모듈
var http = require('http'); // http 모듈 사용
var url = require('url');   // url 
var qs = require('querystring'); // querystring
var db = require('./lib/db');
var topic = require('./lib/topic');
var author = require('./lib/author');

// 사용자 모듈
var template = require('./lib/template.js'); // 
const { authorized } = require('./lib/db');


var app = http.createServer(function(request,response){ // http 모듈(객체)에서 createServer 함수를 사용
    var _url = request.url; // 브라우저가 요청한 값의 url을 변수로 정의
    var queryData = url.parse(_url, true).query; // 브라우저가 요청한 값을 url 모듈의 parse 함수를 사용해서 query값을 변수로 정의
    var pathname = url.parse(_url, true).pathname // 브라우저가 요청한 값을 url 모듈의 parse 함수를 사용해서 pathname값을 변수로 정의
    if(pathname==='/') // pathname이 없으면
    {   if(queryData.id===undefined){ // query String의 id값이 없으면 
            topic.home(request, response);
        }
        else{   
            topic.page(request, response)
        }
    }
    else if(pathname==='/create') // pathname이 create이면
    {   
        topic.create(request, response);
    }
    else if(pathname === '/create_process')
    { 
        topic.create_process(request, response);
    }
    else if(pathname === '/update'){ 
        topic.update(request, response);
    }
    else if(pathname === '/update_process'){ 
        topic.update_process(request, response);
    }
    else if(pathname === '/delete_process'){ 
        topic.delete_process(request, response);
    }
    else if(pathname === '/author'){ 
        author.home(request, response);
    }
    else if(pathname === '/author/create_process'){ 
        author.create_process(request, response);
    }
    else if(pathname === '/author/update'){
        author.update(request, response);
    }
    else if(pathname === '/author/update_process'){
        author.update_process(request, response);
    }
    else if(pathname === '/author/delete_process'){
        author.delete_process(request, response);
    }
    else{ // pathname이 위의 조건에 맞는게 없으면
         response.writeHead(404);  //response 객체의 메소드로 헤더 정보를 응답에 작성해 보내는 것(상태코드 200: 요청성공, 404: 찾을 수 없음)
         response.end('Not Found'); // 응답 종료 후 내용을 보여주는 메소드('Not Found')
    }
});
// 우리가 연결하기 원하는 port에 서버를 열어서 연결을 한다라는 의미
app.listen(3000); // server.listen([port], [hostname], [backlog], [callback]);

