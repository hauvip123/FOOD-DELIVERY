# Hướng dẫn cache dish với Redis

Tài liệu này mô tả phần Redis đã có trong backend và các bước tiếp theo để cache món ăn. Đây là **Bước 5** trong `REDIS_INTEGRATION_PLAN.md`.

Chưa viết code dish cache trong tài liệu này. Làm lần lượt theo từng bước, kiểm tra xong bước trước mới sang bước sau.

## 1. Đã hoàn thành

- Redis chạy bằng Docker Compose ở thư mục gốc.
- Backend đã cài `ioredis`.
- Đã có `RedisModule` và `RedisService`.
- Đã cache `GET /categories`.
- Khi category được tạo, sửa hoặc xóa, backend đã xóa:
  - `categories:all`
  - `dishes:list:*`

## 2. Việc cần làm tiếp theo

Cache 3 API đọc của dish:

```text
GET /dishes
GET /dishes/:id
GET /dishes/restaurant/:id
```

File chính cần sửa:

```text
src/common/redis/redis.constants.ts
src/modules/dishes/dishes.service.ts
src/modules/dishes/dishes.service.spec.ts
```

Không cần sửa:

```text
src/modules/dishes/dishes.module.ts
src/modules/dishes/dishes.controller.ts
```

`RedisModule` đã được đánh dấu `@Global()` và import trong `src/app.module.ts`. `DishesService` chỉ cần inject `RedisService`.

Không cache giỏ hàng, đơn hàng, thanh toán, favorite hay API quản trị trong bước này.

## 3. Code Redis hiện có

### 3.1. `src/common/redis/redis.constants.ts`

File chứa token inject Redis client, tên cache key và TTL.

Hiện tại:

```ts
export const REDIS_CLIENT = Symbol('REDIS_CLIENT');

export const CACHE_KEYS = {
  categories: 'categories:all',
  dishLists: 'dishes:list:*',
} as const;

export const CACHE_TTL_SECONDS = {
  categories: 30 * 60,
} as const;
```

`dishLists` đã có sẵn vì `CategoriesService` cần xóa danh sách món ăn khi danh mục thay đổi. Bước dish sẽ dùng lại pattern này và bổ sung key chi tiết, key theo nhà hàng, TTL dish.

Prefix thật sự không nằm trong file này. `RedisService` tự thêm `REDIS_KEY_PREFIX` từ `.env`.

Ví dụ:

```text
categories:all
```

trở thành:

```text
hungerdash:categories:all
```

### 3.2. `src/common/redis/redis.module.ts`

File tạo Redis client dùng chung.

Việc chính:

- Đọc `REDIS_URL`.
- Tạo client `ioredis`.
- Export `RedisService`.
- Đóng kết nối khi backend dừng.

Các tùy chọn quan trọng:

| Tùy chọn | Ý nghĩa |
| --- | --- |
| `lazyConnect: true` | Chỉ kết nối khi có command đầu tiên |
| `maxRetriesPerRequest: 1` | Không giữ request API chờ Redis quá lâu |
| `retryStrategy` | Thử kết nối lại, tối đa 2 giây |

Nếu Redis lỗi, backend vẫn chạy với MySQL.

### 3.3. `src/common/redis/redis.service.ts`

Đây là lớp các service nghiệp vụ sẽ gọi.

| Hàm | Dùng khi nào |
| --- | --- |
| `get<T>(key)` | Đọc cache. Redis lỗi thì trả `null` |
| `set(key, value, ttlSeconds)` | Lưu JSON và bắt buộc có TTL |
| `delete(...keys)` | Xóa một hoặc nhiều key cụ thể |
| `deleteByPattern(pattern)` | Xóa nhiều key theo pattern bằng `SCAN` |
| `ping()` | Kiểm tra Redis có sống không. Không gọi trong mỗi request cache |

Không gọi trực tiếp `ioredis` trong `DishesService`. Chỉ dùng `RedisService`.

Ví dụ đọc:

```ts
const cached = await this.redisService.get<ResponseType>(key);
```

Ví dụ ghi:

```ts
await this.redisService.set(key, response, 300);
```

