var express = require('express');
var router = express.Router();
const query = require('../query/dbQuery');

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });


//로그인 토큰받아 id넘겨주기
router.post('/login', async (req,res)=>{
  let result = await query.login(req.body.token);
  console.log(result);
  res.send(result);
});

//카테고리 - 카테고리로 나누고 이름,가격 보내주기
router.get('/category', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//유저별 전체 주문기록


//주문 완료되면 앱으로 알림



module.exports = router;
