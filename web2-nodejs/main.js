// node js 내장 모듈
var http = require('http'); // http 모듈 사용
var fs = require('fs');     // fs(filesystem) 
var url = require('url');   // url 
var qs = require('querystring'); // querystring
var path = require('path');  // path

// 사용자 모듈
var template = require('./lib/template.js'); // 


var app = http.createServer(function(request,response){ // http 모듈(객체)에서 createServer 함수를 사용
    var _url = request.url; // 브라우저가 요청한 값의 url을 변수로 정의
    var queryData = url.parse(_url, true).query; // 브라우저가 요청한 값을 url 모듈의 parse 함수를 사용해서 query값을 변수로 정의
    var pathname = url.parse(_url, true).pathname // 브라우저가 요청한 값을 url 모듈의 parse 함수를 사용해서 pathname값을 변수로 정의
    if(pathname==='/') // pathname이 없으면
    {   if(queryData.id===undefined){ // query String의 id값이 없으면 
            
            fs.readdir('./data', function(error, filelist) // fs의 readdir(디렉토리 읽기, 파일목록 읽기) 함수를 사용하여 파일명을 가져온다 - 리스트 보여줘야함!!
            {   // id 값이 없다=홈 화면
                var title = 'Welcome'; // title은 'Welcome' 
                var description = 'Hello, Node.js'; // description은 'Hello, Node.js'
                // list와 html은 함수화를 했음 lib/template.js
                var list =template.list(filelist);  // list는 위 함수 사용하여 가져온 파일명을 보여주는 리스트
                var html = template.HTML(title, list, // html은 그 밑에 내용을 말하는 것 -> 여기서는 Welcome과 Hello~를 보여주면된다. 
                    `<h2>${title}</h2>${description}`,  
                    `<a href="/create">create</a>`);
                response.writeHead(200); // response 객체의 메소드로 헤더 정보를 응답에 작성해 보내는 것(상태코드 200: 요청성공, 404: 찾을 수 없음)
                response.end(html); // 응답 종료 후 내용을 보여주는 메소드로 괄호안에 내용을 넣어주면된다.
            })
        }
        else{   // query String의 id값이 있으면
            fs.readdir('./data', function(error, filelist){
                var filteredId = path.parse(queryData.id).base; // 보안에 취약점(id값을 경로를 주면 password 같은 것을 브라우저에 보여줄 수 있음)을 위해서 사용하는 모듈(path)의 parse메서드를 사용해서 id값을 필터링 해준다.
                fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){ // fs의 readFile 함수 사용하여 파일을 읽는다
                var title = queryData.id;// title은 QueryString의 id 값 (? 뒤에 오는 id값)
                // list와 html은 함수화를 했음 lib/template.js
                var list =template.list(filelist); // list는 위 함수 사용하여 가져온 파일명을 보여주는 리스트
                var html = template.HTML(title, list, // html은 그 밑에 내용을 말하는 것 -> 여기서는 각각의 내용(파일 읽을 때 가져온 값)을 담은 내용을 보여주면됨
                    `<h2>${title}</h2>${description}`,
                    //create, update, delete(링크로 구현하면 안됨){form 형식으로 하고 input, } 버튼도 만들어줘야함 
                    `<a href="/create">create</a>   
                    <a href="/update?id=${title}">update</a>
                    <form action="delete_process" method="post">
                        <input type="hidden" name="id" value="${title}">
                        <input type="submit" value="delete">
                    </form>
                    `);
                response.writeHead(200); //response 객체의 메소드로 헤더 정보를 응답에 작성해 보내는 것(상태코드 200: 요청성공, 404: 찾을 수 없음)
                response.end(html); // 응답 종료 후 내용을 보여주는 메소드로 괄호안에 내용을 넣어주면된다.
            })
            });
        }
    }
    else if(pathname==='/create') // pathname이 create이면
    {
    
        fs.readdir('./data', function(error, filelist){ // fs의 readdir(디렉토리 읽기, 파일목록 읽기) 함수를 사용하여 파일명을 가져온다 - 리스트 보여줘야함!!
        var title = 'WEB - create'; // title은 WEB - create
        // list와 html은 함수화를 했음 lib/template.js
        var list =template.list(filelist); // list는 위 함수 사용하여 가져온 파일명을 보여주는 리스트
        // html은 그 밑에 내용을 말하는 것 -> 여기서는 create를 할 수 있는 form 형식(POST 방식) input, textarea, sumbit버튼
        var html = template.HTML(title, list, `<form action="/create_process" method="post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p>
            <textarea name="description" placeholder="description"></textarea>
        </p>
        <p>
            <input type="submit">
        </p>
    
        </form>`, '');
        response.writeHead(200); //response 객체의 메소드로 헤더 정보를 응답에 작성해 보내는 것(상태코드 200: 요청성공, 404: 찾을 수 없음)
        response.end(html); // 응답 종료 후 내용을 보여주는 메소드로 괄호안에 내용을 넣어주면된다.
        
    })}
    else if(pathname === '/create_process'){ // pathname이 /create_process(create)이면
        // create할 때, POST로 보내온 내용을 파싱하기 위한 작업
        // https://stackoverflow.com/questions/4295782/how-to-process-post-data-in-node-js(참고)
        var body=''; // body 변수 만듬
        request.on('data', function(data){ 
            body = body + data; // body에 데이터들을 계속 더해주고
        });
        request.on('end', function(){ // end라는 문자를 받으면
            var post = qs.parse(body); // post라는 변수를 만들자. qs 모듈의 parse 함수로 body를 파싱한다.
            var title = post.title; // title은 post의 title
            var description = post.description; // description은 post의 description
            fs.writeFile(`data/${title}`, description, 'utf8', function(err){ // 파일 생성하기 fs.writefile(file(저장할 파일의 경로), data(파일에 기록될 게이터양식), options(인코딩, 모드, 플래그), callback(메소드가 실행될 때 호출되는 함수))
            response.writeHead(302, {Location: `/?id=${title}`}); // redirection(302) Location /?id=${title}
            response.end(); // 응답 종료 후 내용을 보여주는 메소드이지만 리다이렉션을 하므로 아무것도 안넣어줘도됨
            });

        });
        
    }
    else if(pathname === '/update'){ // pathname이 update일 때
        fs.readdir('./data', function(error, filelist){ // 파일 목록을 가져오자
            var filteredId = path.parse(queryData.id).base; // 보안에 취약점(id값을 경로를 주면 password 같은 것을 브라우저에 보여줄 수 있음)을 위해서 사용하는 모듈(path)의 parse메서드를 사용해서 id값을 필터링 해준다. 
            fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){ // fs의 readFile 함수 사용하여 파일을 읽는다
                var title = queryData.id;  // title은 QueryString의 id 값 (? 뒤에 오는 id값)
                var list =template.list(filelist); // list는 함수 사용하여 가져온 파일명을 보여주는 리스트
                // html은 그 밑에 내용을 말하는 것 -> 여기서는 update를 할 수 있는 form 형식이 나와야함 -> form(POST), input(여기서 title값이 수정될 것을 대비하여 title값을 미리 가져오는 input을 만들어 놓는다), input(실제로 수정될 input, title 값이 있어야함), textarea(description가 있어야함)
                // control create버튼을 만든다.
                 var html = template.HTML(title, list, 
                            `
                        <form action="/update_process" method="post">
                            <input type="hidden" name="id" value="${title}">
                            <p><input type="text" name="title" placeholder="title" value=${title}></p>
                            <p>
                                <textarea name="description" placeholder="description">${description}</textarea>
                            </p>
                            <p>
                            <input type="submit">
                            </p>
                
                        </form>
                            `,  
                            `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`);
                response.writeHead(200); //response 객체의 메소드로 헤더 정보를 응답에 작성해 보내는 것(상태코드 200: 요청성공, 404: 찾을 수 없음)
                response.end(html); // 응답 종료 후 내용을 보여주는 메소드로 괄호안에 내용을 넣어주면된다.
            })
        }
    )}
    else if(pathname === '/update_process'){ // pathname이 update_process일 때
        // update할 때, POST로 보내온 내용을 파싱하기 위한 작업
        var body=''; // body 변수 만듬 
        request.on('data', function(data){ // request의 on 메소드를 사용해서 data를 받아와서 body값을 갱신해준다
            body = body + data;
        });
        request.on('end', function(){ // request의 on 메소드 end를 사용하여 마무리
            var post = qs.parse(body); // post값은 qs 모듈의 parse 메소드를 사용하여 갱신해준다
            var id = post.id; // id 값은 수정되기 전 이름을 말한다. 위에서 id로 정의함(hidden 버튼)
            var title = post.title; // title 값은 이름이 업데이트 될 수 있으므로 갱신
            var description = post.description; // description은 post의 description 
            fs.rename( `data/${id}`, `data/${title}`, function(error){ // fs 모듈의 rename 메소드(fs.rename(oldPath, newPath, callback))를 사용해서 이름을 바꿔준다
                fs.writeFile(`data/${title}`, description, 'utf8', function(err){ // 파일 생성하기 
                    response.writeHead(302, {Location: `/?id=${title}`}); // redirection(302) Location /?id=${title}
                    response.end(); // 응답 종료 후 내용을 보여주는 메소드이지만 리다이렉션을 하므로 아무것도 안넣어줘도됨
                    });
            })
        });
        
    }
    else if(pathname === '/delete_process'){ // pathnmae이 delete_process일 때
        // delete할 때, POST로 보내온 내용을 파싱하기 위한 작업
        var body = ''; // body 변수 만듬
        request.on('data', function(data){ // request의 on 메소드를 사용해서 data를 받아와서 body값을 갱신해준다
            body = body + data;
        });
        request.on('end', function(){ // request의 on 메소드 end를 사용하여 마무리
            var post = qs.parse(body); // post값은 qs 모듈의 parse 메소드를 사용하여 갱신해준다
            var id = post.id; // id 값은 수정되기 전 이름을 말한다. 위에서 id로 정의함(hidden 버튼) 
            var filteredId = path.parse(id).base; // 보안에 취약점(id값을 경로를 주면 password 같은 것을 브라우저에 보여줄 수 있음)을 위해서 사용하는 모듈(path)의 parse메서드를 사용해서 id값을 필터링 해준다.
            fs.unlink(`data/${filteredId}`, function(error){ // fs모듈의 unlink 메소드(fs.unlink(path, callback))를 사용하여 파일을 삭제해준다
              response.writeHead(302, {Location: `/`}); // redirection(302) Location / (홈으로 보내자)
              response.end(); // 응답 종료 후 내용을 보여주는 메소드이지만 리다이렉션을 하므로 아무것도 안넣어줘도됨
            })
        });
      }

    else{ // pathname이 위의 조건에 맞는게 없으면
         response.writeHead(404);  //response 객체의 메소드로 헤더 정보를 응답에 작성해 보내는 것(상태코드 200: 요청성공, 404: 찾을 수 없음)
         response.end('Not Found'); // 응답 종료 후 내용을 보여주는 메소드('Not Found')
    }
    
 
 
});
// 우리가 연결하기 원하는 port에 서버를 열어서 연결을 한다라는 의미
app.listen(3000); // server.listen([port], [hostname], [backlog], [callback]);

