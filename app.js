let mysql = require('mysql'),
    express = require('express'),
    moment = require('moment'),
    crypto = require('crypto'),
    session = require('express-session'),
    cookieParser = require('cookie-parser'),
    ejs = require('ejs'),
    app = express(),
    favicon = require('serve-favicon'),
    path = require('path'),
    bodyParser = require('body-parser'),
    validator = require("email-validator"),
    nodemailer = require("nodemailer"),
    smtpTransport = require('nodemailer-smtp-transport'),
    port = 80;
require('./functions');

//session設定
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: "ark",
    cookie: { maxAge: 60 * 1000 * 30 }
}));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname + '/')));
app.use(favicon('images/favicon.ico'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//email資料
let transporter = nodemailer.createTransport(smtpTransport({
    service: 'gmail',
    auth: {
        user: 'g110534021@grad.ntue.edu.tw',
        pass: 'rong1234'
    }
}));

let registerMail = {
    from: 'ark@gmail.com',
    to: '',
    subject: 'ark註冊認證信',
    html: '',
}

//登入後css修改
let loginCollect = {
    navsatus: ".logout_none",
}



//檢查使用者登入機制
function checkUserLogin(req) {
    req.session.isLogin ? loginCollect.navsatus = ".login_none" : loginCollect.navsatus = ".logout_none";
}



//test
app.get('/test', function (req, res) {
    //console.log(JSON.stringify(boatdata));
    var receiveboat = [];
    res.render(__dirname + '/views/test', { moment, loginCollect, boatdata, receiveboat });
});

//根目錄首頁
app.get('/', function (req, res) {
    checkUserLogin(req);
    res.render(__dirname + '/index', { loginCollect });
});

//一般瀏覽GET功能
app.get('/:page', function (req, res) {
    checkUserLogin(req);
    //免登入
    switch (req.params.page) {
        case 'index':        //首頁
            res.redirect('/');
            break;
        case 'registered':   //註冊頁面
            var error = 0;
            error = req.param('error');
            res.render(__dirname + '/login/registered', { loginCollect, error });
            break;
        case 'login':        //登入
            var ok = 0, error = 0;
            ok = req.param('ok');
            error = req.param('error');
            res.render(__dirname + '/login/login', { loginCollect, ok, error });
            break;
        case 'login_forgot': //忘記密碼
            res.render(__dirname + '/login/login_forgot', { loginCollect });
            break;

        case 'succeed':      //信箱驗證完成
            res.render(__dirname + '/login/succeed', { loginCollect });
            break;
        case 'information':      //公告
            newsdata = [];
            getNewsList((data) => {
                if (!data.length) {
                    console.log('取得公告列表失敗');
                    res.redirect(ErrorRedirect);
                } else {
                    newsdata = data;
                    res.render(__dirname + '/information/information', { loginCollect, newsdata, moment });
                }
            });
            break;
        case 'logout':
            req.session.destroy();
            res.redirect('/');
            break;
        case 'information_more':      //公告內容
            let id = req.param('id');
            getNewsContent(id, (data) => {
                if (!data.length) {
                    console.log('取得公告失敗');
                    res.redirect(ErrorRedirect);
                    return;
                } else {
                    newsdata = data;
                    res.render(__dirname + '/information/more/information_more', { loginCollect, newsdata, moment });
                }
            });
            break;
        case 'emailverify':      //公告內容
            let email = req.param('email');
            verifyAccount(email, () => {
                res.redirect('/login?ok=1');
                return;
            });
            break;
        default: {//需登入
            var uid;
            //驗證登入
            if (req.session.isLogin) {
                uid = req.session.userdata.id;
            } else {
                res.redirect('/login');
                return;
            }
            switch (req.params.page) {
                case 'receive':      //收船
                    getUserOldBoat(uid, (receive_data) => {
                        getUserNewBoat(uid, (newReceive_data) => {
                            var boatstatus = false;
                            if (newReceive_data == 0 || newReceive_data == 2) {//取過船
                                boatstatus = true;
                            }
                            // console.log(receive_data);
                            res.render(__dirname + '/receive/receive', { moment, loginCollect, boatstatus, receive_data, newReceive_data });
                        });
                    });
                    break;
                case 'send':         //送船
                    getUserSendBoat(uid, 10, (data) => {
                        var boatdata = [];//儲存主船資料
                        var receiveboat = [];//儲存主船回復資料
                        var hasResponse = [];//沒有回覆的主船
                        if (data.length != 0) {
                            var mainBoatSerial = 0;
                            var compareingID = data[0].boat_id;
                            receiveboat[0] = [];
                            boatdata[0] = data[0];
                            //receiveboat[0].push(data[0]);
                            // for (var i = 0; i < boatdata.length; i++) {
                            //     getReceiveBoat(boatdata[i].boat_id, (data) => {
                            //         receiveboat.push(data);
                            //     });
                            // }
                            for (var i = 0; i < data.length; i++) {
                                if (!(data[i].boat_id == compareingID)) {
                                    //console.log(JSON.stringify(data[i]) + "\n");
                                    mainBoatSerial++;
                                    compareingID = data[i].boat_id;
                                    boatdata[mainBoatSerial] = data[i];
                                    receiveboat[mainBoatSerial] = [];
                                }
                                if (Boolean(data[i].is_receive)) {//有回復
                                    hasResponse[mainBoatSerial] = 1;
                                    // console.log(data[i]);
                                }
                                receiveboat[mainBoatSerial].push(data[i]);
                            }
                            // console.log(JSON.stringify(hasResponse));
                            // for (var i = 0; i < receiveboat.length; i++) {
                            //     console.log(receiveboat.length + "," + receiveboat[i].length);
                            // }
                        }
                        res.render(__dirname + '/send/send', { moment, loginCollect, boatdata, receiveboat, hasResponse });

                    });
                    break;
                default:
                    res.redirect('/');
                    break;
            }
            break;
        }
    }

});


//POST功能
app.post('/:page', function (req, res) {
    checkUserLogin(req);

    switch (req.params.page) {
        case 'mail_registered': //註冊後跳轉至信箱驗證
            let content;
            var reqestData = { //傳入的資料
                id: null,
                email: req.body.id,
                passwd: base64encode(req.body.password),
                last_login_date: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
                last_boat_date: null
            };
            if (!validator.validate(reqestData.email)) {
                res.redirect('/registered?error=1'); //帳號格式錯誤
                return;
            }
            registerMail.to = reqestData.email;
            registerMail.html =
                `<h2>ARK註冊認證信</h2><p>請點擊以下連結認證您的email</p><a href="http://www.rongserver.com/emailverify?email=${reqestData.email}">連結</a>`;


            //查詢是否註冊過
            checkUserAccount(reqestData, () => {
                console.log(`Email:${reqestData.email}已經註冊過`);
                res.redirect('/registered?error=2'); //已經註冊過
            }, () => {
                //新增使用者帳號
                addUserAccount(reqestData, () => {
                    console.log(`Email:${reqestData.email}註冊成功`);
                    transporter.sendMail(registerMail, function (error, info) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log(`${reqestData.email}的註冊信已發送`);
                        }
                    });
                    res.render(__dirname + '/login/mail_registered', { loginCollect });
                });
            });
            break;
        case 'login_forgot_re': //忘記密碼跳轉
            res.render(__dirname + '/login/login_forgot_re', { loginCollect });
            break;
        case 'log':             //處理登入程序
            var ErrorRedirect = "/login";
            var CompleteRedirect = "/send";
            getUserAccount(req.body.email, (data) => {
                if (!data.length) {
                    console.log('取得使用者資料失敗');
                    res.redirect(ErrorRedirect);
                } else {
                    if (data[0].passwd != base64encode(req.body.password)) {
                        res.redirect(ErrorRedirect);
                        return;
                    } else {
                        if (data[0].enabled == 0) {
                            res.redirect('/login?error=1');
                            return;
                        }

                        console.log('密碼正確，登入成功');
                        setUserLogin(req.body.email);
                        req.session.userdata = {
                            id: data[0].id,
                            email: data[0].email,
                            enabled: data[0].enabled,
                            last_boat_date: data[0].last_boat_date,
                        };
                        req.session.isLogin = true;
                        res.redirect(CompleteRedirect);
                    }
                }
            });
            break;
        case 'sendboat':        //處理送船程序from send
            var CompleteRedirect = "/send";
            var uid = req.session.userdata.id;
            //船的資料
            var boatData = {
                send_user: uid,
                title: req.body.title,
                content: req.body.content,
                send_time: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')
            };
            //新增一艘船
            addNewBoat(boatData, () => {
                console.log(`標題:'${boatData.title}'的船送出成功`);
                res.redirect(CompleteRedirect);
            });

            break;
        case 'replyboat':       //處理回復程序from receive
            var CompleteRedirect = "/receive";
            //回復船的資料
            var boatData = {
                content: req.body.content,
                receive_time: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
                is_receive: 1
            };

            receive_id = req.body.receive_id;
            //新增回覆船
            setReceiveBoat(receive_id, boatData, () => {
                console.log(`receiveID為:'${receive_id}'的船送出成功`);
                res.redirect(CompleteRedirect);
            });

            break;
        default:
            res.redirect('/');
            break;
    }
});

