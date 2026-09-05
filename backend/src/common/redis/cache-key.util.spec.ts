import { hashDishListQuery } from './cache-key.util';

describe('hashDishListQuery', () => {
  it('creates the same hash for the same values in a different order', () => {
    expect(hashDishListQuery({ page: 1, limit: 24 })).toEqual(
      hashDishListQuery({ limit: 24, page: 1 }),
    );
  });

  it('creates different hashes for different pages, filters, and sort order', () => {
    const base = hashDishListQuery({ page: 1, limit: 24 });

    expect(hashDishListQuery({ page: 2, limit: 24 })).not.toEqual(base);
    expect(
      hashDishListQuery({ page: 1, limit: 24, categoryId: 1 }),
    ).not.toEqual(base);
    expect(
      hashDishListQuery({ page: 1, limit: 24, sortOrder: 'ASC' }),
    ).not.toEqual(base);
  });

  it('trims search text before hashing', () => {
    expect(hashDishListQuery({ search: '  pho  ' })).toEqual(
      hashDishListQuery({ search: 'pho' }),
    );
  });
});
