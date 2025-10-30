import { Model, model, Schema } from "mongoose";
import { hashSync, compareSync, genSaltSync } from "bcrypt";

interface VerificationTokenDoc {
  userId: string;
  token: string;
  expires: Date;
}

interface Meathods {
  compare(token: string): boolean;
}

const verficationTokenSchema = new Schema<VerificationTokenDoc, {}, Meathods>({
  userId: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  expires: {
    type: Date,
    default: Date.now(),
    expires: 60 * 60 * 24,
  },
});

verficationTokenSchema.pre("save", function (next) {
  if (this.isModified("token")) {
    const salt = genSaltSync(10);
    this.token = hashSync(this.token, salt);
  }
  next();
});

verficationTokenSchema.methods.compare = function (token) {
  return compareSync(token, this.token);
};

const VerificationTokenModel = model(
  "VerificationToken",
  verficationTokenSchema
);

export default VerificationTokenModel as Model<
  VerificationTokenDoc,
  {},
  Meathods
>;
