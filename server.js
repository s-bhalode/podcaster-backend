const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const userRouter = require('./src/routes/user-routes');
const podcastRouter = require('./src/routes/podcast-routes');
const homerouter = require('./src/routes/home-routes');
const adminrouter = require('./src/routes/admin-routes');
const Scheduler = require('./src/controller/schedule-controller')
const chatRoomRouter = require('./src/routes/chat-room-routes');
const cron = require('node-cron');
const FCM = require('fcm-node');
const admin = require("firebase-admin");
const serviceAccount = require("./onpods-firebase-adminsdk.json");
const awsEmailNotification = require('./src/services/ses');


// awsEmailNotification.sendOTPviaEmail('sbhalode20@gmail.com', 123456)

dotenv.config({path: './.env'});
const PORT = process.env.PORT;
require('./src/services/db-connection');
const app = express();
const server = require('http').createServer(app);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const {initMeetingServer} = require('./meeting-server');
initMeetingServer(server);

// const io = require('socket.io')(server, {
//     cors: {
//         origin: 'http://localhost:3000',
//         methods: ['GET', 'POST'],
//     },
// })


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors({
    origin : 'http://localhost:3000',
    credentials : true,
    optionsSuccessStatus: 200
}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use((req, res, next) => {
    res.header(
        "Access-Control-Allow-Header",
        "x-access-token, Origin, Content-type, Accept"
    );
    next();
});
userRouter.use(cookieParser());
app.use(userRouter);
app.use(podcastRouter);
app.use(chatRoomRouter);
app.use(homerouter);
app.use(adminrouter);

app.get('/', (req, res) => {
    return res.status(202).json("Hello Podcasters!");
})


// Sockets
// const socketUserMap = {};
// io.on('connection', (socket) => {
//     console.log('New Connection', socket.id);
//     socket.on(ACTIONS.JOIN, ({roomId, user}) => {
//         socketUserMap[socket.id] = user;
//         const clients = Array.from(io.socktes.adapter.rooms.get(roomId) || []);
//         clients.forEach((clientId) => {
//             io.to(clientId).emit(ACTIONS.ADD_PEER, {
//                 peerId : socket.id,
//                 createOffer : false,
//                 user
//             });
//             socket.emit(ACTIONS.ADD_PEER, {
//                 peerId : clientId,
//                 createOffer: true,
//                 user: socketUserMap[clientId]
//             })
//         })
//         socket.join(roomId);
//     })
//     socket.on(ACTIONS.RELAY_ICE, ({peerId, icecandidate}) => {
//         io.to(peerId).emit(ACTIONS.ICE_CANDIDATE, {
//             peerId: socket.id,
//             icecandidate
//         })
//     })
//     socket.on(ACTIONS.RELAY_SDP, ({peerId, sessionDescription}) => {
//         peerId: socket.id,
//         sessionDescription
//     })
//     socket.on(ACTIONS.MUTE, ({roomId, userId}) => {
//         const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
//         clients.forEach((clientId) => {
//             io.to(clientId).emit(ACTIONS.MUTE, {
//                 peerId: socket.id,
//                 userId
//             })
//         })
//     })
//     socket.on(ACTIONS.MUTE_INFO, ({userId, roomId, isMute}) => {
//         const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
//         clients.forEach((clientId) => {
//             if(clientId != socket.id){
//                 console.log('mute info');
//                 io.to(clientId).emit(ACTIONS.MUTE_INFO, {
//                     userId,
//                     isMute
//                 });
//             }
//         });
//     });
//     const leaveRoom = () => {
//         const {rooms} = socket;
//         Array.from(rooms).forEach((roomId) => {
//             const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
//             clients.forEach((clientId) => {
//                 io.to(clientId).emit(ACTIONS.REMOVE_PEER, {
//                     peerId: socket.id,
//                     userId: socketUserMap[socket.id]?.id
//                 })
//             })
//             socket.leave(roomId);
//         })
//         delete socketUserMap[socket.id];
//     }
//     socket.on(ACTIONS.LEAVE, leaveRoom);
//     socket.on('disconnecting', leaveRoom);
// })


server.listen(PORT, () => {
    console.log(`Server running at port no. : ${PORT}`);
})
