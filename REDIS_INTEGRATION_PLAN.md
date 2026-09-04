# Kế hoạch tích hợp Redis cho HungerDash

## 1. Mục tiêu

Redis được tích hợp vào backend NestJS để:

- Cache dữ liệu public được đọc thường xuyên: danh mục, món ăn và nhà hàng.
- Giảm số lần truy vấn MySQL.
- Tăng tốc độ phản hồi của các API trang chủ và trang nhà hàng.
- Làm nền tảng cho rate limiting, queue gửi email và Socket.IO scaling trong tương lai.

Redis không thay thế MySQL. MySQL vẫn là nguồn dữ liệu chính cho người dùng, giỏ hàng, đơn hàng, thanh toán, tin nhắn và các dữ liệu nghiệp vụ.

## 2. Phạm vi triển khai

### Giai đoạn 1: nền tảng Redis và cache dữ liệu public

Triển khai ngay:

- Kết nối Redis trong backend.
- Tạo `RedisModule` và `RedisService` dùng chung.
- Cache `GET /categories`.
- Cache danh sách, chi tiết và món ăn theo nhà hàng.
- Cache danh sách và chi tiết nhà hàng.
- Xóa cache khi dữ liệu liên quan được tạo, cập nhật hoặc xóa.
- Thêm health check Redis cơ bản và logging khi Redis lỗi.

### Giai đoạn 2: bảo vệ API xác thực

Triển khai sau khi cache hoạt động ổn định:

- Rate limit đăng nhập theo IP.
- Rate limit quên mật khẩu theo IP và email.
- Không thay đổi nơi lưu refresh token trong giai đoạn này.

### Giai đoạn 3: mở rộng khi có nhu cầu

Chỉ triển khai khi hệ thống cần:

- BullMQ cho queue gửi email và notification.
- Redis Adapter cho Socket.IO khi backend chạy nhiều instance.
- Lưu session/refresh token trong Redis khi cần quản lý nhiều thiết bị.

## 3. Công nghệ và package cần cài

Backend hiện tại dùng NestJS 11. Cách đơn giản, rõ ràng và ít phụ thuộc nhất là dùng trực tiếp `ioredis` thay vì thêm một wrapper NestJS khác.

Tại thư mục `backend`, chạy:

```bash
npm install ioredis
```

`ioredis` đã có TypeScript types, không cần cài thêm `@types/ioredis`.

Không cần cài Redis package ở frontend.

### Package tùy chọn cho các giai đoạn sau

Rate limiting:

```bash
npm install @nestjs/throttler
```

Queue xử lý nền:

```bash
npm install @nestjs/bullmq bullmq
```

Socket.IO chạy nhiều backend instance:

```bash
npm install @socket.io/redis-adapter redis
```

Không cài các package tùy chọn cho đến khi bắt đầu giai đoạn tương ứng.

## 4. Cài Redis

Chỉ cần chọn một trong các cách sau.

### Cách A: Docker cho môi trường local

Khởi động Redis:

```bash
docker run --name hungerdash-redis -p 6379:6379 -d redis:7-alpine
```

Kiểm tra container:

```bash
docker ps
```

Kiểm tra Redis:

```bash
docker exec -it hungerdash-redis redis-cli ping
```

Kết quả mong đợi:

```text
PONG
```

Dừng Redis:

```bash
docker stop hungerdash-redis
```

Khởi động lại:

```bash
docker start hungerdash-redis
```

### Cách B: cài Redis trực tiếp trên Ubuntu

```bash
sudo apt update
sudo apt install redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
redis-cli ping
```

### Cách C: Redis cloud cho production

Có thể dùng Upstash, Redis Cloud hoặc Redis của nhà cung cấp hosting. Sau khi tạo database, lấy connection URL có dạng:

```text
rediss://default:<password>@<host>:<port>
```

Ưu tiên URL bắt đầu bằng `rediss://` trong production để kết nối qua TLS.

Nếu backend deploy trên Render và Redis ở một dịch vụ khác, cần bảo đảm Redis cho phép kết nối từ Render.

## 5. Biến môi trường

Thêm vào `backend/.env` ở local:

```env
REDIS_URL=redis://localhost:6379
REDIS_KEY_PREFIX=hungerdash
REDIS_CACHE_ENABLED=true
```

Thêm các biến tương tự vào Environment Variables của hosting backend.

Không commit `backend/.env`.

