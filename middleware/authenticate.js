const authenticate = async (req, res, next)=>{
    const token =
    req.body.token || req.query.token || req.headers["x-access-token"];

    if(!token){
        res.status(402).send({message: "Token not found."});
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRETKEY);
       
        // save in user in request
        req.user = decoded;
      
    
    } catch (err) {
        return res.status(401).send("Invalid Token");
      }
      return next();

}

module.exports = authenticate;