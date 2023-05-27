const express = require("express");
const cors = require("cors");
const router = require("./apis/routes");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const connection = require("./db/db");
const cassandra = require("cassandra-driver");
const keyspace = "tester1";
const datacenter="datacenter1";
const contactPoints = ['localhost'];
dotenv.config();

const client = new cassandra.Client({
    contactPoints: contactPoints,
    // keyspace: keyspace,
    localDataCenter: datacenter,
});



const app = express();
app.use(cors());

app.use(express.json());
app.use(cookieParser());


app.use(router);

const PORT = 8009;
app.listen(PORT, ()=>{
    console.log(`Server is running at ${PORT}`);
})