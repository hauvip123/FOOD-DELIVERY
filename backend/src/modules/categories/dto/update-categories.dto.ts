import { PartialType } from "@nestjs/mapped-types";
import { CreateCategoriesDto } from "./create-categories.dto";

export class UpdateCategoriDto extends PartialType(CreateCategoriesDto) {
}