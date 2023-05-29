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

const checkUser = (req, res) => {
  
    try {
        const username = req.body.username;
        console.log(username);
      
        client
          .connect()
          .then(() => {
            console.log("Keyspace created or already exists");
            let useQuery = `USE ${keyspace}`;
            return client.execute(useQuery);
          })
          .then(() => {
            return client.execute(
              `CREATE TABLE IF NOT EXISTS ${table} (username text PRIMARY KEY, fullname text, email text, choice1 text, choice2 text, choice3 text, choice4 text, choice5 text);`
            );
          })
          .then(() => {
            return client.execute(
              `CREATE TABLE IF NOT EXISTS ${table2} (username text, choice1 text, choice2 text, choice3 text, choice4 text, choice5 text, PRIMARY KEY(username, choice1, choice2, choice3, choice4, choice5));`
            );
          })
          .then(() => {
            return client.execute(`SELECT * FROM ${table} WHERE username=?`, [username]);
          })
          .then((result) => {
            if (result.rows.length === 0) {
              return res.status(201).json({ message: "User Not found" });
            } else {
              return res.status(401).json({ message: "User found" });
            }
          })
          .catch((err) => {
            console.log("Error: ", err);
            return res.status(401).json({ message: "Something went wrong." });
          });
      } catch (err) {
        console.log("Error: ", err);
        return res.status(401).json({ message: "Something went wrong." });
      }
};

module.exports = checkUser;
