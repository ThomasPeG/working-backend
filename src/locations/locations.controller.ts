import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { BulkLocationDataDto } from './dto/bulk-location-data.dto';
import { Response } from '../interfaces/response.interface';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post('bulk')
  async bulkCreateLocations(@Body() data: BulkLocationDataDto): Promise<Response> {
    return this.locationsService.bulkCreateLocations(data);
  }

  @Get('countries')
  async getAllCountries(): Promise<Response> {
    return this.locationsService.getAllCountries();
  }

  @Get('countries/:countryId/cities')
  async getCitiesByCountry(@Param('countryId') countryId: string): Promise<Response> {
    return this.locationsService.getCitiesByCountry(countryId);
  }

  @Get('cities/search')
  async searchCities(
    @Query('q') query: string,
    @Query('countryId') countryId?: string
  ): Promise<Response> {
    return this.locationsService.searchCities(query, countryId);
  }

  @Get('cities/:cityId')
  async getLocationById(@Param('cityId') cityId: string): Promise<Response> {
    return this.locationsService.getLocationById(cityId);
  }

  @Get('cities/nearby')
  async getCitiesNearby(
    @Query('lat') latitude: number,
    @Query('lng') longitude: number,
    @Query('distance') maxDistance?: number
  ): Promise<Response> {
    return this.locationsService.getCitiesNearby(latitude, longitude, maxDistance);
  }

  @Get('countries/code/:code')
  async getCountryByCode(@Param('code') code: string): Promise<Response> {
    return this.locationsService.getCountryByCode(code);
  }
}