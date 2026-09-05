# Hướng dẫn cache restaurant với Redis

Tài liệu này mô tả phần Redis đã có và các bước cache nhà hàng. Đây là **Bước 6** trong `REDIS_INTEGRATION_PLAN.md`.

Chưa viết code restaurant cache trong tài liệu này. Làm lần lượt, kiểm tra xong bước trước mới sang bước sau.

## 1. Đã hoàn thành

- Redis chạy bằng Docker Compose.
- Backend đã có `RedisModule` và `RedisService`.
- Đã cache category.
- Đã cache dish:
  - `GET /dishes`
  - `GET /dishes/:id`
  - `GET /dishes/restaurant/:id`
- Create/update/delete category hoặc dish đã xóa cache liên quan.

## 2. Việc cần làm

Cache 2 API đọc public:

```text
GET /restaurants
GET /restaurants/:id
```

File cần sửa:

```text
backend/src/common/redis/redis.constants.ts
backend/src/common/redis/cache-key.util.ts
backend/src/modules/restaurants/restaurants.service.ts
backend/src/modules/restaurants/restaurants.service.spec.ts
```

Có thể thêm test helper:

```text
backend/src/common/redis/cache-key.util.spec.ts
```

Không cần sửa:

```text
backend/src/modules/restaurants/restaurants.module.ts
backend/src/modules/restaurants/restaurants.controller.ts
```

`RedisModule` đã `@Global()` và được import trong `backend/src/app.module.ts`. `RestaurantsService` chỉ cần inject `RedisService`.

## 3. Không cache các API này

| Method | API | Lý do |
| --- | --- | --- |
| `findAllAdmin()` | `GET /restaurants/admin/list` | Dữ liệu quản trị, cần mới |
| `findByOwner()` | `GET /restaurants/my-restaurants` | Dữ liệu theo owner |
| `findFavoriteRestaurants()` | `GET /restaurants/favorites` | Dữ liệu theo user, đổi thường xuyên |
| `findFavoriteRestaurantIds()` | `GET /restaurants/favorites/ids` | Dữ liệu theo user |
| `checkFavoriteRestaurant()` | `GET /restaurants/:id/favorite` | Dữ liệu theo user |

Không cache giỏ hàng, đơn hàng, thanh toán, chat hay profile.

## 4. Code hiện có cần biết

### 4.1. `RedisService`

Các hàm dùng lại, không viết Redis client mới:

| Hàm | Việc |
| --- | --- |
| `get<T>(key)` | Đọc cache. Redis lỗi thì trả `null` |
| `set(key, value, ttlSeconds)` | Lưu JSON, bắt buộc có TTL |
| `delete(...keys)` | Xóa key cụ thể |
| `deleteByPattern(pattern)` | Xóa nhiều key bằng `SCAN` |

Prefix `hungerdash:` do `RedisService` tự thêm. Service nghiệp vụ chỉ truyền key như:

```text
restaurants:detail:4
```

### 4.2. `redis.constants.ts` hiện tại

```ts
export const CACHE_KEYS = {
  categories: 'categories:all',
  dishLists: 'dishes:list:*',
  dishList: (queryHash: string) => `dishes:list:${queryHash}`,
  dishDetail: (id: number) => `dishes:detail:${id}`,
  dishesByRestaurant: (id: number) => `dishes:restaurant:${id}`,
} as const;

export const CACHE_TTL_SECONDS = {
  categories: 30 * 60,
  dishList: 5 * 60,
  dishDetail: 10 * 60,
  dishesByRestaurant: 5 * 60,
} as const;
```

Chưa có key restaurant. Bước này sẽ thêm, không đổi tên key dish/category đang dùng.

### 4.3. `hashDishListQuery()`

File:

```text
backend/src/common/redis/cache-key.util.ts
```

Hàm này đã chuẩn hóa query dish rồi hash SHA-256, lấy 12 ký tự. Restaurant list làm tương tự, nhưng field query khác.

### 4.4. `RestaurantsService` hiện tại

Chưa dùng Redis.

| Method | Việc hiện tại |
| --- | --- |
| `findAll(query)` | Filter, sort, pagination. Default `page=1`, `limit=12` |
| `findByid(id)` | `findOne({ where: { id } })` |
| `createRestaurant()` | `save()` rồi trả restaurant mới |
| `updateRestaurant()` | `Object.assign` rồi `save()` |
| `deleteRestaurant()` | `delete(id)` |