Ví dụ xóa một key:

```ts
await this.redisService.delete(`dishes:detail:${dishId}`);
```

Ví dụ xóa nhiều key danh sách:

```ts
await this.redisService.deleteByPattern('dishes:list:*');
```

### 3.4. `src/modules/categories/categories.service.ts`

Đây là mẫu cache-aside đã chạy.

Khi đọc:

1. Gọi `redisService.get('categories:all')`.
2. Nếu có dữ liệu thì trả cache.
3. Nếu không có thì đọc MySQL.
4. Ghi Redis 30 phút.
5. Trả response.

Khi ghi MySQL thành công:

```ts
await this.invalidateCategoryCache();
```

Hàm đó xóa:

```text
categories:all
dishes:list:*
```

Cache dish sẽ làm giống vậy, nhưng key phức tạp hơn vì có query, chi tiết món và món theo nhà hàng.

### 3.5. `src/modules/dishes/dishes.service.ts`

Hiện tại service này chưa dùng Redis. Các method liên quan:

| Method | Việc hiện tại |
| --- | --- |
| `getAllDishes(query)` | QueryBuilder, filter, sort, pagination, join restaurant và category |
| `getDishById(id)` | `findOneBy({ id })` |
| `getDishByRestaurantId(id)` | Kiểm tra nhà hàng tồn tại, rồi `find({ restaurantId })` |
| `createDishes()` | Kiểm tra category và restaurant, rồi `save()` |
| `updateDish()` | Tìm món cũ, `Object.assign`, rồi `save()` |
| `deleteDish()` | Tìm món, rồi `remove()` |

Query của `GET /dishes` nằm trong `src/modules/dishes/dto/find-dishes-query.dto.ts`:

- `search`
- `categoryName`
- `categoryId`
- `isAvailable`
- `sortBy`
- `sortOrder`
- `page`
- `limit`

Hai URL khác thứ tự tham số nhưng cùng giá trị phải ra cùng cache key. Hai URL khác `page`, `categoryId` hoặc `sortOrder` phải ra key khác nhau.

## 4. Quy ước key và TTL cho dish

Prefix `hungerdash:` do `RedisService` thêm. Bảng dưới chỉ phần key nghiệp vụ.

| Dữ liệu | Key | TTL |
| --- | --- | --- |
| Danh sách món theo query | `dishes:list:<query-hash>` | 5 phút |
| Tất cả danh sách món | `dishes:list:*` | dùng để xóa |
| Chi tiết món | `dishes:detail:<dishId>` | 10 phút |
| Món theo nhà hàng | `dishes:restaurant:<restaurantId>` | 5 phút |

Key đầy đủ ví dụ:

```text
hungerdash:dishes:list:8a270f4c1a3d
hungerdash:dishes:detail:12
hungerdash:dishes:restaurant:4
```

Không đưa chuỗi `search` thô vào key. Hash query đã chuẩn hóa.

Chỉ cache response thành công. Không cache `NotFoundException` hay lỗi khác.

## 5. Các bước làm

Làm theo thứ tự dưới đây.

### Bước 1: mở rộng constants

Sửa `src/common/redis/redis.constants.ts`.

Thêm helper tạo key và TTL dish. Giữ nguyên key category hiện có.

Gợi ý:

