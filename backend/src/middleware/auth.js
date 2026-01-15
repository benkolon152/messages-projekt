import jwt from "jsonwebtoken";

export default (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.sendStatus(401);
  }

  let token = authHeader;
  if (authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.sendStatus(403);
  }
};