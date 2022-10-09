var sanitizeHTML = require('sanitize-html'); // sanitize html

module.exports = { // 모듈로 내보냄
    HTML:function (title, list, body, control){ //HTML은 html 코드를 함수(인자 4개)로 return하는 key
        return `<!doctype html>            
                <html>
                <head>
                  <title>WEB - ${title}</title>
                  <meta charset="utf-8">
                </head> 
                <body>
                  <h1><a href="/">WEB</a></h1>
                  <a href="/author">Author</a>
                  ${list}
                  ${control}
                  ${body}
                </body>
                </html>`
      /*
      헤드 - 1) title, meta charset(text를 어떻게 그려달라는지 말해주는 것, html 파일의 인코딩을 알려주는 코드)
      바디 - 1) h1 WEB(a태그) 2) list 3) control 4) body
      */
    },
    list:function (filelist){
        var list ='<ul>';
        var i=0;
        while(i<filelist.length){
            list = list + `<li><a href="/?id=${sanitizeHTML(filelist[i]).id}">${filelist[i].title}</a></li>`;
            i = i+1;
        }
        list = list+'<ul>';
        return list;
    },
    authorSelect:function(authors, author_id){
      var tag = '';
      var i = 0;
      while (i<authors.length){
        var selected ='';
        if(authors[i].id === author_id){
          selected = 'selected';
        }
        tag += `<option value="${authors[i].id}"${selected}>${sanitizeHTML(authors[i].name)}</option>`;
        i++;
      }
      return `
        <select name="author">
          ${tag}
        </select>
      `
    },
    authorTable:function(authors){
      var tag = `<table> 
                  <tr>
                        <td>title</td><td>profile</td><td>update</td><td>delete</td>
                  </tr>`
            var i=0;
            while(i<authors.length){
                
                tag += 
                    `
              
                    <tr>
                        <td>${sanitizeHTML(authors[i].name)}</td> 
                        <td>${sanitizeHTML(authors[i].profile)}</td>
                        <td><a href="/author/update?id=${authors[i].id}">update</a></td> 
                        <td>
                            <form action="/author/delete_process" method="post">
                                <input type="hidden" name="id" value="${authors[i].id}">
                                <input type="submit" value="delete">
                            </form>
                        </td>
                    </tr>
                
                    `
                i++;
            }
          tag += `</table>`
            return tag;
    }
}

