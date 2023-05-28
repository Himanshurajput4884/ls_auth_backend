const express = require("express");
const cors = require("cors");
const router = require("./apis/routes");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const connection = require("./db/db");
const cassandra = require("cassandra-driver");
const datacenter="datacenter1";
const contactPoints = ['localhost'];
const keyspace = "lsQuiz";
dotenv.config();

const client = new cassandra.Client({
    contactPoints: contactPoints,
    localDataCenter: datacenter,
});

const createKeyspace = async ()=>{
    client.connect()
    .then(()=>{
        console.log("Connected to Cassandra.");

        const createKeyspaceQuery = `
        CREATE KEYSPACE IF NOT EXISTS ${keyspace} 
        WITH replication = {
            'class': 'SimpleStrategy',
            'replication_factor': 1
        };
        `;
          return client.execute(createKeyspaceQuery);
        })
        .then(()=>{
            return client.execute(`USE ${keyspace}`);
        })
        .then(()=>{
            client.shutdown();
        })
        .catch((err)=>{
            console.log("Error: ", err);
        })
}

createKeyspace();

const app = express();
app.use(cors());

app.use(express.json());
app.use(cookieParser());


app.use(router);

const PORT = 8009;
app.listen(PORT, ()=>{
    console.log(`Server is running at ${PORT}`);
})