```ts
export const REDIS_CLIENT = Symbol('REDIS_CLIENT');

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

Không viết số `300` hoặc `600` rải rác trong `DishesService`.

`CategoriesService` đang dùng `CACHE_KEYS.dishLists`, nên không đổi tên field đó.

### Bước 2: tạo helper hash query

Tạo file mới:

```text
src/common/redis/cache-key.util.ts
```

Helper này dùng cho `getAllDishes(query)`. Sau này `GET /restaurants` cũng dùng được.

Nhiệm vụ:

1. Lấy các field query thật sự ảnh hưởng kết quả.
2. Áp dụng default giống `getAllDishes()`:
   - `page = 1`
   - `limit = 24`
   - `sortBy = 'createdAt'`
   - `sortOrder = 'DESC'`
3. Trim `search` và `categoryName` nếu có.
4. Đưa `sortOrder` về chữ hoa `ASC` hoặc `DESC`.
5. Bỏ field `undefined`.
6. Sắp xếp tên field theo alphabet.
7. `JSON.stringify` object đã sắp xếp.
8. Băm SHA-256.
9. Lấy 12 ký tự đầu của hash.

Gợi ý:

```ts
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
```

Hai query sau phải ra cùng hash:

```text
/dishes?page=1&limit=24
/dishes?limit=24&page=1
```

Hai query sau phải ra hash khác nhau:

```text
/dishes?page=1&limit=24
/dishes?page=2&limit=24
/dishes?page=1&limit=24&categoryId=1
/dishes?page=1&limit=24&sortOrder=ASC
```

Viết unit test nhỏ cho helper này trước khi gắn vào service.

### Bước 3: inject Redis vào DishesService

Trong `src/modules/dishes/dishes.service.ts`:

```ts
import { RedisService } from 'src/common/redis/redis.service';
import {
  CACHE_KEYS,
  CACHE_TTL_SECONDS,
} from 'src/common/redis/redis.constants';
import { hashDishListQuery } from 'src/common/redis/cache-key.util';
```

Thêm vào constructor:

```ts
constructor(
  @InjectRepository(Dish) private readonly dishRepository: Repository<Dish>,
  @InjectRepository(Categories)
  private readonly categoriesRepository: Repository<Categories>,
  @InjectRepository(Restaurant)
  private readonly restaurantRepository: Repository<Restaurant>,
  private readonly redisService: RedisService,
) {}
```

Không sửa `dishes.module.ts`.

### Bước 4: cache `getDishById()` trước

Đây là API đơn giản nhất. Làm trước để kiểm tra Redis trong dish module.

Luồng:

1. Tạo key `CACHE_KEYS.dishDetail(id)`.
2. Đọc Redis.
3. Nếu có cache thì trả cache.
4. Nếu không có thì `findOneBy({ id })`.
5. Nếu không tìm thấy món, vẫn `throw new NotFoundException`. Không cache lỗi này.
6. Tạo response thành công.
7. Lưu Redis với TTL `CACHE_TTL_SECONDS.dishDetail`.
8. Trả response.

Khung code:

```ts
async getDishById(id: number) {
  const cacheKey = CACHE_KEYS.dishDetail(id);
  const cached = await this.redisService.get<{
    statusCode: number;
    message: string;
    data: Dish;
  }>(cacheKey);

  if (cached) {
    return cached;
  }

  const dish = await this.dishRepository.findOneBy({ id });
  if (!dish) {
    throw new NotFoundException('Dish not found');
  }

  const response = {
    statusCode: 200,
    message: 'Get dish successfully',
    data: dish,
  };

  await this.redisService.set(
    cacheKey,
    response,
    CACHE_TTL_SECONDS.dishDetail,
  );

  return response;
}
```

Kiểm tra:

```bash
curl http://localhost:3000/dishes/1
docker compose exec redis redis-cli --scan --pattern 'hungerdash:dishes:detail:*'
docker compose exec redis redis-cli TTL hungerdash:dishes:detail:1
```

TTL phải lớn hơn `0` và không lớn hơn `600`.

### Bước 5: cache `getDishByRestaurantId()`

Luồng giống bước 4, key là:

```ts
CACHE_KEYS.dishesByRestaurant(id)
```

TTL:

```ts
CACHE_TTL_SECONDS.dishesByRestaurant
```

Vẫn gọi `findRestaurantById(id)` trước. Nếu nhà hàng không tồn tại thì ném `NotFoundException`, không cache.

Nếu nhà hàng tồn tại nhưng chưa có món, vẫn cache mảng rỗng. Lần đọc sau không cần hỏi MySQL cho đến khi TTL hết hoặc cache bị xóa.

Kiểm tra:

```bash
curl http://localhost:3000/dishes/restaurant/1
docker compose exec redis redis-cli --scan --pattern 'hungerdash:dishes:restaurant:*'
```

### Bước 6: cache `getAllDishes(query)`

Đây là phần phức tạp nhất.

Luồng:

1. Hash query bằng `hashDishListQuery(query)`.
2. Tạo key `CACHE_KEYS.dishList(queryHash)`.
3. Đọc Redis.
4. Nếu có cache thì trả luôn, không chạy QueryBuilder.
5. Nếu không có cache thì giữ nguyên logic query hiện tại.
6. Cache toàn bộ response, gồm `data` và `meta`.
7. TTL `CACHE_TTL_SECONDS.dishList`.

Không đổi điều kiện filter, join, sort, `skip` hay `take`. Chỉ bọc cache-aside bên ngoài.

Kiểm tra 4 URL trong kế hoạch tạo ra 4 key khác nhau, trừ hai URL cùng giá trị nhưng khác thứ tự tham số.

### Bước 7: viết hàm xóa cache dish

Thêm hàm private trong `DishesService`:

```ts
private async invalidateDishCache(options: {
  dishId?: number;
  restaurantIds?: number[];
}) {
  const keys = [
    options.dishId ? CACHE_KEYS.dishDetail(options.dishId) : undefined,
    ...(options.restaurantIds ?? []).map((restaurantId) =>
      CACHE_KEYS.dishesByRestaurant(restaurantId),
    ),
  ].filter((key): key is string => Boolean(key));

  await Promise.all([
    this.redisService.deleteByPattern(CACHE_KEYS.dishLists),
    keys.length > 0 ? this.redisService.delete(...keys) : Promise.resolve(),
  ]);
}
```

Luôn xóa `dishes:list:*` vì không biết query nào đang bị ảnh hưởng.

Chỉ xóa cache sau khi MySQL `save()` hoặc `remove()` thành công.

### Bước 8: invalidation khi tạo món

Trong `createDishes()`, sau `save()`:

```ts
await this.invalidateDishCache({
  restaurantIds: [savedDish.restaurantId],
});
```

Xóa:

```text
dishes:list:*
dishes:restaurant:<restaurantId>
```

Chưa cần xóa `dishes:detail:<id>` vì món mới chưa từng được cache theo id.

### Bước 9: invalidation khi cập nhật món

Trong `updateDish()`, giữ `restaurantId` cũ trước `Object.assign`:

```ts
const previousRestaurantId = dish.restaurantId;

