var db = require('./db');
var template = require('./template.js'); 
var url = require('url');   // url
var qs = require('querystring'); // querystring
var sanitizeHTML = require('sanitize-html'); // sanitize html

exports.home = function(request, response){
    db.query(`SELECT * FROM topic`, function(error, topics){
        db.query(`SELECT * FROM author`, function(error2, authors){
            var _url = request.url; // 브라우저가 요청한 값의 url을 변수로 정의
            var queryData = url.parse(_url, true).query; // 브라우저가 요청한 값을 url 모듈의 parse 함수를 사용해서 query값을 변수로 정의
            var tag = template.authorTable(authors)
            var title = 'author'; // title은 'Welcome' 
            var list =template.list(topics);  // list는 위 함수 사용하여 가져온 파일명을 보여주는 리스트
            var html = template.HTML(title, list, // html은 그 밑에 내용을 말하는 것 -> 여기서는 Welcome과 Hello~를 보여주면된다. 
            
                `
                ${tag}
                
                <style>
                    table{
                        border-collapse: collapse;
                    }
                    td{
                        border:1px solid black;
                    }
                </style>
                <form action="author/create_process" method="post">
                    <p><input type="text" name="name" placeholder="name"></p>
                    <p><textarea name="profile" placeholder="profile"></textarea></p>
                    <p><input type="submit" value="create"></p>
                </form>
                `,  
                ``);
            response.writeHead(200);
            response.end(html);
            }) 
    })
}

exports.create_process = function(request, response){

    var body=''; // body 변수 만듬
    request.on('data', function(data){ 
        body = body + data; // body에 데이터들을 계속 더해주고
    });
    request.on('end', function(){ // end라는 문자를 받으면
        var post = qs.parse(body); // post라는 변수를 만들자. qs 모듈의 parse 함수로 body를 파싱한다.

        db.query(`
            INSERT INTO author (name, profile)
                VALUES(?, ?)`,
                [post.name, post.profile], function(error, result){
                    if(error){
                        throw error;
                    }
                    response.writeHead(302, {Location: `/author`})
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
            db.query(`SELECT * FROM author WHERE id=?`,[queryData.id], function(error2, author){
                if(error2){
                    throw error;
                }
                var tag = template.authorTable(authors)
                var id = author[0].id;
                var name = author[0].name;
                var profile = author[0].profile;
                var list = template.list(topics);
                var html = template.HTML(name, list, // html은 그 밑에 내용을 말하는 것 -> 여기서는 Welcome과 Hello~를 보여주면된다. 
                
                    `
                    ${tag}
                    
                    <style>
                        table{
                            border-collapse: collapse;
                        }
                        td{
                            border:1px solid black;
                        }
                    </style>
                    <form action="/author/update_process" method="post">
                        <input type="hidden" name="id" value=${id}>
                        <p><input type="text" name="name" placeholder="name" value=${sanitizeHTML(name)}></p>
                        <p><textarea name="profile" placeholder="profile">${sanitizeHTML(profile)}</textarea></p>
                        <p><input type="submit" value="update"></p>
                    </form>
                    `,  
                    ``);
                response.writeHead(200);
                response.end(html);
                })
            })
        })
    }

exports.update_process = function(request, response){
    var body=''; // body 변수 만듬 
    request.on('data', function(data){ // request의 on 메소드를 사용해서 data를 받아와서 body값을 갱신해준다
        body = body + data;
    });
    request.on('end', function(){ // request의 on 메소드 end를 사용하여 마무리
        var post = qs.parse(body); // post값은 qs 모듈의 parse 메소드를 사용하여 갱신해준다
        db.query(`UPDATE author SET name=?, profile=? WHERE id=?`,[post.name, post.profile, post.id], function(error, result){
            if(error){
                throw error;
            }
            response.writeHead(302, {Location: `/author`})
            response.end();
        })
    });
}

exports.delete_process = function(request, response){
    var body = ''; // body 변수 만듬
        request.on('data', function(data){ // request의 on 메소드를 사용해서 data를 받아와서 body값을 갱신해준다
            body = body + data;
        });
        request.on('end', function(){ // request의 on 메소드 end를 사용하여 마무리
            var post = qs.parse(body); // post값은 qs 모듈의 parse 메소드를 사용하여 갱신해준다
            db.query(`DELETE FROM topic WHERE author_id=?`,[post.id], function(error1, result1){
                if(error1){
                    throw error1;
                }
                db.query(`DELETE FROM author WHERE id=?`,[post.id], function(error2, result){
                    if(error2){
                        throw error2;
                    }
                    response.writeHead(302, {Location: `/author`});
                    response.end();
                })
            
            })
        });
}