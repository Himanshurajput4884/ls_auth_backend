const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const cassandra = require("cassandra-driver");
const datacenter = "datacenter1";
const contactPoints = ["localhost"];
dotenv.config();

const table1 = "adminAuth";
const keyspace = "lsQuiz";
const table2 = "adminToken";

const client = new cassandra.Client({
  contactPoints: contactPoints,
  localDataCenter: datacenter,
});

const setKeyspace = async () =>{
  client.connect()
  .then(()=>{
    const query =  `USE ${keyspace}`;
    return client.execute(query);
  })
  .catch((err)=>{
    console.log("Error: ", err);
  })
}

const admin = async (req, res)=>{
  setKeyspace();
    try{
      const { username, password } = req.body;
      // console.log(req.body);
      const passQuery = `SELECT * FROM ${table1} WHERE username=?;`;

      client.execute(passQuery, [username])
      .then( (result)=>{
        console.log(result);
        if(result.rows.length === 0){
          return res.status(401).json({message: "User doesn't exist."});
        }
        const data = result.rows[0];
        let hashedPassword = data.password;

       bcrypt.compare(password, hashedPassword, (err, isMatch)=>{
          if(err){
            throw new Error(err);
          }
          else if(isMatch){
            const token =  jwt.sign({
                userId: username
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
          }
          else if(!isMatch){
            return res.status(401).json({message:"Incorrect Username or password"});
          }
        })
      })
      

    }
    catch(err){
      console.log("Error in Login: ", err);
      return res.status(401).json({ message: "Something went wrong." });
    }
}

module.exports = admin;


// Admin username -> admin11
// Admin Password -> admin