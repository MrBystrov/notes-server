import {
  Body,
  Controller,
  Delete,
  Patch,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';

import { User } from 'src/schemas/user.schema';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CustomRequest } from 'src/schemas/request.interface';
import { Types } from 'mongoose';

@Controller('/user')
export class UserController {
  constructor(private userService: UserService) {}
  @UseGuards(JwtAuthGuard)
  @Patch()
  async update(
    @Req() req: CustomRequest,
    @Body()
    data: {
      username: User['username'];
      useravatar?: User['useravatar'];
    },
  ) {
    const id = req.user.userId;
    const mongoId = new Types.ObjectId(id);
    const updatedData = await this.userService.updateUser(
      mongoId,
      data.username,
      data.useravatar,
    );

    return updatedData;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/change-password')
  async changePassword(
    @Query('id') id: string,
    @Req() req: CustomRequest,
    @Body() data: { currentPass: string; newPass: string },
  ) {
    const mongoId = new Types.ObjectId(req.user.userId);
    console.log(mongoId);
    const updatedUser = await this.userService.updatePassword(
      mongoId,
      data.currentPass,
      data.newPass,
    );

    return updatedUser;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete')
  async delete(@Req() req: CustomRequest) {
    const mongoId = new Types.ObjectId(req.user.userId);
    const result = await this.userService.deleteAccount(mongoId);
    return result;
  }
}
