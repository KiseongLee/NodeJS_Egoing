var db = require('./db');
var template = require('./template.js'); // 
var url = require('url');   // url 
var qs = require('querystring'); // querystring
var sanitizeHTML = require('sanitize-html'); // sanitize html

exports.home = function(request, response){
    db.query(`SELECT * FROM topic`, function(error, topics){
        // console.log(topics);
        var title = 'Welcome'; // title은 'Welcome' 
        var description = 'Hello, Node.js'; // description은 'Hello, Node.js'
        // list와 html은 함수화를 했음 lib/template.js
        var list =template.list(topics);  // list는 위 함수 사용하여 가져온 파일명을 보여주는 리스트
        var html = template.HTML(title, list, // html은 그 밑에 내용을 말하는 것 -> 여기서는 Welcome과 Hello~를 보여주면된다. 
            `<h2>${title}</h2>${description}`,  
            `<a href="/create">create</a>`);
        response.writeHead(200);
        response.end(html);
        })
}

exports.page = function(request, response) {
    // query String의 id값이 있으면
    var _url = request.url; // 브라우저가 요청한 값의 url을 변수로 정의
    var queryData = url.parse(_url, true).query; // 브라우저가 요청한 값을 url 모듈의 parse 함수를 사용해서 query값을 변수로 정의
    db.query(`SELECT * FROM topic`, function(error, topics){
        
        if(error){
            throw error;//error를 console에 출력하면서 app을 즉시 중시함
        }
        //db.query는 여러개의 sql구문을 실행하는 것을 막아놓았다. 설정하려면 db.js가서 multiplestatements : true로 바꿔주면됨. -> 절대 이렇게 설정하면 안됨
        // https://opentutorials.org/course/3347/21298 
        // 막는 방법 -> db.escape()
        var query=db.query(`SELECT * FROM topic LEFT JOIN author ON topic.author_id = author.id WHERE topic.id=?`,[queryData.id] ,function(error2, topic){ /* ?값이 무엇인지 두번째 인자에 담아서 준다 -> 공격에 의도가 있는 것들을 알아서 세탁해줌*/ 
            if(error2){
                throw error2;
            }
            var title = topic[0].title; // title은 'Welcome' 
            var description = topic[0].description; // description은 'Hello, Node.js'
            // list와 html은 함수화를 했음 lib/template.js
            var list =template.list(topics);  // list는 위 함수 사용하여 가져온 파일명을 보여주는 리스트
            var html = template.HTML(title, list, // html은 그 밑에 내용을 말하는 것 -> 여기서는 Welcome과 Hello~를 보여주면된다. 
                `<h2>${sanitizeHTML(title)}</h2>
                ${sanitizeHTML(description)}
                <p>by ${sanitizeHTML(topic[0].name)}</p>
                `,  
                `<a href="/create">create</a>   
                <a href="/update?id=${queryData.id}">update</a>
                <form action="delete_process" method="post">
                    <input type="hidden" name="id" value="${queryData.id}">
                    <input type="submit" value="delete">
                </form>`);
                console.log(query.sql);
            response.writeHead(200);
            response.end(html);
        })
    })
}

exports.create = function(request, response){
    db.query(`SELECT * FROM topic`, function(error, topics){
        db.query(`SELECT * FROM author`, function(error, authors){
            // console.log(topics);
            var title = 'Create'; // title은 'Welcome' 
            // list와 html은 함수화를 했음 lib/template.js
            var list =template.list(topics);  // list는 위 함수 사용하여 가져온 파일명을 보여주는 리스트
            var html = template.HTML(sanitizeHTML(title), list, // html은 그 밑에 내용을 말하는 것 -> 여기서는 Welcome과 Hello~를 보여주면된다. 
                `<form action="/create_process" method="post">
                    <p><input type="text" name="title" placeholder="title"></p>
                    <p>
                        <textarea name="description" placeholder="description"></textarea>
                    </p>
                    <p>
                        ${template.authorSelect(authors)}
                    </p>
                    <p>
                        <input type="submit">
                    </p>
                
                </form>`,  
                ``);
            response.writeHead(200);
            response.end(html);
        })
        
    
})
}

