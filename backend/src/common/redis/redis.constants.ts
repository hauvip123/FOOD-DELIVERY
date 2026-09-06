export const REDIS_CLIENT = Symbol('REDIS_CLIENT');

export const CACHE_KEYS = {
  categories: 'categories:all',
  dishLists: 'dishes:list:*',
  dishList: (queryHash: string) => `dishes:list:${queryHash}`,
  dishDetail: (id: number) => `dishes:detail:${id}`,
  dishesByRestaurant: (id: number) => `dishes:restaurant:${id}`,
  restaurantLists: 'restaurants:list:*',
  restaurantList: (queryHash: string) => `restaurants:list:${queryHash}`,
  restaurantDetail: (id: number) => `restaurants:detail:${id}`,
} as const;

export const CACHE_TTL_SECONDS = {
  categories: 30 * 60,
  dishList: 5 * 60,
  dishDetail: 10 * 60,
  dishesByRestaurant: 5 * 60,
  restaurantList: 5 * 60,
  restaurantDetail: 10 * 60,
} as const;
