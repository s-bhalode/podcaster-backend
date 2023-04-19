const AWS = require('aws-sdk');
const dotenv = require('dotenv');

dotenv.config({path: '../.env'});
require('../../node_modules/aws-sdk/lib/maintenance_mode_message').suppress = true;




const sendForgotPasswordEmail = (user_email, userId, origin) => {
    AWS.config.update({
        accessKeyId: process.env.AWS_PODS_DEV_ACCESS_KEY,
        secretAccessKey: process.env.AWS_PODS_DEV_SECRET_KEY,
        region: process.env.AWS_EMAIL_TOPIC_REGION
    })
    const sns = new AWS.SNS();
    let params = {
        TopicArn: 'arn:aws:sns:us-east-1:100142141570:onpods-change-password',
        Message : `reset your password here http://localhost:3000/reset-password/${userId}/${user_email}`,
        Subject: `Reset your password`
    };
    params.MessageAttributes = {
        email : {
            DataType: 'String',
            StringValue: user_email
        }
    };
    sns.publish(params, (err, data) => {
        if(err){
            console.log(err);
            return err;
        }
        // console.log(data);
        console.log("Email sent successfully!");
    })
}



module.exports = {
    sendForgotPasswordEmail
}