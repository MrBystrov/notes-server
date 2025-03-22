import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UsersDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop()
  username: string;

  @Prop({ required: true, unique: true })
  useremail: string;

  @Prop()
  password: string;

  @Prop()
  useravatar?: string;
  @Prop()
  userId?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
