import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SERVICE_MODEL, ServiceDocument } from '@src/database/schema/service.schema';
import { Model, PaginateModel } from 'mongoose';
import { GetPaginationQueryParams } from '@src/common/interfaces';
import { getPaginatedData, PaginatedData } from 'mongoose-pagination-v2';
import { throwException } from '@src/common/helpers';

@Injectable()
export class UserServiceService {
    constructor(@InjectModel(SERVICE_MODEL) private readonly serviceModel: Model<ServiceDocument>) { }

    async create(name: string, image: string) {
        const serviceExists = await this.serviceModel.findOne({ name });
        if (serviceExists) throwException('Already exists!', 409);

        const service = await this.serviceModel.create({ name, image });
        return service;
    }

    async findAll({ query = {}, page = 1, limit = 10, populate }: GetPaginationQueryParams): Promise<PaginatedData<ServiceDocument>> {
        const { data, pagination } = await getPaginatedData({
            model: this.serviceModel as PaginateModel<ServiceDocument>,
            query,
            page,
            limit,
            sort: { createdAt: -1 },
            populate,
        });

        return { data, pagination };
    }

    async findOne(query: any) {
        const service = await this.serviceModel.findOne(query);
        if (!service) throwException('Not found', 404);

        return service;
    }
}
