import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categories } from 'src/entity/categories.entity';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Categories) private readonly categoriesRepository: Repository<Categories>,
    ) { }
}
