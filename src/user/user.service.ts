import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PaginateModel } from 'mongoose';
import { comparePassword, generateRandomOTP, generateResponse, hashPassword, throwException } from '@src/common/helpers';
// import { UpdateUserDTO } from './dto/update-user.dto';
// import { fetchAllUsers } from './query/user.query';
import { RegisterUserDTO } from '@src/auth/dto/register.dto';
import { loginDTO } from '@src/auth/dto/login.dto';
import { USER_MODEL, UserDocument } from '@src/database/schema/user.schema';
import { sendEmail } from '@src/common/lib/mailer';
import { GetAggregatedPaginationQueryParams, GetPaginationQueryParams } from '@src/common/interfaces';
import { getAggregatedPaginatedData, getPaginatedData, PaginatedData } from 'mongoose-pagination-v2';
import { UpdateUserDTO } from './dto/update-user.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(@InjectModel(USER_MODEL) private readonly userModel: Model<UserDocument>, private readonly jwtService: JwtService,) { }

  async create(registerUserDto: RegisterUserDTO, file: Express.Multer.File) {
    try {
      const userExists = await this.userModel.findOne({ email: registerUserDto.email });
      if (userExists) throwException('User already exists', 409);

      if (!file) throwException('Image is required', 400);
      const userPayload = {
        ...registerUserDto,
        image: `uploads/${file.filename}`,
      };

      const user = await this.userModel.create(userPayload);
      return user;
    } catch (error) {
      throwException(error.message, 422);
    }
  }

  async findOne(query: any) {
    const user = await this.userModel.findOne(query);
    if (!user) throwException('User not found', 404);

    return user;
  }

  // async updateUser(user: string, updateUserDto: UpdateUserDTO) {
  //   const userObj = await this.userModel.findById(user);
  //   if (!userObj) throwException('User not found', 404);

  //   // Manually update fields
  //   if (updateUserDto.username) userObj.username = updateUserDto.username;
  //   if (updateUserDto.password) userObj.password = updateUserDto.password;

  //   // Save the user to trigger pre-save hooks like password hashing
  //   const updatedUser = await userObj.save();
  //   if (!updatedUser) throwException('User not updated', 400);

  //   return updatedUser;
  // }

  async updateUser(query: any, updateUserDto: UpdateUserDTO) {
    const updatedUser = await this.userModel.findOneAndUpdate(query, updateUserDto, { new: true });
    if (!updatedUser) throwException('User not updated', 400);

    return updatedUser;
  }

  // async remove(userId: string) {
  //   const deletedUser = await this.userModel.findByIdAndDelete(userId);

  //   if (!deletedUser) {
  //     throw new NotFoundException('User not found');
  //   }

  //   return deletedUser;
  // }

  async login(loginDto: loginDTO) {
    const user = await this.userModel.findOne({ email: loginDto.email }, '+password');
    if (!user) throwException('User not found', 404);

    const passwordMatch = comparePassword(loginDto.password, user.password);
    if (!passwordMatch) throwException('Password is incorrect!', 401);

    const updatedUser = await this.userModel.findOneAndUpdate(
      { email: loginDto.email },
      { fcmToken: loginDto.fcmToken },
      { new: true },
    );
    return updatedUser;
  }

  async uploadImage(userId: string, fileName: string) {
    return await this.userModel.findByIdAndUpdate(userId, { $set: { image: `users/${fileName}` } }, { new: true });
  }

  async sendOtp(email: string) {
    const otp = generateRandomOTP();
    const user = await this.userModel.findOneAndUpdate(
      { email },
      { otp, otpExpiry: new Date(Date.now() + 20 * 60000) },
      { new: true }
    );
    if (!user) throwException('User not found', 404);

    // Generate a temporary token with user ID and email
    const tempToken = this.jwtService.sign(
      { userId: user._id, email: user.email }, // Include email in payload
      { expiresIn: '20m' }
    );

    await sendEmail(email, 'OTP', `Your OTP: ${otp}`);
    return { otp, tempToken };
  }

  async verifyOtp(userId: string, otp: string, email: string) {
    const user = await this.userModel.findOne({ _id: userId, email, otp });
    if (!user) throwException('Invalid OTP', 400);

    if (user.otpExpiry < new Date()) throwException('OTP expired', 400);

    return user;
  }

  async resetPassword(userId: string, email: string, password: string) {
    const hashedPassword = hashPassword(password);
    const user = await this.userModel.findOneAndUpdate(
      { _id: userId, email },
      { password: hashedPassword, otp: '', otpExpiry: null },  // Clear OTP
      { new: true }
    );
    if (!user) throwException('User not found', 404);

    return user;
  }

  // findAll with pagination
  async findAll({ query = {}, page = 1, limit = 10, populate }: GetPaginationQueryParams): Promise<PaginatedData<UserDocument>> {
    const { data, pagination } = await getPaginatedData({
      model: this.userModel as PaginateModel<UserDocument>,
      query,
      page,
      limit,
      sort: { createdAt: -1 },
      populate,
    });

    return { data, pagination };
  }

  // findAllAggregate with pagination
  async findAllAggregate({ query = [], page = 1, limit = 10 }: GetAggregatedPaginationQueryParams): Promise<PaginatedData<UserDocument>> {
    const { data, pagination }: PaginatedData<UserDocument> = await getAggregatedPaginatedData({
      model: this.userModel as PaginateModel<UserDocument>,
      query,
      page,
      limit,
    });

    return { data, pagination };
  }
}
