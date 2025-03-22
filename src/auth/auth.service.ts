import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async findUserByEmail(
    useremail: string,
    password: string,
  ): Promise<{ token: string; user: User }> {
    const user = await this.userModel.findOne({ useremail }).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const passwordMatch = await argon2.verify(user.password, password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid password');
    }
    const token = this.jwtService.sign({ id: user._id, email: user.useremail });

    return { token, user };
  }
  async createUser(
    username: string,
    useremail: string,
    password: string,
  ): Promise<User> {
    const existingUser = await this.userModel.findOne({ useremail }).exec();

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const existingUserName = await this.userModel.findOne({ username });

    if (existingUserName) {
      throw new ConflictException('User with this username already exist');
    }

    const hasPassword = await argon2.hash(password);
    const newUser = new this.userModel({
      username,
      useremail,
      password: hasPassword,
    });

    return newUser.save();
  }
  async findByUserId(userId: string) {
    const user = await this.userModel.findOne({ userId }).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
