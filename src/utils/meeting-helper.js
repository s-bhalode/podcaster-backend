const chatRoomService = require('../middleware/chatRoomService');
const {meetingPayloadEnum} = require('../utils/meeting-payload.enum');


const joinMeeting = async (meetingId, socket, meetingServer, payload) => {
    const {userId, user_name} = payload.data;

    chatRoomService.isMeetingPresent(meetingId, async (err, results) => {
        if(err && !results){
            sendMessage(socket, {
                type: meetingPayloadEnum.NOT_FOUND
            });
        }

        if(results){
            addUser(socket, {meetingId, userId, user_name}).then((result) => {
                if(result){
                    sendMessage(socket, {
                        type: meetingPayloadEnum.JOINED_MEETING, data: {
                            userId
                        }
                    })

                    broadCastUsers(meetingId, socket, meetingServer, {
                        type: meetingPayloadEnum.USER_JOINED, 
                        data: {
                            userId,
                            user_name,
                            ...payload.data
                        }
                    })
                }
            }, (err) => {
                console.log(err);
            })
        }
    })
}

const forwardConnectionRequest = (meetingId, socket, meetingServer, payload) => {
    const {userId, otherUserId, user_name} = payload.data;

    let model = {
        meetingId: meetingId,
        userId: otherUserId
    };

    chatRoomService.getMeetingUser(model, (err, results) => {
        if(results){
            let sendPayload = JSON.stringify({
                type: meetingPayloadEnum.CONNECTION_REQUEST, 
                data: {
                    userId,
                    user_name,
                    ...payload.data
                }
            })

            meetingServer.to(results.socketId).emit('message', sendPayload);
        }
    })
    
}

const forwardIceCandidate = (meetingId, socket, meetingServer, payload) => {
    const {userId, otherUserId, candidate} = payload.data;

    let model = {
        meetingId: meetingId,
        userId: otherUserId
    };

    chatRoomService.getMeetingUser(model, (err, results) => {
        if(results){
            let sendPayload = JSON.stringify({
                type: meetingPayloadEnum.ICECANDIDATE, 
                data: {
                    userId,
                    candidate
                }
            })

            meetingServer.to(results.socketId).emit('message', sendPayload);
        }
    })
    
}

const forwardOfferSDP = (meetingId, socket, meetingServer, payload) => {
    const {userId, otherUserId, sdp} = payload.data;

    let model = {
        meetingId: meetingId,
        userId: otherUserId
    };

    chatRoomService.getMeetingUser(model, (err, results) => {
        if(results){
            let sendPayload = JSON.stringify({
                type: meetingPayloadEnum.OFFER_SDP, 
                data: {
                    userId,
                    sdp
                }
            })

            meetingServer.to(results.socketId).emit('message', sendPayload);
        }
    }) 
}

const forwardAnswerSDP = (meetingId, socket, meetingServer, payload) => {
    const {userId, otherUserId, sdp} = payload.data;

    let model = {
        meetingId: meetingId,
        userId: otherUserId
    };

    chatRoomService.getMeetingUser(model, (err, results) => {
        if(results){
            let sendPayload = JSON.stringify({
                type: meetingPayloadEnum.ANSWER_SDP, 
                data: {
                    userId,
                    sdp
                }
            })

            meetingServer.to(results.socketId).emit('message', sendPayload);
        }
    }) 
}

const userLeft = (meetingId, socket, meetingServer, payload) => {
    const {userId} = payload.data;

    broadCastUsers(meetingId, socket, meetingServer, {
        type: meetingPayloadEnum.USER_LEFT,
        data: {
            userId: userId
        }
    });
}

const endMeeting = (meetingId, socket, meetingServer, payload) => {
    const {userId} = payload.data;

    broadCastUsers(meetingId, socket, meetingServer, {
        type: meetingPayloadEnum.MEETING_ENDED,
        data: {
            userId: userId
        }
    });

    chatRoomService.getAllMeetingUsers(meetingId, (err, results) => {
        for(let i=0; i<results.length; i++){
            const meetingUser = results[i];
            meetingServer.sockets.connected[meetingUser.socketId].disconnect();
        }
    })
}

const forwardEvent = (meetingId, socket, meetingServer, payload) => {
    const {userId} = payload.data;

    broadCastUsers(meetingId, socket, meetingServer, {
        type: payload.type,
        data: {
            userId: userId,
            ...payload.data
        }
    });
}

const addUser = (socket, {meetingId, userId, user_name}) => {
    let promise = new Promise((resolve, reject) => {
        chatRoomService.getMeetingUser({meetingId, userId}, (err, results) => {
            if(!results){
                var model = {
                    socketId : socket.id,
                    meetingId: meetingId,
                    userId: userId,
                    joined: true,
                    name : user_name,
                    isAlive: true
                }

                chatRoomService.joinMeeting(model, (err, results) => {
                    if(results){
                        resolve(true);
                    }
                    if(err){
                        reject(err);
                    }
                })
            }else{
                chatRoomService.updateMeetingUser({
                    userId: userId,
                    socketId: socket.id
                }, (err, results) => {
                    if(results){
                        resolve(true);
                    }
                    if(err){
                        reject(err);
                    }
                })
            }
        })
    })
    return promise;
}


const sendMessage = (socket, payload) => {
    socket.send(JSON.stringify(payload));
}


const broadCastUsers = (meetingId, socket, meetingServer, payload) => {
    socket.broadCast.emit("message", JSON.stringify(payload));
}



module.exports = {
    joinMeeting,
    forwardConnectionRequest,
    forwardIceCandidate,
    forwardOfferSDP,
    forwardAnswerSDP,
    userLeft,
    endMeeting,
    forwardEvent
}