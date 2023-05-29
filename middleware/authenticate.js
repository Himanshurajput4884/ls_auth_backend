const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
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

const authenticate = async (req, res, next) => {
  const token =
    req.body.token ||
    req.query.token ||
    req.headers["x-access-token"] ||
    req.headers.authorization;

  if (!token) {
    res.status(402).json({ message: "Token not found." });
  }

  try {
    const getToken = jwt.verify(token, process.env.SECRETKEY);
    // console.log(getToken);
    const username = getToken.username;
    // console.log(username);
    client
      .connect()
      .then(() => {
        console.log("Keyspace created or already exist");
        let useQuery = `USE ${keyspace}`;
        return client.execute(useQuery);
      })
      .then(() => {
        return client.execute(`SELECT * FROM ${table} WHERE username=?;`, [
          username,
        ]);
      })
      .then((result) => {
        if (result.rows.length === 0) {
          return res.status(401).json({ message: "Invalid Token" });
        }
      });

      req.body.username = username;
      next();

  } catch (err) {
    console.log("Error: ", err);
    return res.status(401).json({ message: "Invalid Token" });
  }
  return next();
};

module.exports = authenticate;