exports.create_process = function(request, response){

        // pathname이 /create_process(create)이면
        // create할 때, POST로 보내온 내용을 파싱하기 위한 작업
        // https://stackoverflow.com/questions/4295782/how-to-process-post-data-in-node-js(참고)
        var body=''; // body 변수 만듬
        request.on('data', function(data){ 
            body = body + data; // body에 데이터들을 계속 더해주고
        });
        request.on('end', function(){ // end라는 문자를 받으면
            var post = qs.parse(body); // post라는 변수를 만들자. qs 모듈의 parse 함수로 body를 파싱한다.
            db.query(`
                INSERT INTO topic (title, description, created, author_id)
                    VALUES(?, ?, NOW(), ?)`,
                    [post.title, post.description, post.author], function(error, result){
                        if(error){
                            throw error;
                        }
                        response.writeHead(302, {Location: `/?id=${result.insertId}`})
                        response.end();
                    })

        });
}

exports.update = function(request, response){
    var _url = request.url; // 브라우저가 요청한 값의 url을 변수로 정의
    var queryData = url.parse(_url, true).query; // 브라우저가 요청한 값을 url 모듈의 parse 함수를 사용해서 query값을 변수로 정의
    // pathname이 update일 때
    db.query(`SELECT * FROM topic`, function(error, topics){
        if(error){
            throw error;
        }
        db.query(`SELECT * FROM author`, function(error, authors){
            db.query(`SELECT * FROM topic WHERE id=?`,[queryData.id], function(error2, topic){
                if(error2){
                    throw error2;
                }
                var id = topic[0].id;
                var title = topic[0].title;
                var description = topic[0].description;
                var list = template.list(topics);
                var html = template.HTML(sanitizeHTML(title), list, 
                    `
                <form action="/update_process" method="post">
                    <input type="hidden" name="id" value="${id}">
                    <p><input type="text" name="title" placeholder="title" value=${sanitizeHTML(title)}></p>
                    <p>
                        <textarea name="description" placeholder="description">${description}</textarea>
                    </p>
                    <p>
                        ${template.authorSelect(authors, topic[0].author_id)}
                    </p>
                    <p>
                        <input type="submit">
                    </p>
                </form>
                    `,  
                    `<a href="/create">create</a> <a href="/update?id=${id}">update</a>`);
                response.writeHead(200);
                response.end(html);
            })
        })
    })
}

exports.update_process = function(request, response){

        // pathname이 update_process일 때
        // update할 때, POST로 보내온 내용을 파싱하기 위한 작업
        var body=''; // body 변수 만듬 
        request.on('data', function(data){ // request의 on 메소드를 사용해서 data를 받아와서 body값을 갱신해준다
            body = body + data;
        });
        request.on('end', function(){ // request의 on 메소드 end를 사용하여 마무리
            var post = qs.parse(body); // post값은 qs 모듈의 parse 메소드를 사용하여 갱신해준다
            console.log(post)
            db.query(`UPDATE topic SET title=?, description=?, author_id=? WHERE id=?`,[post.title, post.description, post.author,post.id], function(error, result){
                if(error){
                    throw error;
                }
                response.writeHead(302, {Location: `/?id=${post.id}`})
                response.end();
            })
        });
}

exports.delete_process = function(request, response){
        // pathnmae이 delete_process일 때
        // delete할 때, POST로 보내온 내용을 파싱하기 위한 작업
        var body = ''; // body 변수 만듬
        request.on('data', function(data){ // request의 on 메소드를 사용해서 data를 받아와서 body값을 갱신해준다
            body = body + data;
        });
        request.on('end', function(){ // request의 on 메소드 end를 사용하여 마무리
            var post = qs.parse(body); // post값은 qs 모듈의 parse 메소드를 사용하여 갱신해준다
            db.query(`DELETE FROM topic WHERE id=?`,[post.id], function(error, result){
                if(error){
                    throw error;
                }
                response.writeHead(302, {Location: `/`});
                response.end();
            })
        });
}