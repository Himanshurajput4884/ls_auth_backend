const cassandra = require("cassandra-driver");
const datacenter = "datacenter1";
const contactPoints = ["localhost"];
const keyspace = "lsQuiz";
const table = "userDetails";
const table2 = "userChoices";

const client = new cassandra.Client({
  contactPoints: contactPoints,
  localDataCenter: datacenter,
});

const userProfile = (req, res) =>{
    try{
        const { username, fullname, email, choice1, choice2, choice3, choice4, choice5 } = req.body;

    client.connect().then(() => {
      console.log("Keyspace created or already exist");
      let useQuery = `USE ${keyspace}`;
      return client.execute(useQuery);
    })
    .then(()=>{
        return client.execute(`CREATE TABLE IF NOT EXISTS ${table} 
        (username text PRIMARY KEY, fullname text, email text, choice1 text, choice2 text, choice3 text, choice4 text, choice5 text);`)
    })
    .then(()=>{
        return client.execute(`CREATE TABLE IF NOT EXISTS ${table2} 
        (username text, choice1 text, choice2 text, choice3 text, choice4 text, choice5 text, PRIMARY KEY(username, choice1, choice2, choice3, choice4, choice5));`)
    })
    .then(()=>{
        return client.execute(`INSERT INTO ${table} (username, fullname, email, choice1, choice2, choice3, choice4, choice5) VALUES (?,?,?,?,?,?,?,?)`, [username, fullname, email, choice1, choice2, choice3, choice4, choice5])
    })
    .then(()=>{
        return client.execute(`INSERT INTO ${table2} (username, choice1, choice2, choice3, choice4, choice5) VALUES (?,?,?,?,?,?)`, [username, choice1, choice2, choice3, choice4, choice5])
    })
    .then((result)=>{
        console.log("User Details saved.");
        return res.status(201).json({message: "User details saved"});
    })
    }   
    catch(err){
        if(err){
            console.log("Error: ", err);
            return res.status(401).json({message:"Something went wrong"});
        }
    } 

}

module.exports = userProfile;