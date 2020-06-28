// var WebSocketServer = require("ws").Server;
// var wss = new WebSocketServer({ port : 3000});

// //연결이 완료 되면 클라이언트에 메세지를 전송하고 클라이언트로부터 메세지를 수신함
// wss.on("connection", function(ws) {
//     ws.send("hello ! i'm a server");
//     ws.on("message", function(msg) {
//         console.log("received : %s", msg);
//     })
// })


// 위의 코드는 html socket 통신 예제이므로 아래부터는 socket.io라이브러리를 이용하여 다시 작성했다

var app = require("express")();
var server = require("http").createServer(app);
// http server를 socket.io server로 업그레이드 한다.

var io = require("socket.io")(server);


// localhost:3000으로 서버에 접속하면 클라이언트로 index.html을 전송한다.
app.get("/", function(req, res) {
    res.sendFile(__dirname + "/index.html");
})

//connection event handler
//connection이 수립되면 event handler function의 인자로 socket이 들어온다.

io.on("connection", function(socket) {
    //접속한 클라이언트의 정보가 수신되면,
    socket.on("login", function(data){
        console.log("client logged in:\n name:" + data.name + "\n userid: " + data.userid);

        //socket에 클라이언트 정보를 저장한다.
        socket.name = data.name;
        socket.userid = data.userid;

        //접속된 모든 클라이언트에게 메세지를 전송한다.
        io.emit("login", data.name);
    });

    //클라이언트로부터 메세지가 수신되면
    socket.on("chat", function(data) {
        console.log("message from %s: %s", socket.name, data.msg);

        var msg = {
            from: {
                name: socket.name,
                userid: socket.userid
            },
            msg: data.msg
        };

        //메세지를 전송한 클라이언트를 제외한 모든 클라이언트에게 메세지를 전송한다.
        socket.broadcast.emit("chat", msg);
    });

    // force client disconnect from server
    socket.on("forceDisconnect", function() {
        socket.disconnect();
    });

    socket.on("disconnect", function() {
        console.log("user disconnect: ", + socket.name);
    })
})


server.listen(3000, function(){
    console.log("socket Io server listening on port 3000");
});