Cập nhật phần cấu hình mẫu trong `README.md` sau khi triển khai:

```env
REDIS_URL=redis://localhost:6379
REDIS_KEY_PREFIX=hungerdash
REDIS_CACHE_ENABLED=true
```

Ý nghĩa:

| Biến | Bắt buộc | Mô tả |
| --- | --- | --- |
| `REDIS_URL` | Có | URL kết nối Redis. Production nên dùng `rediss://`. |
| `REDIS_KEY_PREFIX` | Không | Prefix ngăn xung đột key khi dùng chung Redis. Mặc định `hungerdash`. |
| `REDIS_CACHE_ENABLED` | Không | Cho phép tắt cache tạm thời mà không gỡ code. Mặc định `true`. |

## 6. Cấu trúc file sẽ tạo

```text
backend/src/common/redis/
|-- redis.constants.ts
|-- redis.module.ts
`-- redis.service.ts
```

Vai trò từng file:

- `redis.constants.ts`: token dùng để inject Redis client.
- `redis.module.ts`: tạo kết nối, export client và service, đóng kết nối khi ứng dụng tắt.
- `redis.service.ts`: cung cấp các hàm cache như `get`, `set`, `delete` và `deleteByPattern`.

Import `RedisModule` một lần trong:

```text
backend/src/app.module.ts
```

Nên khai báo module là global để các service khác inject `RedisService` mà không phải import lặp lại.

## 7. Thiết kế RedisService

Service cần cung cấp tối thiểu các hàm:

```ts
get<T>(key: string): Promise<T | null>
set(key: string, value: unknown, ttlSeconds: number): Promise<void>
delete(...keys: string[]): Promise<void>
deleteByPattern(pattern: string): Promise<void>
ping(): Promise<boolean>
```

Nguyên tắc:

- `get` parse JSON và trả về `null` khi key không tồn tại.
- `set` serialize dữ liệu bằng JSON và luôn có TTL.
- Không tạo cache không có thời gian hết hạn.
- `deleteByPattern` dùng `SCAN`, không dùng `KEYS`, để tránh block Redis khi có nhiều key.
- Prefix key được cấu hình tập trung, không lặp lại thủ công trong mỗi service.
- Lỗi Redis phải được log nhưng API vẫn truy vấn MySQL bình thường.

### Cách xử lý khi Redis không hoạt động

Redis chỉ là tầng cache. Nếu Redis mất kết nối:

1. API bỏ qua cache.
2. API đọc dữ liệu từ MySQL.
3. API vẫn trả kết quả cho client.
4. Backend log cảnh báo để theo dõi.

Không được để lỗi Redis làm các API public trả về HTTP 500 nếu MySQL vẫn hoạt động.

## 8. Chiến lược cache

Sử dụng mô hình cache-aside:

1. Tạo cache key từ tham số request.
2. Đọc dữ liệu từ Redis.
3. Nếu cache hit, trả dữ liệu Redis.
4. Nếu cache miss, truy vấn MySQL.
5. Lưu kết quả vào Redis với TTL.
6. Trả kết quả cho client.

Pseudo-code:

```ts
const cached = await redisService.get<ResponseType>(key);

if (cached) {
  return cached;
}

const result = await repository.find();
await redisService.set(key, result, 300);

