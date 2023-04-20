const AWS = require('aws-sdk');
const dotenv = require('dotenv');

dotenv.config({path: './.env'});
require('aws-sdk/lib/maintenance_mode_message').suppress = true;

const awsConfig = {
    accessKeyId: process.env.AWS_PODS_DEV_ACCESS_KEY,
    secretAccessKey: process.env.AWS_PODS_DEV_SECRET_KEY,
    region: process.env.AWS_EMAIL_TOPIC_REGION
}

const SES = new AWS.SES(awsConfig);


const sendForgotPasswordEmail = (user_email, userId, origin) => {
    
    const email = process.env.FROM_EMAIL;
    const url = `${origin}/reset-password/${userId}/${user_email}`;
    
    try{
        const params = {
            Source: email,
            Destination: {
                ToAddresses: [user_email]
            },
            Message: {
                Subject: {
                    Charset: "UTF-8",
                    Data: `Password Reset`
                },
                Body: {
                    Html: {
                        Charset : "UTF-8",
                        Data : `<h3>Change your password here: </h3> <a href=${url} />`
                    }
                }
            }
        }
        const sentEmail = SES.sendEmail(params).promise();
        sentEmail.then((data) => {
            console.log(data);
        }).catch((err) => {
            console.log(err);
        })
    }catch(err){
        console.log(err);
    }

}



module.exports = {
    sendForgotPasswordEmail
}