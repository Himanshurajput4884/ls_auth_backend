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
        username text, password text, name text, PRIMARY KEY(username, password)
    );
    ` 
    return client.execute(createTableQuery)
})
// .then(()=>{
//     console.log("Inserting data");

//     const insertingDataQuery = `
//     INSERT INTO employee_by_car_make (car_make, id, car_model) VALUES ('BMW', 23, 'Rx4');
//     `
//     return client.execute(insertingDataQuery)
// })
// .then(()=>{
//     console.log("Fetching data");
//     const getDataQuery = `
//     SELECT * FROM  employee_by_car_make;
//     `
//     return client.execute(getDataQuery);
// })
.then(()=>{
    client.shutdown();
    console.log("Connection closed");

})
.catch((err)=>{
    console.log("Error: ", err);
})

}

const check_user = async (username) =>{
    client.connect()
    .then(()=>{
        let use_query = `USE ${keyspace}`;
        return client.execute(use_query)
    })
    .then(async ()=>{
        // console.log("username: ",username);
        let parameter = [username];
        let check_query = `SELECT * FROM ${table} WHERE username=?;`;
        const res = await client.execute(check_query, parameter);
        console.log(res.rows.length);
        return res.rows.length;
    })
    .catch((err)=>{
        console.log("Error in checking: ", err);
    });
}


const register_user = async (data) =>{
    try{
        const query = `INSERT INTO ${table} (username, name, password) VALUES (?, ?, ?);`;
        // console.log(data);
        let parameter = [data.username, data.name, data.pass];
        // console.log(parameter);
        client.connect()
        .then(()=>{
            let use_query = `USE ${keyspace}`;
            return client.execute(use_query)
        })
        .then(()=>{
            return client.execute(query, parameter);
        })
        .then(()=>{
            client.shutdown();
        })
    }
    catch(err){
        if(err){
            console.log("Error in registering: ", err);
        }
    }
}

const register = async (req, res)=>{
    try{
        // first check all the fields are full
        // console.log(req.body);
        const { name, username, password } = req.body;
        await createDatabase();
        
        // check email if the email is already exist.
        
        if(check_user(username) !== 0){
            return res.status(401).send({message: "Username is taken"});
        }
        const encryptedPass = await bcrypt.hash(password, 10);
        // console.log(typeof(encryptedPass));
        const data = {
            username: username,
            name: name,
            pass: encryptedPass,
        }

        await register_user(data);

        return res.status(201).json({message: "Success"});
    }
    catch(err){
        console.log("Error in registration: ", err);
        return res.status(401).json({message: "Something went wrong."});
    }
}

module.exports = register;