return result;
```

Chỉ cache kết quả thành công. Không cache exception hoặc response lỗi.

## 9. Quy ước cache key và TTL

Prefix thật sự được thêm từ `REDIS_KEY_PREFIX`. Bảng dưới chỉ mô tả phần key nghiệp vụ.

| Dữ liệu | Key | TTL đề xuất |
| --- | --- | --- |
| Tất cả category | `categories:all` | 30 phút |
| Danh sách dish | `dishes:list:<query-hash>` | 5 phút |
| Chi tiết dish | `dishes:detail:<dishId>` | 10 phút |
| Dish theo restaurant | `dishes:restaurant:<restaurantId>` | 5 phút |
| Danh sách restaurant | `restaurants:list:<query-hash>` | 5 phút |
| Chi tiết restaurant | `restaurants:detail:<restaurantId>` | 10 phút |

Key đầy đủ ví dụ:

```text
hungerdash:categories:all
hungerdash:dishes:detail:12
hungerdash:dishes:restaurant:4
hungerdash:restaurants:detail:4
```

TTL phải được định nghĩa thành constants, không viết các con số rải rác trong service.

## 10. Tạo key cho API có query

Hai API sau có filter, sort và pagination:

```text
GET /dishes
GET /restaurants
```

Cache key phải phân biệt đầy đủ các query:

- `page`
- `limit`
- `search`
- filter
- `sortBy`
- `sortOrder`

Cần chuẩn hóa object query trước khi tạo key:

1. Loại bỏ các giá trị `undefined`.
2. Trim chuỗi giống như logic truy vấn database.
3. Sắp xếp tên thuộc tính theo alphabet.
4. Serialize object đã sắp xếp.
5. Băm SHA-256 và dùng một phần hash làm cache key.

Ví dụ:

```text
dishes:list:8a270f4c1a3d
restaurants:list:c84f9127b341
```

Không nên đưa trực tiếp chuỗi search của người dùng vào key vì key có thể dài hoặc chứa ký tự không mong muốn.

## 11. Cache category

File cần sửa:

```text
backend/src/modules/categories/categories.service.ts
```

### Khi đọc

`getAllCategories()`:

1. Đọc `categories:all`.
2. Nếu có cache thì trả cache.
3. Nếu không có thì truy vấn repository.
4. Lưu kết quả 30 phút.

### Khi ghi

Sau khi database thao tác thành công trong:

- `createCategories()`
- `updateCategories()`
- `deleteCategories()`

Xóa:

```text
categories:all
dishes:list:*
```

Cần xóa danh sách dish vì API dish join category và có thể lọc theo category.

## 12. Cache dish

File cần sửa:

```text
backend/src/modules/dishes/dishes.service.ts
```

### Khi đọc

| Method | Key |
| --- | --- |
| `getAllDishes(query)` | `dishes:list:<query-hash>` |
| `getDishById(id)` | `dishes:detail:<id>` |
| `getDishByRestaurantId(id)` | `dishes:restaurant:<id>` |

### Khi ghi

Sau `createDishes()` thành công, xóa:

```text
dishes:list:*
dishes:restaurant:<restaurantId>
```

Sau `updateDish()` thành công, xóa:

```text
dishes:list:*
dishes:detail:<dishId>
dishes:restaurant:<restaurantIdCu>
dishes:restaurant:<restaurantIdMoi>
```

Cần giữ lại `restaurantId` cũ trước khi `Object.assign` để xóa đúng cache nếu món ăn được chuyển sang nhà hàng khác.

Sau `deleteDish()` thành công, xóa:

```text
dishes:list:*
dishes:detail:<dishId>
dishes:restaurant:<restaurantId>
```

Chỉ xóa cache sau khi database ghi thành công. Không xóa trước khi thao tác MySQL hoàn tất.

## 13. Cache restaurant

File cần sửa:

```text
backend/src/modules/restaurants/restaurants.service.ts
```

### Khi đọc

| Method | Key |
| --- | --- |
| `findAll(query)` | `restaurants:list:<query-hash>` |
| `findByid(id)` | `restaurants:detail:<id>` |

Không cache trong giai đoạn đầu:

- `findAllAdmin()` vì đây là dữ liệu quản trị và cần mới.
- `findByOwner()` vì đây là dữ liệu quản lý.
- Danh sách favorite vì phụ thuộc từng user và thay đổi thường xuyên.

### Khi ghi

Sau `createRestaurant()` thành công, xóa:

```text
restaurants:list:*
```

Sau `updateRestaurant()` thành công, xóa:

```text
restaurants:list:*
restaurants:detail:<restaurantId>
dishes:list:*
dishes:restaurant:<restaurantId>
```

Cần xóa cache dish vì response dish có join thông tin restaurant.

Sau `deleteRestaurant()` thành công, xóa các key tương tự `updateRestaurant()`.

## 14. Dữ liệu không cache trong giai đoạn 1

Không cache các API sau trong giai đoạn đầu:

- Giỏ hàng.
- Tạo và cập nhật đơn hàng.
- Trạng thái thanh toán.
- Lịch sử đơn hàng.
- Tin nhắn và hội thoại.
- Thông tin profile người dùng.
- Favorite restaurant.
- Dashboard admin và restaurant owner.

Lý do:

- Dữ liệu thay đổi thường xuyên.
- Có tính cá nhân hoặc nhạy cảm.
- Dễ xảy ra stale data.
- Lợi ích cache chưa rõ ràng khi lưu lượng dự án còn nhỏ.

Nếu sau này cache dashboard, TTL nên ngắn, khoảng 15-60 giây, và phải xóa cache khi đơn hàng thay đổi trạng thái.

## 15. Health check và logging

Có hai lựa chọn:

### Lựa chọn tối thiểu

Khi backend khởi động:

- Gọi `PING` để xác nhận kết nối.
- Log `Redis connected` khi thành công.
- Log warning khi thất bại.
- Không log `REDIS_URL` vì URL có thể chứa password.

Có thể bổ sung endpoint:

```text
GET /health
```

Response ví dụ:

```json
{
  "status": "ok",
  "mysql": "up",
  "redis": "up"
}
```

Redis down không nhất thiết làm status toàn bộ hệ thống thành down vì cache không phải dependency bắt buộc cho API.

### Bảo mật log

Không log:

- Redis password.
- Toàn bộ connection URL.
- Refresh token.
- Reset password token.
- Nội dung cache có thông tin người dùng.

## 16. Rate limiting giai đoạn 2

Sau khi cache hoạt động ổn định, cài:

```bash
npm install @nestjs/throttler
```

Quy tắc đề xuất:

| API | Giới hạn |
| --- | --- |
| Login | 10 request trong 5 phút theo IP |
| Forgot password | 3 request trong 15 phút theo IP |
| Forgot password | 3 request trong 15 phút theo email đã normalize |
| Reset password | 5 request trong 15 phút theo IP |

Key ví dụ:

```text
rate-limit:login:ip:<ip-hash>
rate-limit:forgot:ip:<ip-hash>
rate-limit:forgot:email:<email-hash>
```

Email và IP nên được hash nếu muốn hạn chế lưu dữ liệu nhận dạng trực tiếp trong Redis.

Nếu dùng `@nestjs/throttler`, cần chọn Redis storage tương thích với phiên bản package tại thời điểm triển khai. Không nên tự động chọn package storage chưa được bảo trì.

## 17. Queue email giai đoạn 3

Khi cần retry email quên mật khẩu hoặc gửi notification, cài:

```bash
npm install @nestjs/bullmq bullmq
```

Luồng xử lý:

1. API tạo reset token như hiện tại.
2. API thêm job gửi email vào BullMQ.
3. Worker đọc job và gửi email.
4. Worker retry nếu nhà cung cấp email lỗi.
5. Job thành công hoặc thất bại được ghi log.

MySQL hoặc Redis vẫn phải lưu token trước khi đưa job vào queue. Không đưa raw reset token vào log.

## 18. Socket.IO scaling giai đoạn 3

Gateway hiện tại nằm tại:

```text
backend/src/modules/chats/chats.gateway.ts
```

Nếu backend chỉ chạy một instance, không cần Redis Adapter.

Nếu chạy từ hai instance trở lên, cài:

```bash
npm install @socket.io/redis-adapter redis
```

Redis Pub/Sub chỉ đồng bộ event Socket.IO giữa các instance. Tin nhắn vẫn phải được lưu trong MySQL bởi `ChatsService`.

Nếu dùng load balancer, vẫn cần cấu hình sticky session nếu transport cho phép HTTP long-polling. Một cách khác là ép client dùng WebSocket transport nếu kiến trúc hệ thống phù hợp.

## 19. Kế hoạch triển khai chi tiết

### Bước 1: chuẩn bị Redis local

- Khởi động Redis bằng Docker hoặc cài trực tiếp.
- Chạy `redis-cli ping` và xác nhận `PONG`.
- Thêm `REDIS_URL`, `REDIS_KEY_PREFIX` và `REDIS_CACHE_ENABLED` vào `backend/.env`.

### Bước 2: cài dependency

- Chạy `npm install ioredis` trong `backend`.
- Xác nhận `package.json` và `package-lock.json` được cập nhật.
- Chạy `npm run build` để chắc chắn dependency không gây lỗi.

### Bước 3: tạo Redis module

- Tạo `redis.constants.ts`.
- Tạo `redis.service.ts`.
- Tạo `redis.module.ts`.
- Import module trong `app.module.ts`.
- Kết nối bằng `ConfigService`, không đọc `process.env` rải rác trong service.
- Thêm shutdown hook để đóng connection sạch sẽ.

### Bước 4: cache category

- Inject `RedisService` vào `CategoriesService`.
- Thêm cache-aside cho `getAllCategories()`.
- Xóa cache sau create/update/delete.
- Đây là bước thử nghiệm nhỏ nhất trước khi cache các query phức tạp.

### Bước 5: cache dish

- Tạo helper tạo hash từ query đã normalize.
- Cache ba method đọc.
- Thêm invalidation cho create/update/delete.
- Kiểm tra trường hợp đổi `restaurantId` và `categoryId`.

### Bước 6: cache restaurant

- Cache `findAll()` và `findByid()`.
- Invalidate danh sách, chi tiết và cache dish liên quan khi restaurant thay đổi.
- Không cache favorite và API quản trị.

### Bước 7: thêm test

- Unit test cache hit: không gọi repository.
- Unit test cache miss: gọi repository và set cache.
- Unit test Redis lỗi: vẫn trả dữ liệu MySQL.
- Unit test create/update/delete: xóa đúng key.
- Unit test thay đổi restaurant của dish: xóa cache restaurant cũ và mới.

### Bước 8: kiểm tra tổng thể

- Chạy lint.
- Chạy unit test.
- Chạy build.
- Test thủ công bằng API.
- Theo dõi key và TTL bằng `redis-cli`.
- Test backend khi Redis bị stop.

### Bước 9: deploy production

- Tạo Redis cloud cùng region gần backend nhất.
- Thêm `REDIS_URL` vào environment của backend.
- Dùng `rediss://` nếu nhà cung cấp hỗ trợ TLS.
- Deploy backend.
- Kiểm tra log kết nối và endpoint health.
- Kiểm tra không có secret nào bị log.

