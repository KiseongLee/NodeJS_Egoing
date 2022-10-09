//https://velog.io/@joo0/nodejs-mysql-%EC%97%B0%EA%B2%B0-%EC%98%A4%EB%A5%98-ERNOTSUPPORTEDAUTHMODE
var mysql = require("mysql2");
// 비밀번호는 별도의 파일로 분리해서 버전관리에 포함시키지 않아야 합니다.
var connection = mysql.createConnection({
  host: "localhost",
  user: "nodejs",
  password: "sung6265",
  database: "opentutorials",
});

connection.connect();

connection.query("SELECT * FROM topic", function (error, results, fields) {
  if (error) {
    console.log(error);
  }
  console.log(results);
});

connection.end();
