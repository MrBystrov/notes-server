import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Note } from 'src/schemas/note.schema';

@Injectable()
export class NotesService {
  constructor(@InjectModel(Note.name) private noteModel: Model<Note>) {}

  async saveNote(note: Partial<Note>): Promise<Note> {
    console.log('ddd', note);
    const createdNote = new this.noteModel(note);
    return createdNote.save();
  }

  async updateNote(
    userId: Note['userId'],
    id: Note['_id'],
    data: Partial<Note>,
  ): Promise<Note | null> {
    const note = await this.noteModel.findById(id);
    if (!note) {
      throw new NotFoundException(`Note with ID not found`);
    }
    if (note.userId !== userId) {
      throw new ForbiddenException(
        `You do not have permission to update this note`,
      );
    }

    const updatedNote = await this.noteModel.findByIdAndUpdate(
      id,
      { $set: data }, // Используем $set для обновления только переданных полей
      { new: true, runValidators: true }, // Возвращаем обновленный документ и запускаем валидацию
    );
    return updatedNote;
  }

  async findActiveByType(userId: string, type: string): Promise<Note[]> {
    return this.noteModel.find({ userId, active: true, type }).exec();
  }

  async getActiveNotes(
    userId: string,
    range?: string,
    title?: string,
  ): Promise<Note[]> {
    const currentDate = new Date();

    let startDate: Date | null = null;

    switch (range) {
      case '1':
        startDate = new Date(currentDate.setMonth(currentDate.getMonth() - 1));
        break;
      case '3':
        startDate = new Date(currentDate.setMonth(currentDate.getMonth() - 3));
        break;
      case '12':
        startDate = new Date(currentDate.setMonth(currentDate.getMonth() - 12));
        break;
      case 'unlimited':
        startDate = null;
        break;
      default:
        startDate = null;
    }

    const notes = await this.findActiveByType(userId, 'note');

    const filteredByDate = startDate
      ? notes.filter((note) => new Date(note.createdAt) >= startDate)
      : notes;

    const filteredByTitle = title
      ? filteredByDate.filter((note) => note.title.includes(title))
      : filteredByDate;

    return filteredByTitle;
  }

  async getActiveTasks(userId: string): Promise<Note[]> {
    return this.findActiveByType(userId, 'task');
  }

  async getArchiveNotes(userId: string): Promise<Note[]> {
    const notes = await this.noteModel
      .find({ userId: userId, active: false })
      .exec();
    return notes;
  }

  async deleteNote(id: Note['_id']): Promise<Note | null> {
    const deletedNote = await this.noteModel.findByIdAndDelete(id).exec();
    return deletedNote;
  }
}
