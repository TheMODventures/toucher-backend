import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PaginateModel } from 'mongoose';
import { comparePassword, generateRandomOTP, generateResponse, hashPassword, throwException } from '@src/common/helpers';
// import { UpdateUserDTO } from './dto/update-user.dto';
// import { fetchAllUsers } from './query/user.query';
import { User, USER_MODEL, UserDocument } from '@src/database/schema/user.schema';
import { sendEmail } from '@src/common/lib/mailer';
import { GetAggregatedPaginationQueryParams, GetPaginationQueryParams } from '@src/common/interfaces';
import { getAggregatedPaginatedData, getPaginatedData, PaginatedData } from 'mongoose-pagination-v2';
import { UpdateUserDTO } from './dto/update-user.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginDTO, RegisterDTO, SendOtpDTO } from '@src/auth/dto/auth.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(USER_MODEL) private readonly userModel: Model<UserDocument>, private readonly jwtService: JwtService,) { }

  async create(registerDTO: RegisterDTO): Promise<User> {
    // Check if the user already exists
    const userExists = await this.userModel.findOne({ email: registerDTO.email });
    if (userExists) {
      throwException('User already exists', 409);
    }
    const hashedPassword = hashPassword(registerDTO.password);

    // Create the user
    const user = await this.userModel.create({ ...registerDTO, password: hashedPassword });
    return user; // Return the created user

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

  async login(loginDto: LoginDTO): Promise<User> {
    const user = await this.userModel.findOne({ email: loginDto.email }, '+password');
    if (!user) {
      throwException('User not found', 404);
    }

    // Verify password
    const passwordMatch = comparePassword(loginDto.password, user.password);
    if (!passwordMatch) {
      throwException('Password is incorrect!', 401);
    }

    // Update FCM token and return updated user
    const updatedUser = await this.userModel.findOneAndUpdate(
      { email: loginDto.email },
      { fcmToken: loginDto.fcmToken },
      { new: true }
    );

    return updatedUser;
  }

  async uploadImage(userId: string, fileName: string) {
    return await this.userModel.findByIdAndUpdate(userId, { $set: { image: `users/${fileName}` } }, { new: true });
  }
  async sendOtp(sendOtpDto: SendOtpDTO) {
    // Generate OTP
    const otp = generateRandomOTP();
    const otpExpiry = new Date(Date.now() + 20 * 60000); // 20 minutes from now

    // Update user with new OTP
    const user = await this.userModel.findOneAndUpdate(
      { email: sendOtpDto.email },
      { otp, otpExpiry },
      { new: true }
    );

    if (!user) throwException('User not found', 404);
    // Generate temporary token
    const tempToken = this.jwtService.sign(
      { userId: user._id, email: user.email },
      { expiresIn: '20m' }
    );

    // Send email with OTP
    await sendEmail(sendOtpDto.email, 'Verification Code', `Your OTP Code is: ${otp}`);
    return { otp, tempToken };
  }

  async verifyOtp(userId: string, otp: string, email: string): Promise<User> {
    // Find user with matching ID, email and OTP
    const user = await this.userModel.findOne({ _id: userId, email, otp });

    if (!user) throwException('Invalid OTP', 400);
    // Check if OTP has expired
    if (user.otpExpiry < new Date()) throwException('OTP expired', 400);

    return user;
  }

  async resetPassword(userId: string, email: string, password: string): Promise<User> {
    const hashedPassword = hashPassword(password);

    // Update user with new password and clear OTP
    const user = await this.userModel.findOneAndUpdate(
      { _id: userId, email },
      { password: hashedPassword, otp: '', otpExpiry: null },
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
