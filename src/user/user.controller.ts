import {
  Body, Controller, Delete, Get, HttpException, HttpStatus,
  ParseIntPipe, Post, Put, Query, Req, Res,
  UploadedFiles, UseFilters, UseGuards, UseInterceptors
} from '@nestjs/common';
// import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
// import { diskStorage } from 'multer';
import { filterMedia, generateFilename, generateResponse, uploadMedia } from 'src/common/helpers';
// import { QueryOption } from 'src/common/interfaces';
// import { UpdateUserDTO } from './dto/update-user.dto';
import { UserService } from './user.service';
import { GetCurrentUserId } from '@src/common/decorators';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@src/common/guards/roles.guard';
import { fetchAllUsersQuery } from './query/user.query';
import { UpdateUserDTO } from './dto/update-user.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  // @Post('/otp')
  // async sendOtp(@Res() res: Response, @Body('email') email: string) {
  //   if (!email) throw new UnprocessableEntityException('Email is required');

  //   const otp = await this.userService.sendOtp(email);
  //   generateResponse({ otp }, 'OTP sent successfully', res);
  // }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Roles(ROLES.ADMIN)
  async findAll(
    @GetCurrentUserId() userId: string,
    @Res() res: Response,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('search') search: string = ''
  ) {
    const query = fetchAllUsersQuery(userId, search);
    const users = await this.userService.findAll({ query, page, limit });
    generateResponse(users, 'Users fetched successfully', res);
  }

  @Get('/profile')
  @UseGuards(AuthGuard('jwt'))
  async findOne(
    @Res() res: Response,
    @GetCurrentUserId() userId: string,
    @Query('userId') user: string
  ) {
    let query = { _id: userId };
    if (user) query = { _id: user };

    const userObj = await this.userService.findOne(query);
    generateResponse(userObj, 'Fetched profile successfully', res);
  }

  @Put('/update')
  @UseGuards(AuthGuard('jwt'))
  async update(@GetCurrentUserId() user: string, @Body() updateUserDto: UpdateUserDTO, @Res() res: Response) {
    const userObj = await this.userService.updateUser(user, updateUserDto);
    generateResponse(userObj, 'Updated successfully', res);
  }

  // @Delete('/remove-account')
  // @UseGuards(AuthGuard('jwt'))
  // remove(@GetCurrentUserId() userId: string) {
  //   return this.usersService.remove(userId);
  // }

  // @Post('/upload-image')
  // @UseGuards(AuthGuard('jwt'))
  // @UseInterceptors(
  //   FileInterceptor('image', {
  //     storage: diskStorage({
  //       destination: './uploads/users/',
  //       filename: generateFilename,
  //     }),
  //     fileFilter: filterImage,
  //   }),
  // )
  // uploadImage(@GetCurrentUserId() userId: string, @Req() req: Request, @UploadedFiles() files: any) {
  //   console.log('files >>', files);

  //   // error handling
  //   if (req['fileValidationError']) {
  //     throw new HttpException(
  //       req['fileValidationError'],
  //       HttpStatus.UNPROCESSABLE_ENTITY,
  //     );
  //   }

  //   // return this.usersService.uploadImage(userId, file.filename);
  // }

  @Post('/upload-media')
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      storage: diskStorage({
        destination: './uploads/',
        filename: generateFilename,
      }),
      fileFilter: filterMedia,
      limits: { fileSize: 10 * 1024 * 1024 },  // Max file size of 10MB per file
    }),
  )
  async uploadMedia(
    @UploadedFiles() files: Express.Multer.File[],
    @Res() res: Response,
  ) {
    if (!files || files.length === 0) {
      throw new HttpException('Please, provide media files.', 422);
    }
    const filePaths = await uploadMedia(files);

    generateResponse(filePaths, 'Media uploaded successfully', res);
  }

}
