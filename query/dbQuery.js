const db = require('../config/dbConfig');

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


const menuClick = (data) => {
    return new Promise((res, rej)=> {
        let row ='menu_id, name, inform, price, menu_url'
        db.connection.query(`SELECT ${row} FROM menu WHERE menu_id=?`, [data], (err, db_data) =>{
            if(err) rej(err);
            else{
                res({"result":db_data});
            }
        });
    });
}

const setClick = () => {
    return new Promise((res, rej)=> {
        let row ='menu_option_id, category, name, price'
        db.connection.query(`SELECT ${row} FROM menu_option`, (err, db_data) =>{
            if(err) rej(err);
            else{
                res({"result":db_data});
            }
        });
    });
}

module.exports = {
    login,
    category,
    menuClick,
    setClick
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