Query của `GET /restaurants` nằm trong `FindRestaurantsQueryDto`:

- `search`
- `city`
- `address`
- `cuisine`
- `isOpen`
- `minRating`
- `maxRating`
- `sortBy`
- `sortOrder`
- `page`
- `limit`

Hai URL cùng giá trị, khác thứ tự tham số, phải ra cùng cache key.

## 5. Quy ước key và TTL

Prefix `hungerdash:` do `RedisService` thêm. Bảng dưới chỉ phần key nghiệp vụ.

| Dữ liệu | Key | TTL |
| --- | --- | --- |
| Danh sách nhà hàng theo query | `restaurants:list:<query-hash>` | 5 phút |
| Tất cả danh sách nhà hàng | `restaurants:list:*` | dùng để xóa |
| Chi tiết nhà hàng | `restaurants:detail:<id>` | 10 phút |

Key đầy đủ ví dụ:

```text
hungerdash:restaurants:list:c84f9127b341
hungerdash:restaurants:detail:4
```

Khi nhà hàng thay đổi, còn phải xóa cache dish vì `GET /dishes` join restaurant:

```text
dishes:list:*
dishes:restaurant:<restaurantId>
```

Chỉ cache response thành công. Không cache `NotFoundException`.

## 6. Các bước làm

### Bước 1: mở rộng constants

Sửa `backend/src/common/redis/redis.constants.ts`.

Giữ nguyên key category/dish. Thêm:

```ts
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
```

Không viết số `300` hoặc `600` rải rác trong service.

`CategoriesService` đang dùng `CACHE_KEYS.dishLists`. `DishesService` đang dùng `dishList`, `dishDetail`, `dishesByRestaurant`. Không đổi các tên đó.

### Bước 2: thêm helper hash query nhà hàng

Sửa `backend/src/common/redis/cache-key.util.ts`.

Giữ `hashDishListQuery()`. Thêm `hashRestaurantListQuery()`.

Default phải giống `findAll()`:

- `page = 1`
- `limit = 12`
- `sortBy = 'createdAt'`
- `sortOrder = 'DESC'`

Trim `search`, `city`, `address`, `cuisine`.

Gợi ý:

```ts
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

export function hashRestaurantListQuery(
  query: FindRestaurantsQueryDto = {},
) {
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
```

Hai URL sau phải cùng hash:

```text
/restaurants?page=1&limit=12
/restaurants?limit=12&page=1
```

Các URL sau phải khác hash:

```text
/restaurants?page=1&limit=12
/restaurants?page=2&limit=12
/restaurants?page=1&limit=12&city=Ho Chi Minh
/restaurants?page=1&limit=12&sortOrder=ASC
```

Thêm test vào `cache-key.util.spec.ts` cho 3 case trên, cộng case trim `city` hoặc `search`.

### Bước 3: inject Redis vào RestaurantsService

Trong `backend/src/modules/restaurants/restaurants.service.ts`:

```ts
import { RedisService } from 'src/common/redis/redis.service';
import {
  CACHE_KEYS,
  CACHE_TTL_SECONDS,
} from 'src/common/redis/redis.constants';
import { hashRestaurantListQuery } from 'src/common/redis/cache-key.util';
```

Constructor:

```ts
constructor(
  @InjectRepository(Restaurant)
  private readonly restaurantRepository: Repository<Restaurant>,
  @InjectRepository(FavoriteRestaurant)
  private readonly favoriteRestaurantRepository: Repository<FavoriteRestaurant>,
  private readonly redisService: RedisService,
) {}
```

Không sửa `restaurants.module.ts`.

### Bước 4: cache `findByid()` trước

API đơn giản nhất. Làm trước.

Luồng:

1. Key `CACHE_KEYS.restaurantDetail(id)`.
2. Đọc Redis.
3. Có cache thì trả cache.
4. Không có thì `findOne({ where: { id } })`.
5. Không tìm thấy thì `throw new NotFoundException`. Không cache lỗi.
6. Tạo response thành công.
7. Lưu Redis với `CACHE_TTL_SECONDS.restaurantDetail`.
8. Trả response.

Khung code:

```ts
async findByid(id: number) {
  const cacheKey = CACHE_KEYS.restaurantDetail(id);
  const cached = await this.redisService.get<{
    statusCode: number;
    message: string;
    data: Restaurant;
  }>(cacheKey);

  if (cached) {
    return cached;
  }

  const restaurant = await this.restaurantRepository.findOne({
    where: { id },
  });
  if (!restaurant) {
    throw new NotFoundException('Restaurant not found');
  }

  const response = {
    statusCode: 200,
    message: 'Restaurant found successfully',
    data: restaurant,
  };

  await this.redisService.set(
    cacheKey,
    response,
    CACHE_TTL_SECONDS.restaurantDetail,
  );

  return response;
}
```

