import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JobType, JobTypeDocument } from './schemas/job-type.schema';
import { CreateJobTypeDto } from './dto/create-job-type.dto';
import { CreateManyJobTypesDto } from './dto/create-many-job-types.dto';
import { Response } from '../interfaces/response.interface';
import { StemmingService } from './services/stemming.service';

@Injectable()
export class JobTypesService {
  constructor(
    @InjectModel(JobType.name) private jobTypeModel: Model<JobTypeDocument>,
    private stemmingService: StemmingService,
  ) {}

  async create(createJobTypeDto: CreateJobTypeDto): Promise<Response> {
    try {
      // Generar el stemmed del nombre del trabajo
      const stemmed = this.stemmingService.stemPhrase(createJobTypeDto.name);
      
      // Verificar si ya existe un tipo de trabajo con stem similar
      const similarJobTypes = await this.findSimilarJobTypes(createJobTypeDto.name);
      
      if (similarJobTypes.length > 0) {
        throw new ConflictException(
          `Existen tipos de trabajo similares: ${similarJobTypes.map(jt => jt.name).join(', ')}`
        );
      }
      
      // Crear el nuevo tipo de trabajo con su stem
      const newJobType = new this.jobTypeModel({
        ...createJobTypeDto,
        stemmed,
      });
      
      const savedJobType = await newJobType.save();
      
      return {
        access_token: null,
        data: { jobType: savedJobType },
        message: `Tipo de trabajo '${savedJobType.name}' creado exitosamente`,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new Error(`Error al crear el tipo de trabajo: ${error.message}`);
    }
  }
  
  // Nuevo método para encontrar tipos de trabajo similares
  async findSimilarJobTypes(jobName: string, similarityThreshold = 0.85): Promise<JobType[]> {
    // Obtener todos los tipos de trabajo
    const allJobTypes = await this.jobTypeModel.find().exec();
    
    // Filtrar por similitud usando el servicio de stemming
    return allJobTypes.filter(jobType => {
      const similarity = this.stemmingService.calculateSimilarity(jobName, jobType.name);
      return similarity >= similarityThreshold;
    });
  }
  
  // Modificar el método de búsqueda para usar stemming
  async search(query: string): Promise<Response> {
    // Si la consulta está vacía, devolver todos los tipos de trabajo
    if (!query || query.trim() === '') {
      return this.findAll();
    }
    
    // Obtener el stem de la consulta
    console.log('query', query);
    const stemmedQuery = this.stemmingService.stemPhrase(query);
    
    console.log('stemmedQuery', stemmedQuery);
    // Búsqueda más flexible usando regex para todos los campos relevantes
    const regexSearch = new RegExp(query, 'i');
    const jobTypes = await this.jobTypeModel.find({
      $or: [
        { name: regexSearch },
        { category: regexSearch },
        { description: regexSearch },
        { synonyms: regexSearch },
        { stemmed: { $regex: stemmedQuery, $options: 'i' } }
      ]
    }).exec();
    
    console.log('jobTypes', jobTypes);
    return {
      access_token: null,
      data: { jobTypes },
      message: `Se encontraron ${jobTypes.length} tipos de trabajo que coinciden con la búsqueda '${query}'`,
    };
  }

  async createMany(createManyJobTypesDto: CreateManyJobTypesDto): Promise<Response> {
    try {
      const { jobTypes } = createManyJobTypesDto;
      
      // Filtrar tipos de trabajo que ya existen
      const existingNames = await this.jobTypeModel.find({
        name: { $in: jobTypes.map(jt => jt.name) }
      }).distinct('name').exec();
      
      // Filtrar solo los nuevos tipos de trabajo
      const newJobTypes = jobTypes.filter(jt => !existingNames.includes(jt.name));
      
      if (newJobTypes.length === 0) {
        return {
          access_token: null,
          data: { jobTypes: [] },
          message: 'Todos los tipos de trabajo ya existen en la base de datos',
        };
      }
      
      // Insertar los nuevos tipos de trabajo
      const insertedJobTypes = await this.jobTypeModel.insertMany(newJobTypes, { ordered: false });
      
      return {
        access_token: null,
        data: { jobTypes: insertedJobTypes },
        message: `${insertedJobTypes.length} tipos de trabajo creados exitosamente`,
      };
    } catch (error) {
      throw new Error(`Error al crear múltiples tipos de trabajo: ${error.message}`);
    }
  }

  async findAll(): Promise<Response> {
    const jobTypes = await this.jobTypeModel.find().sort({ category: 1, name: 1 }).exec();
    return {
      access_token: null,
      data: { jobTypes },
      message: `Se encontraron ${jobTypes.length} tipos de trabajo`,
    };
  }

  async findByCategory(category: string): Promise<Response> {
    const jobTypes = await this.jobTypeModel.find({ category }).sort({ name: 1 }).exec();
    return {
      access_token: null,
      data: { jobTypes },
      message: `Se encontraron ${jobTypes.length} tipos de trabajo en la categoría '${category}'`,
    };
  }

  async findByName(name: string): Promise<Response> {
    // Búsqueda insensible a mayúsculas/minúsculas con expresión regular
    const regex = new RegExp(name, 'i');
    const jobTypes = await this.jobTypeModel.find({ name: regex }).sort({ category: 1, name: 1 }).exec();
    
    return {
      access_token: null,
      data: { jobTypes },
      message: `Se encontraron ${jobTypes.length} tipos de trabajo que coinciden con '${name}'`,
    };
  }

  // Nuevo método para sugerir tipos de trabajo existentes
  async suggestJobTypes(query: string): Promise<Response> {
    // Si la consulta es muy corta, no hacer sugerencias todavía
    if (query.length < 3) {
      return {
        access_token: null,
        data: { jobTypes: [] },
        message: 'La consulta es demasiado corta',
      };
    }
    
    // Búsqueda por texto y también por coincidencia parcial
    const textSearchResults = await this.jobTypeModel.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    )
    .sort({ score: { $meta: 'textScore' } })
    .limit(5)
    .exec();
    
    // Búsqueda por coincidencia parcial en nombre y sinónimos
    const regexSearch = new RegExp(query, 'i');
    const regexResults = await this.jobTypeModel.find({
      $or: [
        { name: regexSearch },
        { synonyms: regexSearch }
      ]
    })
    .limit(10)
    .exec();
    
    // Combinar resultados y eliminar duplicados
    const combinedResults = [...textSearchResults];
    for (const job of regexResults) {
      if (!combinedResults.some((j: any) => j._id.toString() === job._id!.toString())) {
        combinedResults.push(job);
      }
    }
    
    return {
      access_token: null,
      data: { jobTypes: combinedResults.slice(0, 10) },
      message: `Se encontraron ${combinedResults.length} sugerencias para '${query}'`,
    };
  }

