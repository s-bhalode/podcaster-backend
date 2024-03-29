const meetingHelper = require('./src/utils/meeting-helper');
const {meetingPayloadEnum} = require('./src/utils/meeting-payload.enum');


const parseMessage = (msg) => {
    try{
        const payload = JSON.parse(msg);
        return payload;
    }catch(err){
        return {type: meetingPayloadEnum.UNKNOWN}
    }
}

const listenMessage = (meetingId, socket, meetingServer) => {
    socket.on('message', (message) => handleMessage(meetingId, socket, meetingServer));
}

const handleMessage = (meetingId, socket, message, meetingServer) => {
    let payload = "";
    if(typeof message === 'string'){
        payload = parseMessage(message);
    }else{
        payload = message;
    }

    switch(payload.type){
        case meetingPayloadEnum.JOIN_MEETING: 
            meetingHelper.joinMeeting(meetingId, socket, meetingServer, payload);
            break;
        case meetingPayloadEnum.CONNECTION_REQUEST:
            meetingHelper.forwardConnectionRequest(meetingId, socket, meetingServer, payload);
            break;
        case meetingPayloadEnum.OFFER_SDP:
            meetingHelper.forwardOfferSDP(meetingId, socket, meetingServer, payload);
            break;
        case meetingPayloadEnum.ICECANDIDATE:
                meetingHelper.forwardOfferSDP(meetingId, socket, meetingServer, payload);
                break;
        case meetingPayloadEnum.ANSWER_SDP:
            meetingHelper.forwardAnswerSDP(meetingId, socket, meetingServer, payload);
            break;
        case meetingPayloadEnum.LEAVE_MEETING:
            meetingHelper.userLeft(meetingId, socket, meetingServer, payload);
            break;
        case meetingPayloadEnum.END_MEETING:
            meetingHelper.endMeeting(meetingId, socket, meetingServer, payload);
            break;
        case meetingPayloadEnum.VIDEO_TOGGLE:
        case meetingPayloadEnum.AUDIO_TOGGLE:
            meetingHelper.forwardEvent(meetingId, socket, meetingServer, payload);
            break;
        case meetingPayloadEnum.UNKNOWN:
            break;
        default : 
            break;
    }
}


const initMeetingServer = (server) => {
    const meetingServer = require('socket.io')(server);

    meetingServer.on('connection', socket => {
        const meetingId = socket.handshake.query.id;

        listenMessage(meetingId, socket, meetingServer);
    })
}


module.exports = {
    initMeetingServer
}