Kiểm tra:

```bash
curl http://localhost:3000/restaurants/1
docker compose exec redis redis-cli --scan --pattern 'hungerdash:restaurants:detail:*'
docker compose exec redis redis-cli TTL hungerdash:restaurants:detail:1
```

TTL phải lớn hơn `0` và không lớn hơn `600`.

### Bước 5: cache `findAll(query)`

Không đổi logic filter hiện tại. Chỉ bọc cache-aside bên ngoài.

Luồng:

1. Hash query bằng `hashRestaurantListQuery(query)`.
2. Key `CACHE_KEYS.restaurantList(queryHash)`.
3. Đọc Redis.
4. Có cache thì trả luôn, không chạy QueryBuilder.
5. Không có cache thì giữ nguyên query hiện tại.
6. Cache cả `data` và `meta`.
7. TTL `CACHE_TTL_SECONDS.restaurantList`.

Khung:

```ts
async findAll(query: FindRestaurantsQueryDto) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 12;
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy ?? 'createdAt';
  const sortOrder = (query.sortOrder ?? 'DESC').toUpperCase() as
    | 'ASC'
    | 'DESC';

  const cacheKey = CACHE_KEYS.restaurantList(
    hashRestaurantListQuery(query),
  );
  const cached = await this.redisService.get<{
    statusCode: number;
    message: string;
    data: Restaurant[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>(cacheKey);

  if (cached) {
    return cached;
  }

  // giữ nguyên QueryBuilder hiện tại

  const response = {
    statusCode: 200,
    message: 'Restaurants found successfully',
    data: restaurants,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };

  await this.redisService.set(
    cacheKey,
    response,
    CACHE_TTL_SECONDS.restaurantList,
  );

  return response;
}
```

Nhớ `set()` sau khi query MySQL. Đừng chỉ `get()` rồi `return` như lỗi từng gặp ở dish.

### Bước 6: viết hàm xóa cache

Thêm private method:

```ts
private async invalidateRestaurantCache(restaurantId?: number) {
  const keys = [
    restaurantId ? CACHE_KEYS.restaurantDetail(restaurantId) : undefined,
    restaurantId ? CACHE_KEYS.dishesByRestaurant(restaurantId) : undefined,
  ].filter((key): key is string => Boolean(key));

  await Promise.all([
    this.redisService.deleteByPattern(CACHE_KEYS.restaurantLists),
    this.redisService.deleteByPattern(CACHE_KEYS.dishLists),
    keys.length > 0
      ? this.redisService.delete(...keys)
      : Promise.resolve(),
  ]);
}
```

Vì sao xóa dish:

- `GET /dishes` join `dish.restaurant`.
- `GET /dishes/restaurant/:id` lấy món theo nhà hàng.
- Sửa tên, `isOpen`, `deliveryFee` của nhà hàng làm response dish cũ sai.

Map đúng `restaurantIds` thành key. Không spread mảng số trực tiếp vào `delete()`.

Chỉ xóa cache sau khi MySQL `save()` hoặc `delete()` thành công.

### Bước 7: invalidation khi tạo nhà hàng

Sau `save()` trong `createRestaurant()`:

```ts
await this.invalidateRestaurantCache();
```

Chỉ cần xóa:

```text
restaurants:list:*
dishes:list:*
```

Nhà hàng mới chưa có `restaurants:detail:<id>` hay `dishes:restaurant:<id>`. Truyền `restaurantId` cũng không sai, nhưng không bắt buộc.

Không cache `createRestaurant()` response.

### Bước 8: invalidation khi cập nhật nhà hàng

Sau `save()` trong `updateRestaurant()`:

```ts
await this.invalidateRestaurantCache(updatedRestaurant.id);
```

Xóa:

```text
restaurants:list:*
restaurants:detail:<id>
dishes:list:*
dishes:restaurant:<id>
```

Không cần `previousRestaurantId` như dish. Update nhà hàng không đổi `id` của chính nhà hàng đó.

Nếu sau này review làm đổi `ratingAverage`, hàm này vẫn đúng vì vẫn xóa detail và list.

### Bước 9: invalidation khi xóa nhà hàng

