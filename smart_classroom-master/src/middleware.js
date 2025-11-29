import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

export async function verifyToken(req, res, next) {
  const token = req.cookies.token;
  if (!token)
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ error: "You are not login" });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    verified._id = new ObjectId(verified._id);
    req.user = verified;
    // console.log(verified);
    next();
  } catch (err) {
    return res.status(StatusCodes.FORBIDDEN).json({ error: "Invalid token!" });
  }
}
