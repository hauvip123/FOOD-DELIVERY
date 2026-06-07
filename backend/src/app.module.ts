import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { RestaurantsModule } from './modules/restaurants/restaurants.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { DishesModule } from './modules/dishes/dishes.module';
import { CartsModule } from './modules/carts/carts.module';
import { OrdersModule } from './modules/orders/orders.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ReviewModule } from './modules/review/review.module';
import { ChatsModule } from './modules/chats/chats.module';
@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true
  }), TypeOrmModule.forRoot({
    type: 'mysql',
    host: process.env.MYSQLHOST,
    port: Number(process.env.MYSQLPORT),
    username: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    ssl: process.env.MYSQL_SSL === "true" ? { rejectUnauthorized: true } : undefined,
    autoLoadEntities: true,
    synchronize: process.env.TYPEORM_SYNC === "true",
  }), RestaurantsModule, CategoriesModule, DishesModule, CartsModule, OrdersModule, UsersModule, AuthModule, ReviewModule, ChatsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
