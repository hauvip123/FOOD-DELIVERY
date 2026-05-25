import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoriesDto } from './dto/create-categories.dto';
import { UpdateCategoriDto } from './dto/update-categories.dto';

@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Post()
    createCategories(@Body() createCategory: CreateCategoriesDto) {
        console.log(createCategory)
        return this.categoriesService.createCategories(createCategory)

    }

    @Get()
    getAllCategories() {
        return this.categoriesService.getAllCategories()
    }

    @Patch('/:id')
    updateCategories(@Param('id') id: string, @Body() updateCategories: UpdateCategoriDto) {
        return this.categoriesService.updateCategories(Number(id), updateCategories);
    }

    @Delete('/:id')
    deleteCategories(@Param('id') id: string) {
        return this.categoriesService.deleteCategories(Number(id));
    }
}
