const express = require("express");
const dotenv = require("dotenv");
const nunjucks = require("nunjucks");
const path = require("path");
const methodOverride = require("method-override");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const morgan = require("morgan");
const { sequelize } = require("./models");
const { loginSession } = require("./middlewares/login_session");
const chat = require('./middlewares/chat');
const app = express();

const server = require('http').createServer(app);
const io = require('socket.io')(server);
chat(io); // 채팅 미들웨어


/** 관리자 라우터 */
const adminRouter = require("./routes/admin");

/** 라우터 */
const memberRouter = require("./routes/member");
const mainRouter = require("./routes/main");
const boardRouter = require("./routes/board");


dotenv.config();






app.set("port", process.env.PORT || 3000);
app.set("view engine", "html");
nunjucks.configure("views", {
    express:app,
    watch:true,
})

/** DB 연결 */
sequelize.sync({force:false})
            .then(() =>{
                console.log("데이터 베이스 연결 성공");
            })
            .catch((err) =>{
                console.error(err);
            })


app.use(morgan("dev"));
/** body - parser */
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
        resave : false,
        saveUninitialized : true, 
        secret : process.env.COOKIE_SECRET,
        cookie : {
            httpOnly : true,
            secure : false,
        },
        name : "yjhsession",

}));
app.use(loginSession);

/**관리자 라우터 등록 */
app.use("/admin", adminRouter);

/** 라우터 등록 */
app.use("/member", memberRouter);
app.use("/", mainRouter);
app.use("/board", boardRouter);


app.get("/chat", (req, res, next) => {
    res.render("chat");
})

app.get("/chat/room", (req, res, next) => {

    if (!req.query.room || !req.query.userNm) {
		return res.send("<script>alert('방이름과 사용자명을 모두 입력하세요.');history.back();</script>");
	}
	return res.render('chat_room');
})



// 없는 페이지 미들웨어 처리
app.use((req, res, next) => {
    const error = new Error(`${req.method} ${req.url} 는 없는 페이지 입니다.`);
    error.status = 404;
    next(error);
})


// 에러 페이지 처리 미들웨어 처리
app.use((err, req, res, next) => {
    res.locals.error = err;
    res.status(err.status || 500).render("error");
})





server.listen(app.get("port"), ()=>{
    console.log(app.get("port"), "번에서 서버 대기중");
})