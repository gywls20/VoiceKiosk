const db = require('../config/dbConfig');




//주문완료 / 상태 1로 바꾸기
const order_number_status = (order_number_id) => {
    console.log("db:"+order_number_id);  
    db.connection.query('UPDATE order_number SET status = TRUE WHERE order_number_id = ?;', [order_number_id],  (err, db_data) => {
        if(err) console.error(err);
        else{
            return("주문완료");
        }

    });

}

//장바구니 주문번호 와 주문리스트 저장
const order_number_save = (user,total_price,menu) => {
    return new Promise((res, rej)=> {
        console.log("db:"+user);   
        console.log("db:"+total_price);
        console.log("db:"+menu);
        db.connection.query('insert into `order_number` (user_id,total_price) values (?,?);', [user,total_price], (err, db_data) => { //order_number저장
            if(err) rej(err);
            else{
                console.log(`inserted_order_number_id: ${db_data.insertId}`);
                const inserted_order_number_id=db_data.insertId;
                menu.forEach(item => {
                    db.connection.query('insert into order_list (order_number, menu_id, menu_option_id1, menu_option_id2) values (?,?,?,?);', [inserted_order_number_id,item.menu_id,item.option_id1,item.option_id2], (err, db_data) => { //order_list저장
                        if(err) rej(err);
                        else{
                            res({"order_number_id":inserted_order_number_id})
                        }
                    })
                });    
            }
        })
    })
}


//로그인 토큰받아 id넘겨주기 없으면 만들기
const login = (data) => {
    return new Promise((res, rej)=> {
        console.log(data);
        db.connection.query('SELECT * FROM user WHERE user_token = ?', [data], (err, db_data) =>{
            if(err) rej(err);
            // else{token_check(db_data)} //사용 안함
            else if(db_data[0]==null)
            { //토큰이 없는 경우
                db.connection.query('insert into user (user_token) values (?);', [data],(err, db_data) => {
                    if(err) rej(err);
                    else {
                        console.log(`Last inserted ID: ${db_data.insertId}`);
                        res({"user_id":db_data.insertId});
                    }
                })
            }
            else{ //토큰이 있는 경우
                db.connection.query('SELECT user_id FROM user WHERE user_token = ?', [data], (err, db_data) =>{
                    if(err) rej(err);
                    else res(db_data[0]);
                })
            }
        })
    })
}

//카테고리 정렬
const category = (data) => {
    return new Promise((res, rej)=> {
        let row ='menu_id, name, price, menu_url'
        db.connection.query(`SELECT ${row} FROM menu WHERE category=?`, [data], (err, db_data) =>{
            if(err) rej(err);
            else{
                res({"result":db_data});
            }
        });
    });
}

//메뉴클릭
const menuClick = (data) => {
    return new Promise((res, rej)=> {
        let row ='inform'
        db.connection.query(`SELECT ${row} FROM menu WHERE menu_id=?`, [data], (err, db_data) =>{
            if(err) rej(err);
            else{
                res(db_data);
            }
        });
    });
}


//셋트일때 옵션정보-1
const dessertOption = () => {
    return new Promise((res, rej)=> {
        let row ='menu_option_id, category, name, price'
        db.connection.query(`SELECT ${row} FROM menu_option WHERE category='dessert'`, (err, db_data) =>{
        if(err) rej(err);
        else{
            res(db_data);
        }
        });
    });
}
//셋트일때 옵션정보-2
const drinkOption = () => {
    return new Promise((res, rej)=> {
        let row ='menu_option_id, category, name, price'
        db.connection.query(`SELECT ${row} FROM menu_option WHERE category='drink'`, (err, db_data) =>{
        if(err) rej(err);
        else{
            res(db_data);
        }
        });
    });
}

//전체 주문기록 유저별
const allorder = (data) => {
    return new Promise((res, rej)=> {
        let row ='order_number_id, total_price, created_date'
        db.connection.query(`SELECT ${row} FROM order_number WHERE status=TRUE AND user_id=?`,[data], (err, db_data) =>{
        if(err) rej(err);
        else{
            // 주문내역 메뉴 이름 보이기
            // db_data.forEach(item =>{
            //     console.log(item.order_number_id);
            //     db.connection.query(`SELECT ${   } FROM order_list WHERE order_number=?`,[item.order_number_id], (err, db_data) =>{
            //         if(err) rej(err);
            //         else{

            //         }
            //     });
            // });
            res(db_data);
        }
        });
    });
}

module.exports = {
    login,
    category,
    menuClick,
    dessertOption,
    drinkOption,
    order_number_save,
    order_number_status,
    allorder
};








function token_check(db_data) {

    if(db_data[0]==null)
    { //토큰이 없는 경우
        db.connection.query('insert into user (user_token) values (?);', [data],(err, db_data) => {
            if(err) rej(err);
            else {
                    token_check(err, db_data)    
            }
        })
    }
    else{ //토큰이 있는 경우
        db.connection.query('')
    }

}




//qr 데이터 받아서 db저장
const qr_save = (user,total_price,msg) => {
        console.log("db:"+user);   
        console.log("db:"+total_price);
        console.log("db:"+msg);
        db.connection.query('insert into `order_number` (user_id,total_price) values (?,?);', [user,total_price], (err, db_data) => { //order_number저장
            if(err) console.error(err);
            else{
                console.log(`inserted_order_number_id: ${db_data.insertId}`);
                const inserted_order_number_id=db_data.insertId;
                msg.forEach(item => {
                    db.connection.query('insert into order_list (order_number, menu_id, menu_option_id1, menu_option_id2) values (?,?,?,?);', [inserted_order_number_id,item.menu_id,item.option_id1,item.option_id2], (err, db_data) => { //order_list저장
                        if(err) console.error(err);
                        else{
                            
                        }
                    })
                });    
            }
        })
}