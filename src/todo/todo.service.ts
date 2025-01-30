import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Todo } from './entities/todo.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/common';
import { isInt } from 'class-validator';

@Injectable()
export class TodoService {
  private readonly logger = new Logger('TodoService');

  constructor(
    @InjectRepository(Todo)
    private readonly todoRepository: Repository<Todo>,
  ) {}
  async create(createTodoDto: CreateTodoDto) {
    try {
      const todo = this.todoRepository.create(createTodoDto);
      await this.todoRepository.save(todo);
      return todo;
    } catch (error) {
      this.handelExeption(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    const totalPages = await this.todoRepository.count();
    const lastPage = Math.ceil(totalPages / limit);

    const todo = {
      data: await this.todoRepository.find({
        skip: (page - 1) * limit,
        take: limit,
      }),
      meta: {
        total: totalPages,
        page: page,
        lastPage: lastPage,
      },
    };

    const { data, meta } = todo;
    const todoDetails = data.map(
      ({ id, title, description }) => ({
        id,
        title,
        description,
      }),
    );

    return { todoDetails, meta };
  }

  async findOne(term: number | string) {
    let todo: Todo;
    if (typeof term === 'number') {
      todo = await this.todoRepository.findOneBy({ id:term });
    } else if (typeof term === 'string') {
      todo = await this.todoRepository.findOneBy({ title:term });      
    }
    
    console.log({term});
    if (!todo) throw new NotFoundException(`Todo ${term} not found`);

    return todo;
  }

  update(id: number, updateTodoDto: UpdateTodoDto) {
    return `This action updates a #${id} todo`;
  }

  remove(id: number) {
    return `This action removes a #${id} todo`;
  }

  complete(id: number) {
    return `This action complete a #${id} todo`;
  }

  private handelExeption(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpecte error, check server logs',
    );
  }
}
