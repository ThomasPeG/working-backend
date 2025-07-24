import { NotificationRabbitmqService } from '../notifications/services/notification-rabbitmq.service';
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Job, JobDocument } from './schemas/job.schema';
import { JobComment, JobCommentDocument } from './schemas/job-comment.schema';
import { JobShare, JobShareDocument } from './schemas/job-share.schema';
import { CreateJobDto } from './dto/create-job.dto';
import { CreateJobCommentDto } from './dto/create-job-comment.dto';
import { UpdateJobCommentDto } from './dto/update-job-comment.dto';
import { CreateJobShareDto } from './dto/create-job-share.dto';
import { UsersService } from '../users/users.service';
import { Response } from 'src/interfaces/response.interface';
import { JobLike, JobLikeDocument } from './schemas/job-like.schema';
import { NotificationType } from 'src/notifications/types/notification.types';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
    @InjectModel(JobComment.name) private jobCommentModel: Model<JobCommentDocument>,
    @InjectModel(JobShare.name) private jobShareModel: Model<JobShareDocument>,
    @InjectModel(JobLike.name) private jobLikeModel: Model<JobLikeDocument>,
    private usersService: UsersService,
    private notificationRabbitmqService: NotificationRabbitmqService,
  ) {}

  async create(userId: string, createJobDto: CreateJobDto): Promise<Response> {

    // Verificar que el usuario existe
    const user = await this.usersService.findOne(userId);
    
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Convertir jobType string a ObjectId si está presente
    const jobData = {
      ...createJobDto,
      jobType: createJobDto.jobType ? new Types.ObjectId(createJobDto.jobType) : null
    };

    const newJob = new this.jobModel({
      userId: userId,
      ...jobData,
    });
    
    const JobSave = await newJob.save();
    // Crear una notificación para el usuario
    // await this.notificationClientService.createNotification({
    //   userId: userId,
    //   message: `Has creado un nuevo trabajo: ${createJobDto.title}`,
    //   type: NotificationType.JOB_POSTED,
    //   metadata: { jobId: JobSave._id }
    // });
    return {
      access_token: null,
      data: {job: JobSave},
      message: `Job created successfully`,
    };
  }

  async findAll(limit: number = 10, page: number = 1): Promise<Response> {
    // Condición básica: solo trabajos activos
    const where: any = { isActive: true };
    
    // Calcular el número de documentos a saltar
    const skip = (page - 1) * limit;
    
    // Obtener el total de documentos para calcular el total de páginas
    const total = await this.jobModel.countDocuments(where).exec();
    
    // Obtener los trabajos con paginación
    const jobs = await this.jobModel.find(where)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .allowDiskUse(true)  // Add this line to enable external sorting
      .exec();
    
    // Obtener la información de los usuarios que crearon los trabajos
    const jobsWithUserInfo = await Promise.all(jobs.map(async (job) => {
      // Obtener la información del usuario
      const userResponse = await this.usersService.findOne(job.userId);
      const user = userResponse.data.user;
      
      // Eliminar información sensible del usuario
      if (user) {
        delete user.password;
      }
      
      // Devolver el trabajo con la información del usuario
      return {
        ...job.toObject(),
        user: user
      };
    }));
    
    return {
      access_token: null,
      data: { 
        jobs: jobsWithUserInfo,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      },
      message: 'Jobs retrieved successfully',
    };
  }

  async findOne(id: string): Promise<Job> {
    const job = await this.jobModel.findById(id).exec();
    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
    return job;
  }

  async getJobById(id: string): Promise<Response> {
    const job = await this.findOne(id);
    return {
      access_token: null,
      data: { job },
      message: 'Job retrieved successfully',
    };
  }

  async findByUserId(userId: string, limit: number = 10, page: number = 1): Promise<Response> {
    const skip = (page - 1) * limit;
    
    const total = await this.jobModel.countDocuments({ userId }).exec();
    const jobs = await this.jobModel.find({ userId }).populate('jobType')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .allowDiskUse(true)
      .exec();
      
    return {
      access_token: null,
      data: { 
        jobs,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      },
      message: 'User jobs retrieved successfully',
    };
  }

  async update(id: string, userId: string, updateData: Partial<Job>): Promise<Response> {
    const job = await this.findOne(id);
    
    // Verificar que el usuario es el propietario del trabajo
    if (job.userId !== userId) {
      throw new ForbiddenException('You are not authorized to update this job');
    }
    
    const updatedJob = await this.jobModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
    if (!updatedJob) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
    return {
      access_token: null,
      data: { job: updatedJob },
      message: 'Job updated successfully',
    };
  }

  async remove(id: string, userId: string): Promise<Response> {
    const job = await this.findOne(id);
    
    // Verificar que el usuario es el propietario del trabajo
    if (job.userId !== userId) {
      throw new ForbiddenException('You are not authorized to delete this job');
    }
    
    await this.jobModel.findByIdAndDelete(id).exec();
    // Eliminar también los comentarios y compartires asociados
    await this.jobCommentModel.deleteMany({ jobId: id }).exec();
    await this.jobShareModel.deleteMany({ jobId: id }).exec();
    await this.jobLikeModel.deleteMany({ jobId: id }).exec();
    
    return {
      access_token: null,
      data: null,
      message: 'Job deleted successfully',
    };
  }

  async likeJob(id: string, userId: string): Promise<Response> {
    // Verificar que el trabajo existe
    const job = await this.findOne(id);
    
    // Buscar si ya existe un like de este usuario para este trabajo
    const existingLike = await this.jobLikeModel.findOne({ jobId: id, userId }).exec();
    
    if (existingLike) {
      // Si ya existe, eliminar el like
      await this.jobLikeModel.findByIdAndDelete(existingLike._id).exec();
      
      // Actualizar el contador de likes en el trabajo
      const updatedJob = await this.jobModel.findByIdAndUpdate(
        id, 
        { $pull: { likes: userId } }, 
        { new: true }
      ).exec();
      
      return {
        access_token: null,
        data: { job: updatedJob },
        message: 'Like removed successfully',
      };
    } else {
      // Si no existe, crear un nuevo like
      const newLike = new this.jobLikeModel({
        jobId: id,
        userId,
      });
      
      await newLike.save();
      
      // Actualizar el contador de likes en el trabajo
      const updatedJob = await this.jobModel.findByIdAndUpdate(
        id, 
        { $push: { likes: userId } }, 
        { new: true }
      ).exec();
      
      return {
        access_token: null,
        data: { job: updatedJob },
        message: 'Job liked successfully',
      };
    }
  }

  async getJobLikes(jobId: string): Promise<Response> {
    const likes = await this.jobLikeModel.find({ jobId }).exec();
    return {
      access_token: null,
      data: { likes },
      message: 'Job likes retrieved successfully',
    };
  }

  async addComment(jobId: string, userId: string, createJobCommentDto: CreateJobCommentDto): Promise<Response> {
    // Verificar que el trabajo existe
    const job = await this.findOne(jobId);
    
    // Crear el comentario
    const newComment = new this.jobCommentModel({
      jobId,
      userId,
      content: createJobCommentDto.content,
    });
    
    // Incrementar el contador de comentarios en el trabajo
    await this.jobModel.findByIdAndUpdate(jobId, { $inc: { commentsCount: 1 } }).exec();
    
    const savedComment = await newComment.save();
    return {
      access_token: null,
      data: { comment: savedComment },
      message: 'Comment added successfully',
    };
  }

  async getComments(jobId: string): Promise<Response> {
    const comments = await this.jobCommentModel.find({ jobId }).sort({ createdAt: -1 }).exec();
    return {
      access_token: null,
      data: { comments },
      message: 'Comments retrieved successfully',
    };
  }

  async updateComment(userId: string, commentId: string, updateJobCommentDto: UpdateJobCommentDto): Promise<Response> {
    const comment = await this.jobCommentModel.findById(commentId).exec();
    
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }
    
    if (comment.userId !== userId) {
      throw new ForbiddenException('You are not authorized to update this comment');
    }
    
    const updatedComment = await this.jobCommentModel.findByIdAndUpdate(
      commentId, 
      { content: updateJobCommentDto.content }, 
      { new: true }
    ).exec();
    
    if (!updatedComment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }
    
    return {
      access_token: null,
      data: { comment: updatedComment },
      message: 'Comment updated successfully',
    };
  }

  async deleteComment(userId: string, commentId: string): Promise<Response> {
    const comment = await this.jobCommentModel.findById(commentId).exec();
    
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }
    
    if (comment.userId !== userId) {
      throw new ForbiddenException('You are not authorized to delete this comment');
    }
    
    await this.jobCommentModel.findByIdAndDelete(commentId).exec();
    
    // Decrementar el contador de comentarios en el trabajo
    await this.jobModel.findByIdAndUpdate(comment.jobId, { $inc: { commentsCount: -1 } }).exec();
    
    return {
      access_token: null,
      data: null,
      message: 'Comment deleted successfully',
    };
  }

  async shareJob(userId: string, createJobShareDto: CreateJobShareDto): Promise<Response> {
    const { jobId, sharedTo } = createJobShareDto;
    
    // Verificar que el trabajo existe
    const job = await this.findOne(jobId);
    
    // Crear el share
    const newShare = new this.jobShareModel({
      jobId,
      userId,
      sharedTo,
    });
    
    // Incrementar el contador de compartidos en el trabajo
    await this.jobModel.findByIdAndUpdate(jobId, { $inc: { sharesCount: 1 } }).exec();
    
    const savedShare = await newShare.save();
    return {
      access_token: null,
      data: { share: savedShare },
      message: 'Job shared successfully',
    };
  }
}
