const express = require('express');
const router = express.Router();
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);


// 채팅 기록 
const chatHistory = {};

io.on("connection", (socket) => {
	// socket.on -> 데이터 수신, socket.emit 데이터 전송
	socket.on('chat', (arg) => {
		socket.sessionId = socket.sessionId || arg.sessionId;

        chatHistory[socket.sessionId] = chatHistory[socket.sessionId] || [];
        chatHistory[socket.sessionId].push(arg);
		io.to(arg.room).emit('chat', arg);
	});
	
	/** 방 참여 */
	socket.on('join', (room) => {
		console.log(room + "에 참여");
		socket.join(room);
	});
	
	// 방을 닫을 때 
	let previousRooms = [];
	socket.on("disconnecting", () => {
		
	});
	// 방이 닫혔을 때 
	socket.on("disconnect", () => {
        /** 방이 닫히면 현재 접속자 대화 기록 후속 처리 */
        console.log(chatHistory[socket.sessionId]);

        /** 후속 처리 */
        delete chatHistory[socket.sessionId];
        console.log("disconnect")
	});
});

router.get("/", (req, res, next) => {



    return res.render("chat")
})


router.get("/room", (req, res, next) => {

    if (!req.query.room || !req.query.userNm) {
        return res.send("<script>alert('방이름과 사용자명을 모두 입력하세요.');history.back();</script>");
    }

   return res.render("chat_room")
})


module.exports = router;