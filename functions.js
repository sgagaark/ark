let mysql = require('mysql'),
    moment = require('moment');
var connection = mysql.createConnection({
    host: '192.168.3.4',
    user: 'rong',
    password: 'ab22978084',
    database: 'ARK'
});
//新增使用者
addUserAccount = (userdata, completefunc) => {
    connection.query('INSERT INTO `user_account` SET ?', userdata, (error) => {
        if (error) { console.log('新增使用者失敗！'); throw error; }
        completefunc();
    });
};
//檢查使用者是否重複
checkUserAccount = (userdata, truefunc, falsefunc) => {
    connection.query(`Select email from user_account where email = "${userdata.email}"`, (error, rows, fields) => {
        if (error) { console.log('查詢資料失敗！'); throw error; }
        rows.length ? truefunc() : falsefunc();
    });
};
//取得使用者資料
getUserAccount = (email, completefunc) => {
    connection.query(`Select * from user_account where email = "${email}"`, email, (error, rows, fields) => {
        if (error) { console.log('取得使用者資料失敗！'); }
        completefunc(rows);
    });
};
//設定使用者最後登入日
setUserLogin = (email) => {
    connection.query(`UPDATE user_account SET last_login_date = "${moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')}" where email = "${email}"`, email, (error) => {
        if (error) { console.log('更新資料表失敗！'); }
        console.log(`更新使用者${email}最後登入日期${moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')}`);
        //completefunc();
    })
}
//寄出一艘船
addNewBoat = (boatdata, completefunc) => {
    connection.query('INSERT INTO `send_boat` SET ?', boatdata, (error) => {
        if (error) { console.log('新增船失敗！'); throw error; }
        connection.query(`SELECT MAX(boat_id) as 'boat_id' FROM send_boat`, (error, rows, fields) => {
            if (error) { console.log('取得最後一艘船ID失敗！'); throw error; }
            var nulldata = {
                boat_id: rows[0].boat_id,
                receive_user: 0,
                content: '',
                is_receive: 0,
                is_delete: 0
            };
            connection.query(`INSERT INTO receive_boat SET ?`, nulldata, (error) => {
                if (error) { console.log('新增預設回復船失敗！'); throw error; }
                completefunc();
            });
        });
    });
};
//取得自己寄出的船+回信
getUserSendBoat = (id, count, completefunc) => {
    connection.query(`
    SELECT 
        send_boat.boat_id,
        send_boat.title AS send_title,
        send_boat.content AS send_content,
        send_boat.send_time,
        send_boat.is_delete AS send_is_delete,
        send_boat.is_report AS send_is_report,
        receive_boat.receive_id,
        receive_boat.receive_user,
        receive_boat.content AS receive_content,
        receive_boat.receive_time,
        receive_boat.is_receive,
        receive_boat.is_delete AS receive_is_delete,
        (SELECT COUNT(*) FROM send_boat WHERE send_boat.send_user = ${id} limit ${count}) AS boat_rows
    FROM 
        send_boat,receive_boat 
    WHERE 
        receive_boat.boat_id = send_boat.boat_id AND
        receive_boat.boat_id IN(SELECT t.boat_id FROM( SELECT boat_id FROM send_boat WHERE send_user = ${id} limit ${count})as t) AND
        send_boat.is_delete = 0
    ORDER BY 
        send_boat.send_time DESC`, (error, rows, fields) => {
            if (error) { console.log('取得使用者寄出的船失敗！'); }
            completefunc(rows);
        });
};
//取得自己寄出船的回信
getReceiveBoat = (boatid, completefunc) => {
    connection.query(`Select * from receive_boat where boat_id = ${boatid} ORDER BY receive_time DESC`, (error, rows, fields) => {
        if (error) { console.log('取得使用者寄出船的回信失敗！'); }
        completefunc(rows);
    });
}
//每日取得新船
getUserNewBoat = (userid, completefunc) => {
    connection.query(`SELECT * FROM user_account where id = '${userid}'`, (error, account_rows, fields) => {
        if (error) { console.log('取得使用者資料！'); }
        if (moment(Date.now()).isSame(account_rows[0].last_boat_date, 'day')) {//取過了
            console.log('今日已經取過船！');
            completefunc(0);
            return;
        } else {
            connection.query(`SELECT * from send_boat where DATE(send_time) = '${moment(Date.now()).format('YYYY-MM-DD')}' AND is_delete != 1 AND send_user != ${userid} ORDER BY send_count limit 10`, (error, send_rows, fields) => {
                if (error) { console.log('取得今日10艘船失敗'); throw error; }
                if (!send_rows.length) {//沒有使用者送船
                    console.log('尚無使用者送船！');
                    completefunc(2);
                    return;
                }
                var data = [];
                for (var i = 0; i < send_rows.length; i++) {
                    data[i] = [null, send_rows[i].boat_id, userid, '', null, 0, 0];
                }
                connection.query(`INSERT INTO 
                receive_boat(receive_id,boat_id,receive_user,content,receive_time,is_receive,is_delete) VALUES ?`, [data], (error) => {
                        if (error) { console.log('新增新船至使用者失敗！'); throw error; }
                        for (var i = 0; i < send_rows.length; i++) {
                            connection.query(`Update send_boat SET send_count = send_count + 1 where boat_id = ${send_rows[i].boat_id}`, [send_rows.boat_id][data], (error) => {
                                if (error) { console.log('更新船的接收數失敗！'); throw error; }
                                //console.log(i + "," + send_rows.length);
                            });
                        }
                        connection.query(`Update user_account SET last_boat_date = "${moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')}" where id = "${userid}"`, (error) => {
                            if (error) { console.log('更新最後收船時間失敗！'); throw error; }
                        });
                        connection.query(`
                        SELECT 
                            send_boat.boat_id,
                            send_boat.title,
                            send_boat.content AS send_content,
                            send_boat.send_time,
                            receive_boat.receive_id,
                            receive_boat.receive_user,
                            receive_boat.content AS receive_content,
                            receive_boat.receive_time 
                        FROM 
                            send_boat,receive_boat 
                        WHERE 
                            send_boat.boat_id = receive_boat.boat_id AND 
                            receive_boat.receive_user = ${userid} AND 
                            DATE(create_time) = '${moment(Date.now()).format('YYYY-MM-DD')}' 
                        ORDER BY send_boat.send_time DESC 
                            limit 10`, (error, receive_data, fields) => {
                                if (error) { console.log('取得剛INSERT的10艘船失敗！'); throw error; }
                                completefunc(receive_data);
                                return;
                            });
                    });
            });
        }

    });



}
//取得舊配發的船
getUserOldBoat = (userid, completefunc) => {
    connection.query(`
    SELECT 
        send_boat.boat_id,
        send_boat.title,
        send_boat.content AS send_content,
        send_boat.send_time,
        receive_boat.receive_id,
        receive_boat.receive_user,
        receive_boat.content AS receive_content,
        receive_boat.receive_time 
    FROM 
        send_boat,receive_boat 
    WHERE 
        send_boat.boat_id = receive_boat.boat_id AND 
        receive_boat.receive_user = ${userid} 
    ORDER BY send_boat.send_time DESC 
    limit 10 `, (error, rows, fields) => {
            if (error) { console.log('取得配發的船失敗！'); throw error; }
            completefunc(rows);
        });
}

setReceiveBoat = (receiveid, boatdata, completefunc) => {
    connection.query(`UPDATE receive_boat SET ? where receive_id = ?`, [boatdata, receiveid], (error, fields) => {
        if (error) { console.log('更新回復船的內容失敗！'); }
        completefunc();
    });
}

//取得活動資訊
getNewsList = (completefunc) => {
    connection.query(`Select * from news ORDER BY datetime DESC`, (error, rows, fields) => {
        if (error) { console.log('無法取得活動資訊！'); }
        completefunc(rows);
    });
}

//取得活動詳細資訊
getNewsContent = (newsid, completefunc) => {
    connection.query(`Select * from news where id = ${newsid}`, (error, rows, fields) => {
        if (error) { console.log('無法取得活動資訊！'); }
        completefunc(rows);
    });
}

//取得活動詳細資訊
verifyAccount = (account, completefunc) => {
    connection.query(`UPDATE user_account SET enabled = 1 where email = '${account}'`, (error, fields) => {
        if (error) { console.log('無法啟用'); }
        completefunc();
    });
}