## 20. Checklist kiểm thử thủ công

### Cache miss và cache hit

1. Xóa key test trong Redis.
2. Gọi `GET /categories` lần đầu.
3. Xác nhận key `categories:all` được tạo.
4. Gọi lại API.
5. Xác nhận response giống nhau và request thứ hai dùng cache.

### TTL

Kiểm tra TTL:

```bash
redis-cli TTL hungerdash:categories:all
```

Giá trị phải lớn hơn `0`.

### Invalidation

1. Gọi API danh sách món ăn để tạo cache.
2. Cập nhật một món ăn.
3. Xác nhận key chi tiết, danh sách và món theo nhà hàng đã bị xóa.
4. Gọi lại API đọc và xác nhận dữ liệu mới.

### Redis down

1. Dừng Redis.
2. Gọi `GET /categories`, `GET /dishes` và `GET /restaurants`.
3. API vẫn phải trả dữ liệu từ MySQL.
4. Backend chỉ ghi warning, không crash.
5. Khởi động Redis lại và xác nhận cache tiếp tục hoạt động.

### Query key

Kiểm tra các URL sau tạo key khác nhau:

```text
/dishes?page=1&limit=24
/dishes?page=2&limit=24
/dishes?page=1&limit=24&categoryId=1
/dishes?page=1&limit=24&sortOrder=ASC
```