if (updateDish.categoryId) {
  await this.findCategoryById(updateDish.categoryId);
}

if (updateDish.restaurantId) {
  await this.findRestaurantById(updateDish.restaurantId);
}

Object.assign(dish, updateDish);
const updatedDish = await this.dishRepository.save(dish);

const restaurantIds = [previousRestaurantId];
if (updatedDish.restaurantId !== previousRestaurantId) {
  restaurantIds.push(updatedDish.restaurantId);
}

await this.invalidateDishCache({
  dishId: updatedDish.id,
  restaurantIds,
});
```

Nếu món được chuyển từ nhà hàng 4 sang nhà hàng 9, phải xóa cả hai:

```text
dishes:list:*
dishes:detail:<dishId>
dishes:restaurant:4
dishes:restaurant:9
```

Nếu không giữ `previousRestaurantId`, trang nhà hàng cũ vẫn hiện món đã chuyển đi.

Nếu `categoryId` đổi, vẫn xóa `dishes:list:*`. Các query lọc theo category sẽ được tạo lại từ MySQL.

### Bước 10: invalidation khi xóa món

Trong `deleteDish()`, lấy `id` và `restaurantId` trước `remove()`:

```ts
const dish = await this.dishRepository.findOneBy({ id });
if (!dish) {
  throw new NotFoundException('Dish not found');
}

await this.dishRepository.remove(dish);

