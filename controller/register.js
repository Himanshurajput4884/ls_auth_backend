const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const cassandra = require("cassandra-driver");
const datacenter="datacenter1";
const contactPoints = ['localhost'];
dotenv.config();

const keyspace = "ls_quiz";
const table = "user_auth";

const client = new cassandra.Client({
    contactPoints: contactPoints,
    // keyspace: keyspace,
    localDataCenter: datacenter,
});



const createDatabase = async () =>{
  client.connect()
.then(()=>{
    console.log("Connected to the Cassandra Cluster");
    
    // create a keyspace
    const createKeyspaceQuery = `
    CREATE KEYSPACE IF NOT EXISTS ${keyspace} 
    WITH replication = {
        'class': 'SimpleStrategy',
        'replication_factor': 1
    };
    `
    return client.execute(createKeyspaceQuery);
})
.then(()=>{
    console.log('Keyspace created or already exist');
    let use_query = `USE ${keyspace}`;
    return client.execute(use_query)
})
.then(()=>{
    console.log("Using ls keyspace");

    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS ${table} (
        username text, password text
    );
    ` 
    return client.execute(createTableQuery)
})
.then(()=>{
    console.log("Inserting data");

    const insertingDataQuery = `
    INSERT INTO employee_by_car_make (car_make, id, car_model) VALUES ('BMW', 23, 'Rx4');
    `
    return client.execute(insertingDataQuery)
})
.then(()=>{
    console.log("Fetching data");
    const getDataQuery = `
    SELECT * FROM  employee_by_car_make;
    `
    return client.execute(getDataQuery);
})
.then(()=>{
    // client.shutdown();
    console.log("Connection closed");

})
.catch((err)=>{
    console.log("Error: ", err);
})

}


const register = async (req, res)=>{
    try{
        // first check all the fields are full
        const { name, username, password } = req.body;
        
        // check email if the email is already exist.
        
        // const encryptedPass = bcrypt.hash(password, 10);
        
        // const token = jwt.sign({ user_id: userId, username }, process.env.SECRETKEY, {
            //     expiresIn: "1d"
            // })
            
            
        createDatabase();

        return res.status(201).json({body: "Here is the body"});
    }
    catch(err){
        console.log("Error in registration: ", err);
        return res.status(401).json({message: "Something went wrong."});
    }
}

module.exports = register;