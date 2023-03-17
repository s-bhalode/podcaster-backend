const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const userRouter = require('./src/routes/user-routes');
const podcastRouter = require('./src/routes/podcast-routes');
dotenv.config({path: './.env'});
const PORT = process.env.PORT;
require('./src/config/db-connection');



const app = express();

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

app.listen(PORT, () => {
    console.log(`Server running at port no. : ${PORT}`);
})
