import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CustomRequest } from 'src/schemas/request.interface';
import { Note } from 'src/schemas/note.schema';
import { Types } from 'mongoose';

@UseGuards(JwtAuthGuard)
@Controller('notes')
export class NotesController {
  constructor(private notesService: NotesService) {}

  @Get('active')
  @Header('Cache-Control', 'no-cache')
  async getActive(
    @Req() req: CustomRequest,
    @Query('title') title?: string,
    @Query('range') range?: string,
  ) {
    const id = req.user.userId;
    const notes = await this.notesService.getActiveNotes(id, range, title);

    return notes;
  }
  @Get('tasks')
  @Header('Cache-Control', 'no-cache')
  async getTasks(@Req() req: CustomRequest) {
    const id = req.user.userId;
    const notes = await this.notesService.getActiveTasks(id);

    return notes;
  }

  @Get('archive')
  async getArchive(@Req() req: CustomRequest) {
    const id = req.user.userId;
    const notes = await this.notesService.getArchiveNotes(id);

    return notes;
  }

  @Delete(':id')
  async deleteNote(@Param('id') id: Types.ObjectId) {
    const mongoId = new Types.ObjectId(id);
    const note = await this.notesService.deleteNote(mongoId);
    console.log('2', note);
    return note;
  }

  @Post()
  async create(@Req() req: CustomRequest, @Body() data: Partial<Note>) {
    const id = req.user.userId;
    const note = await this.notesService.saveNote({
      userId: id,
      createdAt: new Date(Date.now()).toISOString(),
      updatedAt: new Date(Date.now()).toISOString(),
      ...data,
      _id: new Types.ObjectId(),
    });

    return note;
  }

  @Patch('tasks/:id')
  async updateTask(
    @Req() req: CustomRequest,
    @Param('id') id: string,
    @Body()
    data: { text?: Note['text'] },
  ) {
    const userId = req.user.userId;
    const noteId = new Types.ObjectId(id);
    const note = await this.notesService.updateNote(userId, noteId, {
      updatedAt: new Date(Date.now()).toISOString(),
      ...data,
    });
    return note;
  }

  @Patch()
  async update(
    @Req() req: CustomRequest,
    @Body()
    data: { title?: Note['title']; text?: Note['text']; id: Types.ObjectId },
  ) {
    const userId = req.user.userId;
    const noteId = new Types.ObjectId(data.id);
    const note = await this.notesService.updateNote(userId, noteId, {
      updatedAt: new Date(Date.now()).toISOString(),
      ...data,
    });
    return note;
  }
}