  async findOne(id: string): Promise<Response> {
    const jobType = await this.jobTypeModel.findById(id).exec();
    if (!jobType) {
      throw new NotFoundException(`Tipo de trabajo con ID ${id} no encontrado`);
    }
    
    return {
      access_token: null,
      data: { jobType },
      message: `Tipo de trabajo '${jobType.name}' encontrado exitosamente`,
    };
  }

  async update(id: string, updateData: Partial<JobType>): Promise<Response> {
    const updatedJobType = await this.jobTypeModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).exec();
    
    if (!updatedJobType) {
      throw new NotFoundException(`Tipo de trabajo con ID ${id} no encontrado`);
    }
    
    return {
      access_token: null,
      data: { jobType: updatedJobType },
      message: `Tipo de trabajo '${updatedJobType.name}' actualizado exitosamente`,
    };
  }

  async remove(id: string): Promise<Response> {
    const jobType = await this.jobTypeModel.findById(id).exec();
    if (!jobType) {
      throw new NotFoundException(`Tipo de trabajo con ID ${id} no encontrado`);
    }
    
    await this.jobTypeModel.findByIdAndDelete(id).exec();
    
    return {
      access_token: null,
      data: { jobType },
      message: `Tipo de trabajo '${jobType.name}' eliminado exitosamente`,
    };
  }
}