import { hashDishListQuery, hashRestaurantListQuery } from './cache-key.util';

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

describe('hashRestaurantListQuery', () => {
  it('creates the same hash for the same values in a different order', () => {
    expect(hashRestaurantListQuery({ page: 1, limit: 12 })).toEqual(
      hashRestaurantListQuery({ limit: 12, page: 1 }),
    );
  });

  it('creates different hashes for different pages and cities', () => {
    const base = hashRestaurantListQuery({ page: 1, limit: 12 });

    expect(hashRestaurantListQuery({ page: 2, limit: 12 })).not.toEqual(base);
    expect(
      hashRestaurantListQuery({ page: 1, limit: 12, city: 'Ho Chi Minh' }),
    ).not.toEqual(base);
  });

  it('trims city before hashing', () => {
    expect(hashRestaurantListQuery({ city: '  HCM  ' })).toEqual(
      hashRestaurantListQuery({ city: 'HCM' }),
    );
  });
});
