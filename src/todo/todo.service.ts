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
import { ILike, Repository } from 'typeorm';
import { PaginationDto } from 'src/common';
import { IsInt, isInt, IsNumber } from 'class-validator';

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
    const todoDetails = data.map(({ id, title, description }) => ({
      id,
      title,
      description,
    }));

    return { todoDetails, meta };
  }

  async findOne(term: string | number) {
    let todo: Todo | null = null;

    if (typeof term === 'number' || !isNaN(Number(term))) {
      todo = await this.todoRepository.findOne({ where: { id: Number(term) } });
    } else {
      todo = await this.todoRepository.findOne({
        where: { title: ILike(`%${term}%`) },
      });
    }
    // ILike(term) es una función de TypeORM que permite hacer búsquedas insensibles a mayúsculas y minúsculas.

    console.log({ term });
    if (!todo) throw new NotFoundException(`Todo ${term} not found`);
    return todo;
  }

  async update(id: number, updateTodoDto: UpdateTodoDto) {
    await this.findOne(id);
    const todo = await this.todoRepository.preload({
      id,
      ...updateTodoDto,
    });
    return await this.todoRepository.save(todo);
  }

  async remove(id: number) {
    const todo = await this.findOne(id);
    return await this.todoRepository.softRemove(todo);
  }

  async complete(id: number) {
    await this.todoRepository.update(id, { completed: true });
    return { message: 'Todo marked as complete' };
  }

  private handelExeption(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpecte error, check server logs',
    );
  }
}
