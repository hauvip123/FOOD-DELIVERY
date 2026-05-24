import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { RestaurantsModule } from './modules/restaurants/restaurants.module';
import { CategoriesModule } from './modules/categories/categories.module';
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
    autoLoadEntities: true,
    synchronize: true,
  }), RestaurantsModule, CategoriesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
