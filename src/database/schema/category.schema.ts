import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, Types } from 'mongoose';
import { mongoosePlugin, mongooseAggregatePlugin } from "mongoose-pagination-v2";

@Schema({ timestamps: true, versionKey: false })
export class category {
  // no '@Prop' decorator needed because '_id' is controlled by Mongoose
  _id: ObjectId;

  @Prop()
  name: string;

  @Prop()
  image: string;

  @Prop({ type: Types.ObjectId, ref: 'category' })
  parent: ObjectId;
}

export type CategoryDocument = category & Document;

export const CATEGORY_MODEL = category.name;

export const CategorySchema = SchemaFactory.createForClass(category);

// Apply pagination plugin
CategorySchema.plugin(mongoosePlugin);
CategorySchema.plugin(mongooseAggregatePlugin);