import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Types } from 'mongoose';

export type NotesDocument = HydratedDocument<Note>;

@Schema()
export class Note {
  @Prop({ type: Types.ObjectId })
  _id: Types.ObjectId;

  @Prop()
  userId: string;

  @Prop()
  createdAt: string;

  @Prop()
  updatedAt: string;

  @Prop()
  title: string;

  @Prop()
  type: string;

  @Prop()
  text: string;

  @Prop()
  active: boolean;
}
export const NoteSchema = SchemaFactory.createForClass(Note);
