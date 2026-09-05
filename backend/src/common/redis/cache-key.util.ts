import { createHash } from 'crypto';
import { FindDishesQueryDto } from 'src/modules/dishes/dto/find-dishes-query.dto';

export function hashDishListQuery(query: FindDishesQueryDto = {}) {
  const normalized = {
    categoryId: query.categoryId,
    categoryName: query.categoryName?.trim() || undefined,
    isAvailable: query.isAvailable,
    limit: query.limit ?? 24,
    page: query.page ?? 1,
    search: query.search?.trim() || undefined,
    sortBy: query.sortBy ?? 'createdAt',
    sortOrder: (query.sortOrder ?? 'DESC').toUpperCase(),
  };

  const sorted = Object.fromEntries(
    Object.entries(normalized)
      .filter(([, value]) => value !== undefined)
      .sort(([left], [right]) => left.localeCompare(right)),
  );

  return createHash('sha256')
    .update(JSON.stringify(sorted))
    .digest('hex')
    .slice(0, 12);
}
