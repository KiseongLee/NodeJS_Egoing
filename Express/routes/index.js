const express = require('express')
const router = express.Router() // router 메소드는 router 객체 리턴
var template = require('../lib/template.js');


//app.get('/', (req, res) => {res.send('Hello World!')})
//route, routing 
router.get('/', function(request, response) {
  
    var title = 'Welcome';
    var description = 'Hello, Node.js';
    var list = template.list(request.list);
    var html = template.HTML(title, list,
      `<h2>${title}</h2>
      <p>${description}</p>
      <img src="/images/hello.jpg" style="width:300px; display:block; margin-top:10px">`,
      `<a href="/topic/create">create</a>`
    );
    response.send(html);
   
  });

module.exports = router;