import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';
import { mongoosePlugin, mongooseAggregatePlugin } from "mongoose-pagination-v2";

@Schema({ timestamps: true, versionKey: false })
export class Service {
  // no '@Prop' decorator needed because '_id' is controlled by Mongoose
  _id: ObjectId;

  @Prop()
  name: string;

  @Prop()
  image: string;
}

export type ServiceDocument = Service & Document;

export const SERVICE_MODEL = Service.name;

export const ServiceSchema = SchemaFactory.createForClass(Service);

// Apply pagination plugin
ServiceSchema.plugin(mongoosePlugin);
ServiceSchema.plugin(mongooseAggregatePlugin);