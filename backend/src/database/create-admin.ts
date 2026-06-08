import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/entity/user.entity';

const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@hungerdash.local';
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';
const DEFAULT_ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'HungerDash Admin';

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.MYSQLHOST,
  port: Number(process.env.MYSQLPORT),
  username: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  entities: [User],
  ssl:
    process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
  synchronize: false,
});

async function ensureUsersTable() {
  const tables = await dataSource.query('SHOW TABLES');
  const tableNames = tables.map(
    (row: Record<string, string>) => Object.values(row)[0],
  );

  if (!tableNames.includes('users')) {
    throw new Error(
      'Missing table: users. Current database is MYSQLDATABASE=' +
        process.env.MYSQLDATABASE +
        '. Create or sync schema before running seed:admin.',
    );
  }
}

async function createAdmin() {
  await dataSource.initialize();
  await ensureUsersTable();

  const userRepository = dataSource.getRepository(User);
  const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
  let admin = await userRepository.findOne({
    where: { email: DEFAULT_ADMIN_EMAIL },
  });

  if (admin) {
    admin.username = DEFAULT_ADMIN_USERNAME;
    admin.password = hashedPassword;
    admin.role = 'admin';
    admin.status = 'active';
    admin.refreshToken = null;
    admin.resetPasswordToken = null;
    admin.resetPasswordExpires = null;
  } else {
    admin = userRepository.create({
      username: DEFAULT_ADMIN_USERNAME,
      email: DEFAULT_ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin',
      status: 'active',
      phoneNumber: null,
      avatar: null,
    });
  }

  await userRepository.save(admin);
  console.log('Admin account is ready.');
  console.log('Email: ' + DEFAULT_ADMIN_EMAIL);
  console.log('Password: ' + DEFAULT_ADMIN_PASSWORD);
  await dataSource.destroy();
}

createAdmin().catch(async (error) => {
  console.error('Create admin failed:', error);
  if (dataSource.isInitialized) {
    await dataSource.destroy();
  }
  process.exit(1);
});
