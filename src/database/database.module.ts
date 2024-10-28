import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseConfigService } from './mongoose-config.service';
import { USER_MODEL, UserSchema } from './schema/user.schema';
import { SERVICE_MODEL, ServiceSchema } from './schema/service.schema';

const MODELS = [
  { name: USER_MODEL, schema: UserSchema },
  { name: SERVICE_MODEL, schema: ServiceSchema },
];

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({ useClass: MongooseConfigService }),
    MongooseModule.forFeature(MODELS)
  ],
  exports: [MongooseModule],
})
export class DatabaseModule { }