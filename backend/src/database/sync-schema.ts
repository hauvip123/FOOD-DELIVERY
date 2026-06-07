import "reflect-metadata";
import "dotenv/config";
import { DataSource } from "typeorm";
import { Categories } from "src/entity/categories.entity";
import { Dish } from "src/entity/dish.entiry";
import { Restaurant } from "src/entity/restaurant.entity";
import { User } from "src/entity/user.entity";
import { Carts } from "src/entity/carts.entity";
import { CartItems } from "src/entity/cart-items.entity";
import { DeliveryAddress } from "src/entity/delivery-address.entity";
import { Order } from "src/entity/order.entity";
import { OrderItem } from "src/entity/order-item.entiry";
import { Review } from "src/entity/review.entiry";
import { FavoriteRestaurant } from "src/entity/favorite-restaurant.entity";
import { ChatConversation } from "src/entity/chat-conversation.entity";
import { ChatMessage } from "src/entity/chat-message.entity";

const dataSource = new DataSource({
  type: "mysql",
  host: process.env.MYSQLHOST,
  port: Number(process.env.MYSQLPORT),
  username: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  entities: [
    Restaurant,
    Categories,
    Dish,
    User,
    Carts,
    CartItems,
    DeliveryAddress,
    Order,
    OrderItem,
    Review,
    FavoriteRestaurant,
    ChatConversation,
    ChatMessage,
  ],
  ssl: process.env.MYSQL_SSL === "true" ? { rejectUnauthorized: true } : undefined,
  synchronize: false,
});

async function syncSchema() {
  await dataSource.initialize();
  await dataSource.synchronize(false);
  console.log("Schema synchronized for database: " + process.env.MYSQLDATABASE);
  await dataSource.destroy();
}

syncSchema().catch(async (error) => {
  console.error("Schema sync failed:", error);
  if (dataSource.isInitialized) {
    await dataSource.destroy();
  }
  process.exit(1);
});
