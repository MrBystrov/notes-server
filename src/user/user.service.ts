import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import * as argon2 from 'argon2';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async updateUser(
    id: Types.ObjectId,
    username?: User['username'],
    useravatar?: User['useravatar'],
  ) {
    const updateData: Partial<User> = {};
    if (username) {
      updateData.username = username;
    }

    updateData.useravatar = useravatar;

    const user = await this.userModel
      .findOneAndUpdate({ _id: id }, { $set: updateData }, { new: true })
      .exec();
    if (!user) {
      throw new UnauthorizedException(
        'Пользователь не найден или неверные учетные данные',
      );
    }

    return user;
  }

  async updatePassword(
    id: Types.ObjectId,
    currentPass: string,
    newPass: string,
  ) {
    const user = await this.userModel.findOne(id).exec();
    if (!user) {
      throw new Error('Пользователь не найден');
    }

    const passwordMatch = await argon2.verify(user.password, currentPass);
    if (!passwordMatch) {
      throw new Error('Неверный текущий пароль');
    }
    const hashedPassword = await argon2.hash(newPass);

    user.password = hashedPassword;

    await user.save();

    return user;
  }

  async deleteAccount(id: Types.ObjectId) {
    const deletedUser = await this.userModel
      .findOneAndDelete({ _id: id })
      .exec();
    if (!deletedUser) {
      throw new Error('Пользователь не найден');
    }

    return { message: 'Учетная запись успешно удалена', user: deletedUser };
  }
}
