const authenticate = async (req, res, next)=>{
    const token =
    req.body.token || req.query.token || req.headers["x-access-token"] || req.headers.authorization;

    if(!token){
        res.status(402).json({message: "Token not found."});
    }

    try {

    
    } catch (err) {
        return res.status(401).json({message: "Invalid Token"});
      }
      return next();

}

module.exports = authenticate;