function resStatus(status) {
    var data = {
        status: status
    }
    return data;
}

//API功能
app.post('/ark/api/:action', function (req, res) {
    var WebAction = req.params.action;
    let content;
    var reqestData = req.body;

    var responseData = { //傳出的資料
        status: false,
        data: null
    }
    switch (WebAction) {
        case 'RegisterAccount':
            var RegisterData = { //註冊
                id: null,
                email: reqestData.email,
                passwd: base64encode(reqestData.passwd),
                last_login_date: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
                last_boat_date: null
            };
            //查詢是否註冊過
            checkUserAccount(RegisterData, () => {
                console.log(`Email:${reqestData.email}已經註冊過`);
                content = JSON.stringify(resStatus(false));
                res.send(content);
            }, () => {
                //新增使用者帳號
                addUserAccount(RegisterData, () => {
                    content = JSON.stringify(resStatus(true));
                    console.log(`Email:${reqestData.email}註冊成功`);
                    res.send(content);
                });
            });
            break;
        case 'UserLogin':
            getUserAccount(reqestData.email, (data) => {
                if (!data.length) {
                    console.log('取得使用者資料失敗');
                    responseData.status = false;
                    res.send(JSON.stringify(responseData));
                } else {
                    console.log('登入中');
                    if (data[0]['passwd'] == base64encode(reqestData.passwd)) {
                        responseData.data = data;
                        responseData.status = true;
                    } else {
                        responseData.status = false;
                    }
                    res.send(JSON.stringify(responseData));
                }
            });
            break;
        case 'SendBoat':
            console.log(reqestData);
            getUserAccount(reqestData.email, (data) => {
                if (!data.length) {
                    console.log('新增船失敗');
                    responseData.status = false;
                    res.send(JSON.stringify(responseData));
                } else {
                    console.log('新增船成功');
                    responseData.data = data;
                    responseData.status = true;
                    res.send(JSON.stringify(responseData));
                }
            });
            break;
    }
});

function base64encode(text) {
    return crypto.createHash('md5').update(text).digest('base64');
}
app.listen(port);
console.log(`Server Running on port:${port}`);