await this.invalidateDishCache({
  dishId: id,
  restaurantIds: [dish.restaurantId],
});
```

Xóa:

```text
dishes:list:*
dishes:detail:<dishId>
dishes:restaurant:<restaurantId>
```

### Bước 11: viết test

Cập nhật `src/modules/dishes/dishes.service.spec.ts`.

Mock:

- `Dish` repository
- `Categories` repository
- `Restaurant` repository
- `RedisService`

Các case cần có:

1. `getDishById()` cache hit: không gọi `findOneBy`.
2. `getDishById()` cache miss: gọi MySQL rồi `set`.
3. `getDishById()` không tìm thấy: ném `NotFoundException`, không `set`.
4. `getAllDishes()` cache hit: không gọi QueryBuilder.
5. `getAllDishes()` cache miss: gọi MySQL rồi `set` đúng key hash.
6. `createDishes()` xóa `dishes:list:*` và `dishes:restaurant:<id>`.
7. `updateDish()` đổi `restaurantId`: xóa cache nhà hàng cũ và mới.
8. `deleteDish()` xóa detail, list và restaurant.

Thêm test cho `hashDishListQuery()`:

- Cùng giá trị, khác thứ tự field, cùng hash.
- Khác `page`, `categoryId` hoặc `sortOrder`, khác hash.
- `search` có khoảng trắng đầu/cuối vẫn cùng hash sau khi trim.

### Bước 12: kiểm tra thủ công

Khởi động Redis và backend:

```bash
docker compose up -d redis
cd backend
npm run start:dev
```

Cache miss rồi cache hit:

```bash
curl http://localhost:3000/dishes/1
curl http://localhost:3000/dishes/1
docker compose exec redis redis-cli --scan --pattern 'hungerdash:dishes:*'
```

TTL:

```bash
docker compose exec redis redis-cli TTL hungerdash:dishes:detail:1
```

Query key:

```bash
curl 'http://localhost:3000/dishes?page=1&limit=24'
curl 'http://localhost:3000/dishes?limit=24&page=1'
curl 'http://localhost:3000/dishes?page=2&limit=24'
curl 'http://localhost:3000/dishes?page=1&limit=24&categoryId=1'
```

Hai request đầu phải dùng chung một key list. Các request sau phải tạo key khác.

Invalidation:

1. Gọi `GET /dishes` và `GET /dishes/1` để tạo cache.
2. Cập nhật món.
3. Key detail, list và restaurant liên quan phải bị xóa.
4. Gọi lại API đọc phải ra dữ liệu mới.

Redis down:

```bash
docker compose stop redis
curl http://localhost:3000/dishes
curl http://localhost:3000/dishes/1
```

API vẫn trả dữ liệu MySQL. Backend chỉ warning, không crash.

Bật Redis lại:

```bash
docker compose start redis
```

### Bước 13: lệnh verify

Trong `backend`:

```bash
npx eslint src/common/redis/redis.constants.ts src/common/redis/cache-key.util.ts src/modules/dishes/dishes.service.ts src/modules/dishes/dishes.service.spec.ts
npm test -- --runInBand src/common/redis/cache-key.util.spec.ts src/modules/dishes/dishes.service.spec.ts
npm run build
```

Nếu `npm run build` hoặc Jest bị lỗi:

```text
TS5103: Invalid value for '--ignoreDeprecations'
```

đó là lỗi `backend/tsconfig.json`, không phải lỗi cache dish. Sửa `"ignoreDeprecations": "5.0"` hoặc xóa dòng đó rồi chạy lại.

## 6. Thứ tự ưu tiên trong bước dish

1. Constants
2. Helper hash query
3. Cache `getDishById()`
4. Cache `getDishByRestaurantId()`
5. Cache `getAllDishes()`
6. Invalidation create/update/delete
7. Test
8. Kiểm tra Redis down

Không sang cache restaurant khi dish chưa xóa đúng cache lúc đổi `restaurantId`.

## 7. Tiêu chí xong bước dish

Bước 5 hoàn thành khi:

- Ba API đọc dish đều có cache-aside.
- Mọi key dish đều có TTL.
- Query list được normalize và hash.
- Create/update/delete xóa đúng cache liên quan.
- Đổi `restaurantId` xóa cache nhà hàng cũ và mới.
- Redis lỗi thì API vẫn trả dữ liệu MySQL.
- Không cache exception.
- Test, lint và build của các file liên quan đều đạt.

Sau đó mới làm Bước 6: cache restaurant trong `src/modules/restaurants/restaurants.service.ts`.
