const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  authenicateToken: function authenicateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    // console.log(req.headers)
    const token = authHeader && authHeader.split(" ")[1];
    // console.log('bearer token', token);
    if (token == null || "") return res.sendStatus(401);
    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
      console.log(err);
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  },
  tokenGetUserId: function tokenGetUserId(authHeader) {
    return jwt.verify(
      authHeader && authHeader.split(" ")[1],
      process.env.TOKEN_SECRET
    ).user_id;
  },
  generateJWT: (userId) => {
    // 24hr expiry
    // console.log(username, process.env.TOKEN_SECRET);
    return jwt.sign({ user_id: userId }, process.env.TOKEN_SECRET, {
      expiresIn: "72h",
    });
  },
};