Đồng thời, hai query có cùng giá trị nhưng khác thứ tự tham số phải tạo cùng một key.

## 21. Lệnh verify trước khi hoàn thành

Chạy trong `backend`:

```bash
npm run lint
npm test -- --runInBand
npm run build
```

Kiểm tra Redis:

```bash
redis-cli ping
redis-cli --scan --pattern 'hungerdash:*'
```

Không dùng `FLUSHALL` trên Redis production. Nếu cần xóa cache của ứng dụng, chỉ xóa key có prefix `hungerdash:*` bằng quy trình an toàn dựa trên `SCAN`.

## 22. Tiêu chí hoàn thành giai đoạn 1

Giai đoạn 1 được xem là hoàn thành khi:

- Backend kết nối được Redis local và production.
- Category, dish và restaurant có cache-aside.
- Mỗi key cache đều có TTL.
- Query cache key được normalize và hash.
- Create/update/delete xóa đúng cache liên quan.
- API vẫn hoạt động khi Redis bị mất kết nối.
- Không cache dữ liệu cá nhân, giỏ hàng, đơn hàng hay thanh toán.
- Không có Redis password hoặc URL bị commit/log.
- Unit test, lint và build đều đạt.

## 23. Thứ tự ưu tiên tóm tắt

1. Cài Redis local và `ioredis`.
2. Tạo `RedisModule` và `RedisService`.
3. Cache category.
4. Cache dish.
5. Cache restaurant.
6. Hoàn thiện invalidation và test Redis down.
7. Deploy Redis cloud.
8. Thêm rate limiting.
9. Thêm BullMQ hoặc Socket.IO Redis Adapter chỉ khi có nhu cầu thực tế.
