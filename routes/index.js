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
router.get('/category', async (req, res)=> {
  let result = await query.category(req.query.category);
  res.send(result);
});

router.get('/menuClick', async (req, res)=> {
  let result = await query.menuClick(req.query.menu_id);
  res.send(result);
});

router.get('/setClick', async (req, res)=> {
  let result = await query.setClick();
  res.send(result);
});

//유저별 전체 주문기록


//소켓연결로 주문정보받기 주문 완료되면 앱으로 알림



module.exports = router;
