import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HAND, ROLES } from '@src/common/constants';
import { hashPassword } from '@src/common/helpers';
import { Document, ObjectId } from 'mongoose';
import { mongoosePlugin, mongooseAggregatePlugin } from "mongoose-pagination-v2";

@Schema({ timestamps: true, versionKey: false })
export class User {
  // no '@Prop' decorator needed because '_id' is controlled by Mongoose
  _id: ObjectId;

  @Prop()
  username: string;

  @Prop()
  email: string;

  @Prop({ select: false })
  password: string;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  BowlsClub: string;

  @Prop()
  image: string;

  @Prop()
  country: string;

  @Prop({ type: String, enum: Object.values(ROLES), default: ROLES.USER })
  role: ROLES;

  @Prop()
  otp: string;

  @Prop({ required: true })
  fcmToken: string;

  @Prop()
  dob: Date;

  @Prop({ type: String, enum: Object.values(HAND) })
  hand: HAND;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  refreshToken: string;
}

export type UserDocument = User & Document;

export const USER_MODEL = User.name;

export const UserSchema = SchemaFactory.createForClass(User);

// hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = hashPassword(this.password);
  next();
});

// Apply pagination plugin
UserSchema.plugin(mongoosePlugin);
UserSchema.plugin(mongooseAggregatePlugin);

// Adding custom compound indexes for multiple fields
// UserSchema.index({ email: 1, username: 1 });  // Compound index