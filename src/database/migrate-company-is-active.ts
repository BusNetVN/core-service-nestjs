import { DataSource } from 'typeorm';

// Runs before synchronize: a plain sync would drop "status" and add an empty "is_active".
export async function migrateCompanyIsActive(dataSource: DataSource) {
  await dataSource.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'tbl_companies'
          AND column_name = 'status'
      ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'tbl_companies'
          AND column_name = 'is_active'
      ) THEN
        ALTER TABLE tbl_companies RENAME COLUMN status TO is_active;
      END IF;
    END $$;
  `);
}
