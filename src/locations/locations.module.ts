import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LocationsController } from './locations.controller';
import { LocationsService } from './locations.service';
import { Country, CountrySchema } from './schemas/country.schema';
import { City, CitySchema } from './schemas/city.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Country.name, schema: CountrySchema },
      { name: City.name, schema: CitySchema },
    ]),
  ],
  controllers: [LocationsController],
  providers: [LocationsService],
  exports: [LocationsService],
})
export class LocationsModule {}