import { DataSource } from 'typeorm';

// tbl_users came from the EF Core migrations and its entity uses synchronize: false,
// so synchronize never adds these columns.
export async function migrateUserAudit(dataSource: DataSource) {
  await dataSource.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'tbl_users'
      ) THEN
        ALTER TABLE tbl_users ADD COLUMN IF NOT EXISTS created_by VARCHAR(64);
        ALTER TABLE tbl_users ADD COLUMN IF NOT EXISTS updated_by VARCHAR(64);
      END IF;
    END $$;
  `);
}
