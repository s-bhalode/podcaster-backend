const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({path : './.env'});

mongoose.connect(process.env.MONGO_DB_URL, {
    useNewUrlParser : true,
    useUnifiedTopology : true
}).then( () => {
    console.log(`Database connected successfully !`);
}).catch((err) => {
    console.log(err);
    process.exit();
})

module.exports = {
    url : process.env.MONGO_DB_URL,
    database : "podcaster"
}