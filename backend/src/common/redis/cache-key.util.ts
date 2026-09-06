import { createHash } from 'crypto';
import { FindDishesQueryDto } from 'src/modules/dishes/dto/find-dishes-query.dto';
import { FindRestaurantsQueryDto } from 'src/modules/restaurants/dto/find-restaurants-query.dto';

function hashNormalizedQuery(normalized: Record<string, unknown>) {
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
export function hashDishListQuery(query: FindDishesQueryDto = {}) {
  return hashNormalizedQuery({
    categoryId: query.categoryId,
    categoryName: query.categoryName?.trim() || undefined,
    isAvailable: query.isAvailable,
    limit: query.limit ?? 24,
    page: query.page ?? 1,
    search: query.search?.trim() || undefined,
    sortBy: query.sortBy ?? 'createdAt',
    sortOrder: (query.sortOrder ?? 'DESC').toUpperCase(),
  });
}
export function hashRestaurantListQuery(query: FindRestaurantsQueryDto = {}) {
  return hashNormalizedQuery({
    address: query.address?.trim() || undefined,
    city: query.city?.trim() || undefined,
    cuisine: query.cuisine?.trim() || undefined,
    isOpen: query.isOpen,
    limit: query.limit ?? 12,
    maxRating: query.maxRating,
    minRating: query.minRating,
    page: query.page ?? 1,
    search: query.search?.trim() || undefined,
    sortBy: query.sortBy ?? 'createdAt',
    sortOrder: (query.sortOrder ?? 'DESC').toUpperCase(),
  });
}
