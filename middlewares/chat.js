module.exports = (io) => {
    io.on("connection", (socket) => {
        socket.on('chat', (arg) => {
            io.to(arg.room).emit('chat', arg);
        });

        /** 방 참여 */
        socket.on('join', (room) => {
            socket.join(room);
        });

        socket.on("disconnecting", () => {
	
        });

        socket.on("disconnect", () => {

        });
    });

   
};