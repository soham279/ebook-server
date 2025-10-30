import { RequestHandler } from "express";
import crypto from "crypto";
import nodemailer from "nodemailer";
import VerificationTokenModel from "@/models/verificationToken";
import UserModel from "@/models/user";
import mail from "@/utils/mail";
import { sendErrorResponse } from "@/utils/helper";

export const generateAuthLink: RequestHandler = async (req, res) => {
  // Generate authentication link
  // and send that link to the user's email address

  /* 
        1. Generate unique token for every users
        2. Store that token securely inside the database so that we can validate it in future 
        3. Create a link which include that secure token and user info 
        4. Send the link to user's email
        5. Notify user to look inside the email to get the login link
  */

  const { email } = req.body;

  let user = await UserModel.findOne({ email });

  if (!user) {
    // if no user found then create new user
    user = await UserModel.create({ email });
  }

  const userId = user._id.toString();

  //   If we already have token for this user it'll remove this first
  await VerificationTokenModel.findOneAndDelete({ userId });

  const randomToken = crypto.randomBytes(36).toString("hex");

  await VerificationTokenModel.create({
    userId,
    token: randomToken,
  });

  const link = `${process.env.VERIFICATION_LINK}?token=${randomToken}&userId=${userId}`; 

  await mail.sendVerificationMail({
    link,
    to: user.email,
  });

  res.json({ message: "Please check your email for link" });
};

export const verifyAuthToken : RequestHandler = async (req, res) => {

  const {token, userId} = req.query

  if(typeof token !== 'string' || typeof userId !== 'string'){
    return sendErrorResponse({
      status: 403,
      message: 'Invalid request!',
      res
    })
  }

  const verificationToken = await VerificationTokenModel.findOne({userId})
  if(!verificationToken || !verificationToken.compare(token)){
    return sendErrorResponse({
      status: 403,
      message: 'Invalid request! token mismatch!',
      res
    })
  }

  const user = await UserModel.findById(userId)
  if(!user){
    return sendErrorResponse({
      status: 500,
      message: 'Something went wrong, user not found!',
      res
    })
  }

  await VerificationTokenModel.findByIdAndDelete(verificationToken._id)

  // TODO: Authentication

  res.json({})
}