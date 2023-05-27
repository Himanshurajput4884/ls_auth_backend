const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
dotenv.config();

const login = async (req, res)=>{
    const { username, password } = req.body;
    if(!username || !password){
        return res.status(401).send({message: "Missing Field"});
    }
    try{
        if (user && (await bcrypt.compare(password, user.password))) {
            // Create token
            const token = jwt.sign(
              { user_id: user._id, email },
              process.env.SECRETKEY,
              {
                expiresIn: "1d",
              }
            );
      
            // save user token
            user.token = token;
      
            // user
            res.status(200).json({user: user});
          }
          res.status(400).send("Invalid Credentials");
    }
    catch(err){
        console.log("Error in Login: ", err);
        return res.status(401).send({message: "Something went wrong."});
    }
}

module.exports = login;