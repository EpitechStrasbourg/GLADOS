import fs from 'fs';
import path from 'path';
import { sequelize } from '@/database';
import { Sequelize } from 'sequelize';
import Umzug from 'umzug';

const umzug = new Umzug({
  migrations: {
    params: [sequelize.getQueryInterface(), Sequelize],
    path: path.join(__dirname, 'migrations'),
    pattern: /\.js$/,
  },
  storage: 'sequelize',
  storageOptions: {
    sequelize,
  },
});

function createFile(name: string) {
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '');
  const filePath = path.join(
    __dirname,
    '..',
    '..',
    'src',
    'database',
    'migrations',
    `${timestamp}-${name}.ts`,
  );
  const fileContent = `import { QueryInterface, Sequelize, DataTypes } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface, sequelize: Sequelize) => {
    // Put your modifications here.
  },
  down: async (queryInterface: QueryInterface, sequelize: Sequelize) => {
    // Delete your modifications here.
  }
}`;

  try {
    fs.writeFileSync(filePath, fileContent);
    console.log(
      '\x1b[32m%s\x1b[0m',
      `${name} file has been successfully created in migrations folder!`,
    );
  } catch (err) {
    console.log('\x1b[31m%s\x1b[0m', `Error creating ${name} file:`, err);
  }
}

async function performMigration(action: 'up' | 'down') {
  try {
    if (action === 'up') {
      await umzug.up();
      console.log('\x1b[32m%s\x1b[0m', 'Migrations applied successfully.');
    } else if (action === 'down') {
      await umzug.down();
      console.log('\x1b[32m%s\x1b[0m', 'Last migration reverted successfully.');
    }
  } catch (err) {
    console.log(
      '\x1b[31m%s\x1b[0m',
      `Error performing ${action} migration:`,
      err,
    );
  }
}

const command = process.argv[2];

if (command === 'up' || command === 'down') {
  performMigration(command);
} else if (command === 'create') {
  const name = process.argv[3];
  if (!name) {
    console.log(
      '\x1b[31m%s\x1b[0m',
      'Please enter a name to create your new migration.\nExample: npm run db:create new_migration',
    );
  } else {
    createFile(name);
  }
}
