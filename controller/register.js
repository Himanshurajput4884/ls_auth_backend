const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const cassandra = require("cassandra-driver");
const datacenter = "datacenter1";
const contactPoints = ["localhost"];
dotenv.config();

const keyspace = "lsQuiz";
const table = "userAuth";
const table2 = "userToken";


const client = new cassandra.Client({
  contactPoints: contactPoints,
  localDataCenter: datacenter,
});

const createDatabase = async () => {
  client
    .connect()
    .then(() => {
      console.log("Keyspace created or already exist");
      let useQuery = `USE ${keyspace}`;
      return client.execute(useQuery);
    })
    .then(async () => {
      console.log("Using ls keyspace");

      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS ${table} 
        (username text, password text, name text, PRIMARY KEY(username, password)
        );
        `;
      return client.execute(createTableQuery)
      .then(()=>{
        console.log("User Auth is created");
      });
    })
    .catch((err) => {
      console.log("Error: ", err);
    });
};

const createTokenTable = async() =>{
    const query = `CREATE TABLE IF NOT EXISTS ${table2}
    (username text PRIMARY KEY, tokens set<text>);
    `
    client.execute(query)
    .then((res)=>{
      console.log("Tokens Table created.");
    })
    .catch((err)=>{
      console.log("Error in creating token table: ", err);
    })
}

const register = async (req, res) => {
  try {
    await createDatabase();
    // first check all the fields are full
    // console.log(req.body);
    const { name, username, password } = req.body;

    await createTokenTable();
    // check email if the email is already exist.
    
    const checkQuery = `SELECT * FROM ${table} WHERE username=?;`;
    client.execute(checkQuery, [username], {prepare:true})
    .then(async (result)=>{
        if(result.rows.length === 0){
            const encryptedPass = await bcrypt.hash(password, 10);
            
            let registerQuery = `INSERT INTO ${table} (username, name, password) VALUES (?, ?, ?);`;
            client.execute(registerQuery, [username, name, encryptedPass], {prepare:true})
            .then(async (result2)=>{
                const token =  jwt.sign({
                  username: username
                },
                process.env.SECRETKEY,
                {
                  expiresIn:"1d",
                });
                console.log(token);
                const selectQuery = `SELECT tokens FROM ${table2} WHERE username = ?`;
                const insertQuery = `INSERT INTO ${table2} (username, tokens) VALUES (?, ?)`;

                const newValue = token;
                
                client.execute(selectQuery, [username])
                .then((result3)=>{
                  if(result3.rows.length === 0){
                    const initialSet = new Set([newValue]);
                    client.execute(insertQuery, [username, Array.from(initialSet)])
                    .then(()=>{
                      console.log("New row and token is inserted.");
                      return res.status(201).json({message: "New row and token is added.", token:token});
                    })
                  }
                  else{
                    const existingSet = result3.rows[0].tokens;
                    const updateSet = new Set(existingSet);
                    updateSet.add(newValue);
                    const updateQuery = `UPDATE ${table2} SET tokens = ? WHERE username = ?`;
                    client.execute(updateQuery, [Array.from(updateSet), username], {prepare:true})
                    .then(()=>{
                      console.log("New token added to set");
                      return res.status(201).json({message:"New token added to set", token:token});
                    })
                  }
                })
            })
        }
        else{
            return res.status(401).json({message: "Username Taken"});
        }
    })
  } catch (err) {
    console.log("Error in registration: ", err);
    return res.status(401).json({ message: "Something went wrong." });
  }
};

module.exports = register;
