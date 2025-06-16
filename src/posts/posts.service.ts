import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    private usersService: UsersService,
  ) {}

  async create(userId: string, createPostDto: CreatePostDto): Promise<Post> {
    // Verificar que el usuario existe
    await this.usersService.findOne(userId);
    
    const newPost = new this.postModel({
      userId,
      ...createPostDto,
    });
    return newPost.save();
  }

  async findAll(): Promise<Post[]> {
    return this.postModel.find().sort({ createdAt: -1 }).exec();
  }

  async findByUserId(userId: string): Promise<Post[]> {
    return this.postModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Post> {
    const post = await this.postModel.findById(id).exec();
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }

  async remove(id: string, userId: string): Promise<void> {
    const post = await this.findOne(id);
    
    // Verificar que el usuario es el propietario de la publicación
    if (post.userId !== userId) {
      throw new NotFoundException('You are not authorized to delete this post');
    }
    
    await this.postModel.findByIdAndDelete(id).exec();
    // Eliminar también los comentarios asociados
    await this.commentModel.deleteMany({ postId: id }).exec();
  }

  async likePost(id: string, userId: string): Promise<Post> {
    const post = await this.findOne(id);
    
    // Verificar si el usuario ya dio like
    if (post.likes.includes(userId)) {
      // Quitar el like
      post.likes = post.likes.filter(id => id !== userId);
    } else {
      // Agregar el like
      post.likes.push(userId);
    }
    
    const updatedPost = await this.postModel.findByIdAndUpdate(id, { likes: post.likes }, { new: true }).exec();
    if (!updatedPost) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return updatedPost;
  }

  async addComment(postId: string, userId: string, createCommentDto: CreateCommentDto): Promise<Comment> {
    // Verificar que la publicación existe
    const post = await this.findOne(postId);
    
    // Crear el comentario
    const newComment = new this.commentModel({
      postId,
      userId,
      ...createCommentDto,
    });
    
    // Incrementar el contador de comentarios en la publicación
    await this.postModel.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } }).exec();
    
    return newComment.save();
  }

  async getComments(postId: string): Promise<Comment[]> {
    return this.commentModel.find({ postId }).sort({ createdAt: -1 }).exec();
  }

  async sharePost(id: string): Promise<Post> {
    const updatedPost = await this.postModel.findByIdAndUpdate(id, { $inc: { sharesCount: 1 } }, { new: true }).exec();
    if (!updatedPost) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return updatedPost;
  }
}