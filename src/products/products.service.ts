import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common';
import { validate as isUUID } from 'uuid';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      this.handelExeption(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    const totalPages = await this.productRepository.count();
    const lastPage = Math.ceil(totalPages / limit);

    const todo = {
      data: await this.productRepository.find({
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
    const productDetails = data.map(({ id, name, description, price }) => ({
      id,
      name,
      description,
      price,
    }));

    return { productDetails, meta };
  }

  async findOne(term: string) {
    let product: Product;

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      product = await this.productRepository.findOneBy({ name: term });
    }

    if (!product) throw new BadRequestException('Product not found');

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    
    await this.findOne(id);
    const {...toUpdate } = updateProductDto;
    
    try {
    const product = await this.productRepository.preload({
      id,
      ...toUpdate,
    });
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      this.handelExeption(error);
    }

  }

  async remove(id: string) {
    const product = await this.findOne(id);
    return await this.productRepository.softRemove(product);
  }

  private handelExeption(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpecte error, check server logs',
    );
  }
}
