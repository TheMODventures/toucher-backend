import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Req, Res, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { UserServiceService } from './user-service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { generateResponse, multerStorage, throwException } from '@src/common/helpers';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { Types } from 'mongoose';

@Controller('service')
export class UserServiceController {
    constructor(private readonly service: UserServiceService) { }

    @Post()
    @UseInterceptors(FileInterceptor('image', multerStorage))
    async create(@Req() req: Request, @Res() res: Response, @Body() createServiceDto: CreateServiceDto, @UploadedFile() file: any) {
        if (req['fileValidationError']) throwException(req['fileValidationError'], 422);

        if (!file) throwException('Image is required', 422);

        const service = await this.service.create(createServiceDto.name, file.path);
        generateResponse(service, 'created successfully', res);
    }

    @Get()
    async findAll(
        @Res() res: Response,
        @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
        @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
        @Query('search') search: string = ''
    ) {
        const services = await this.service.findAll({ page, limit, query: { name: { $regex: search, $options: 'i' } } });
        generateResponse(services, 'fetched successfully', res);
    }


    @Get(':id')
    async findOne(@Res() res: Response, @Param('id') id: string) {
        if (Types.ObjectId.isValid(id) === false) throwException('Invalid service id', 422);

        const service = await this.service.findOne({ _id: id });
        generateResponse(service, 'fetched successfully', res);
    }
}
