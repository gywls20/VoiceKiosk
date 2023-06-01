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

//메뉴 클릭-정보보내기
router.get('/menuClick', async (req, res)=> {
  let menuresult = await query.menuClick(req.query.menu_id);
  let DessertOptionResult = await query.dessertOption();
  let DrinkOptionResult = await query.drinkOption();
  let result = {
    "menu" : menuresult,
    "dessert_option": DessertOptionResult,
    "drink_option": DrinkOptionResult
  }
  res.send(result);
});


// 장바구니 주문버튼 클릭
router.post('/cart', async (req, res) => {
  const { user_id, total_price, menu } = req.body;

  // order_number_save 함수 호출
  let result = await query.order_number_save(user_id, total_price, menu);
  
  res.send(result);
});


//유저별 전체 주문기록
router.get('/allorder', async (req, res)=> {
  let result = await query.allorder(req.query.user_id);
  res.send(result);
});


//아두이노 소켓연결  web으로 완료 화면 보내기
router.get('/kiosk', function(req, res, next) {

  res.render('kiosk');
});



module.exports = router;
