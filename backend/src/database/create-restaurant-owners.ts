import "reflect-metadata";
import "dotenv/config";
import { DataSource, Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { Restaurant } from "src/entity/restaurant.entity";
import { User } from "src/entity/user.entity";

const DEFAULT_RESTAURANT_OWNER_PASSWORD = process.env.RESTAURANT_OWNER_DEFAULT_PASSWORD || "Restaurant@123";

const dataSource = new DataSource({
  type: "mysql",
  host: process.env.MYSQLHOST,
  port: Number(process.env.MYSQLPORT),
  username: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  entities: [Restaurant, User],
  ssl: process.env.MYSQL_SSL === "true" ? { rejectUnauthorized: true } : undefined,
  synchronize: false,
});

function buildSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "") || "restaurant";
}

function buildOwnerEmail(restaurant: Restaurant) {
  return buildSlug(restaurant.name) + "." + restaurant.id + "@restaurant.hungerdash.local";
}

async function findExistingOwner(userRepository: Repository<User>, restaurant: Restaurant) {
  if (restaurant.ownerId) {
    const owner = await userRepository.findOne({ where: { id: restaurant.ownerId } });
    if (owner) return owner;
  }

  return userRepository.findOne({ where: { email: buildOwnerEmail(restaurant) } });
}

async function createOrUpdateOwner(userRepository: Repository<User>, restaurant: Restaurant, hashedPassword: string) {
  const email = buildOwnerEmail(restaurant);
  const existingOwner = await findExistingOwner(userRepository, restaurant);

  if (existingOwner) {
    existingOwner.username = restaurant.name;
    existingOwner.email = existingOwner.email || email;
    existingOwner.phoneNumber = restaurant.phoneNumber || existingOwner.phoneNumber;
    existingOwner.role = "restaurant";
    existingOwner.status = "active";
    return userRepository.save(existingOwner);
  }

  const owner = userRepository.create({
    username: restaurant.name,
    email,
    password: hashedPassword,
    phoneNumber: restaurant.phoneNumber || null,
    role: "restaurant",
    status: "active",
  });

  return userRepository.save(owner);
}

async function ensureRequiredTables() {
  const tables = await dataSource.query("SHOW TABLES");
  const tableNames = tables.map((row: Record<string, string>) => Object.values(row)[0]);
  const missingTables = ["restaurant", "users"].filter((tableName) => !tableNames.includes(tableName));

  if (missingTables.length > 0) {
    throw new Error(
      "Missing table(s): " + missingTables.join(", ")
      + ". Current database is MYSQLDATABASE=" + process.env.MYSQLDATABASE
      + ". Use the app database that already has these tables, or create the schema before running seed:owners. Do not use the TiDB system database sys."
    );
  }
}

async function createRestaurantOwners() {
  await dataSource.initialize();
  await ensureRequiredTables();

  const restaurantRepository = dataSource.getRepository(Restaurant);
  const userRepository = dataSource.getRepository(User);
  const restaurants = await restaurantRepository.find({ order: { id: "ASC" } });
  const hashedPassword = await bcrypt.hash(DEFAULT_RESTAURANT_OWNER_PASSWORD, 10);

  let createdOrUpdated = 0;

  for (const restaurant of restaurants) {
    const owner = await createOrUpdateOwner(userRepository, restaurant, hashedPassword);
    if (restaurant.ownerId !== owner.id) {
      restaurant.ownerId = owner.id;
      await restaurantRepository.save(restaurant);
    }
    createdOrUpdated += 1;
    console.log(restaurant.name + " -> " + owner.email);
  }

  console.log("Created/updated " + createdOrUpdated + " restaurant owners.");
  console.log("Default password: " + DEFAULT_RESTAURANT_OWNER_PASSWORD);
  await dataSource.destroy();
}

createRestaurantOwners().catch(async (error) => {
  console.error("Create restaurant owners failed:", error);
  if (dataSource.isInitialized) {
    await dataSource.destroy();
  }
  process.exit(1);
});
