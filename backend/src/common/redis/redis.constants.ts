export const REDIS_CLIENT = Symbol('REDIS_CLIENT');

export const CACHE_KEYS = {
  categories: 'categories:all',
  dishLists: 'dishes:list:*',
} as const;

export const CACHE_TTL_SECONDS = {
  categories: 30 * 60,
} as const;
