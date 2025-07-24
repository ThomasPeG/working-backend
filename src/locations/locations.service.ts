import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Types } from 'mongoose'; // Agregar esta importación
import { Country, CountryDocument } from './schemas/country.schema';
import { City, CityDocument } from './schemas/city.schema';
import { BulkLocationDataDto } from './dto/bulk-location-data.dto';
import { Response } from '../interfaces/response.interface';

@Injectable()
export class LocationsService {
  constructor(
    @InjectModel(Country.name) private countryModel: Model<CountryDocument>,
    @InjectModel(City.name) private cityModel: Model<CityDocument>,
  ) {}

  // Crear múltiples países y ciudades
  async bulkCreateLocations(data: BulkLocationDataDto): Promise<Response> {
    const results = {
      countries: 0,
      cities: 0,
      errors: []
    };

    try {
      // Crear países primero
      for (const countryData of data.countries) {
        try {
          const existingCountry = await this.countryModel.findOne({ code: countryData.code });
          if (!existingCountry) {
            await this.countryModel.create(countryData);
            results.countries++;
          }
        } catch (error) {
          (results.errors as string[]).push(`Error creating country ${countryData.name}: ${error.message}`);
        }
      }

      // Crear ciudades
      for (const countryData of data.countries) {
        const country = await this.countryModel.findOne({ code: countryData.code });
        if (country && countryData.cities) {
          for (const cityData of countryData.cities) {
            try {
              const existingCity = await this.cityModel.findOne({
                name: cityData.name,
                countryId: country._id
              });
              if (!existingCity) {
                await this.cityModel.create({
                  ...cityData,
                  countryId: country._id
                });
                results.cities++;
              }
            } catch (error) {
              (results.errors as string[]).push(`Error creating city ${cityData.name}: ${error.message}`);
            }
          }
        }
      }

      return {
        access_token: null,
        data: results,
        message: `Bulk creation completed: ${results.countries} countries and ${results.cities} cities created`
      };
    } catch (error) {
      return {
        access_token: null,
        data: null,
        message: `Bulk creation failed: ${error.message}`
      };
    }
  }

  async getAllCountries(): Promise<Response> {
    try {
      const countries = await this.countryModel.find({ isActive: true }).sort({ name: 1 });
      return {
        access_token: null,
        data: { countries },
        message: 'Countries retrieved successfully'
      };
    } catch (error) {
      return {
        access_token: null,
        data: null,
        message: `Error retrieving countries: ${error.message}`
      };
    }
  }

  async getCitiesByCountry(countryId: string): Promise<Response> {

    try {
      // Validar que el countryId sea un ObjectId válido
      if (!Types.ObjectId.isValid(countryId)) {
        return {
          access_token: null,
          data: null,
          message: 'Invalid country ID format'
        };
      }
  
      // Convertir el string a ObjectId
      const objectId = new Types.ObjectId(countryId);
      
      const cities = await this.cityModel.find({ 
        countryId: objectId, 
        isActive: true 
      })
        .populate('countryId')
        .sort({ name: 1 });
        
      return {
        access_token: null,
        data: { cities },
        message: 'Cities retrieved successfully'
      };
    } catch (error) {
      return {
        access_token: null,
        data: null,
        message: `Error retrieving cities: ${error.message}`
      };
    }
  }

  // También actualizar el método searchCities para manejar el ObjectId
  async searchCities(query: string, countryId?: string): Promise<Response> {
    try {
      const filter: any = {
        name: { $regex: query, $options: 'i' },
        isActive: true
      };
      
      if (countryId) {
        // Validar que el countryId sea un ObjectId válido
        if (!Types.ObjectId.isValid(countryId)) {
          return {
            access_token: null,
            data: null,
            message: 'Invalid country ID format'
          };
        }
        filter.countryId = new Types.ObjectId(countryId);
      }
  
      const cities = await this.cityModel.find(filter)
        .populate('countryId')
        .limit(20)
        .sort({ population: -1 });
  
      return {
        access_token: null,
        data: { cities },
        message: `Found ${cities.length} cities matching "${query}"`
      };
    } catch (error) {
      return {
        access_token: null,
        data: null,
        message: `Error searching cities: ${error.message}`
      };
    }
  }

  async getLocationById(cityId: string): Promise<Response> {
    try {
      const city = await this.cityModel.findById(cityId).populate('countryId');
      if (!city) {
        return {
          access_token: null,
          data: null,
          message: 'City not found'
        };
      }
      return {
        access_token: null,
        data: { city },
        message: 'City retrieved successfully'
      };
    } catch (error) {
      return {
        access_token: null,
        data: null,
        message: `Error retrieving city: ${error.message}`
      };
    }
  }

  async getCountryByCode(code: string): Promise<Response> {
    try {
      const country = await this.countryModel.findOne({ code: code.toUpperCase() });
      if (!country) {
        return {
          access_token: null,
          data: null,
          message: 'Country not found'
        };
      }
      return {
        access_token: null,
        data: { country },
        message: 'Country retrieved successfully'
      };
    } catch (error) {
      return {
        access_token: null,
        data: null,
        message: `Error retrieving country: ${error.message}`
      };
    }
  }

  async getCitiesNearby(latitude: number, longitude: number, maxDistance: number = 100): Promise<Response> {
    try {
      const cities = await this.cityModel.find({
        latitude: { $exists: true },
        longitude: { $exists: true },
        $expr: {
          $lte: [
            {
              $multiply: [
                6371, // Radio de la Tierra en km
                {
                  $acos: {
                    $add: [
                      {
                        $multiply: [
                          { $sin: { $degreesToRadians: latitude } },
                          { $sin: { $degreesToRadians: '$latitude' } }
                        ]
                      },
                      {
                        $multiply: [
                          { $cos: { $degreesToRadians: latitude } },
                          { $cos: { $degreesToRadians: '$latitude' } },
                          { $cos: { $degreesToRadians: { $subtract: [longitude, '$longitude'] } } }
                        ]
                      }
                    ]
                  }
                }
              ]
            },
            maxDistance
          ]
        }
      }).populate('countryId');

      return {
        access_token: null,
        data: { cities },
        message: `Found ${cities.length} cities within ${maxDistance}km`
      };
    } catch (error) {
      return {
        access_token: null,
        data: null,
        message: `Error finding nearby cities: ${error.message}`
      };
    }
  }
}