Trong `deleteRestaurant()`, xóa cache sau khi MySQL xóa thành công:

```ts
async deleteRestaurant(id: number) {
  await this.restaurantRepository.delete(id);
  await this.invalidateRestaurantCache(id);

  return {
    statusCode: 200,
    message: 'Restaurant deleted successfully',
  };
}
```

Xóa:

```text
restaurants:list:*
restaurants:detail:<id>
dishes:list:*
dishes:restaurant:<id>
```

### Bước 10: viết test

Cập nhật `backend/src/modules/restaurants/restaurants.service.spec.ts`.

Mock:

- `Restaurant` repository
- `FavoriteRestaurant` repository
- `RedisService`

Các case:

1. `findByid()` cache hit: không gọi `findOne`.
2. `findByid()` cache miss: gọi MySQL rồi `set`.
3. `findByid()` không tìm thấy: ném `NotFoundException`, không `set`.
4. `findAll()` cache hit: không gọi QueryBuilder.
5. `createRestaurant()` xóa `restaurants:list:*` và `dishes:list:*`.
6. `updateRestaurant()` xóa detail, list, `dishes:list:*` và `dishes:restaurant:<id>`.
7. `deleteRestaurant()` xóa đúng các key trên.

Không cần test favorite trong bước này.

### Bước 11: kiểm tra thủ công

```bash
docker compose up -d redis
cd backend
npm run start:dev
```

Chi tiết:

```bash
curl http://localhost:3000/restaurants/1
curl http://localhost:3000/restaurants/1
docker compose exec redis redis-cli --scan --pattern 'hungerdash:restaurants:*'
docker compose exec redis redis-cli TTL hungerdash:restaurants:detail:1
```

Danh sách:

```bash
curl 'http://localhost:3000/restaurants?page=1&limit=12'
curl 'http://localhost:3000/restaurants?limit=12&page=1'
curl 'http://localhost:3000/restaurants?page=2&limit=12'
curl 'http://localhost:3000/restaurants?page=1&limit=12&city=Ho Chi Minh'
```

Hai request đầu dùng chung một key list. Các request sau tạo key khác.

Invalidation:

1. Gọi `GET /restaurants` và `GET /restaurants/1` để tạo cache.
2. Cập nhật nhà hàng.
3. Key detail, list, `dishes:list:*` và `dishes:restaurant:1` phải bị xóa.
4. Gọi lại API đọc phải ra dữ liệu mới.

Redis down:

```bash
docker compose stop redis
curl http://localhost:3000/restaurants
curl http://localhost:3000/restaurants/1
```

API vẫn trả MySQL. Backend chỉ warning, không crash.

Bật lại:

```bash
docker compose start redis
```

### Bước 12: lệnh verify

Trong `backend`:

```bash
npx eslint src/common/redis/redis.constants.ts src/common/redis/cache-key.util.ts src/common/redis/cache-key.util.spec.ts src/modules/restaurants/restaurants.service.ts src/modules/restaurants/restaurants.service.spec.ts
npx jest --runInBand src/common/redis/cache-key.util.spec.ts src/modules/restaurants/restaurants.service.spec.ts
npm run build
```

Nếu gặp:

```text
TS5103: Invalid value for '--ignoreDeprecations'
```

đó là lỗi `backend/tsconfig.json`, không phải lỗi cache restaurant. Đổi `"ignoreDeprecations": "5.0"` hoặc xóa dòng đó.

## 7. Thứ tự ưu tiên

1. Constants
2. `hashRestaurantListQuery()`
3. Cache `findByid()`
4. Cache `findAll(query)`
5. Invalidation create/update/delete
6. Test
7. Kiểm tra Redis down

Không cache favorite. Không sang rate limiting khi restaurant chưa xóa đúng cache dish liên quan.

## 8. Tiêu chí xong

Bước 6 hoàn thành khi:

- `GET /restaurants` và `GET /restaurants/:id` có cache-aside.
- Mọi key restaurant đều có TTL.
- Query list được normalize và hash.
- Create/update/delete xóa list, detail và cache dish liên quan.
- Redis lỗi thì API vẫn trả MySQL.
- Không cache exception, favorite, admin hay owner list.
- Test, lint và build các file liên quan đều đạt.

Sau đó mới làm:

1. Test Redis down cho category, dish và restaurant.
2. Redis cloud lúc deploy.
3. Rate limit login/forgot password.
4. BullMQ hoặc Socket.IO adapter chỉ khi có nhu cầu thật.
