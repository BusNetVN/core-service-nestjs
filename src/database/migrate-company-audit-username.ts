import { DataSource } from 'typeorm';

// created_by / updated_by used to hold the user uuid (with a foreign key to tbl_users);
// they now hold the username. Runs before synchronize, which would otherwise drop and
// re-create the columns on the type change and lose the values.
export async function migrateCompanyAuditUsername(dataSource: DataSource) {
  await dataSource.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'tbl_companies'
          AND column_name IN ('created_by', 'updated_by')
          AND data_type = 'uuid'
      ) THEN
        RETURN;
      END IF;

      ALTER TABLE tbl_companies DROP CONSTRAINT IF EXISTS fk_companies_created_by;
      ALTER TABLE tbl_companies DROP CONSTRAINT IF EXISTS fk_companies_updated_by;

      ALTER TABLE tbl_companies
        ALTER COLUMN created_by TYPE VARCHAR(64) USING created_by::text,
        ALTER COLUMN updated_by TYPE VARCHAR(64) USING updated_by::text;

      UPDATE tbl_companies AS company
      SET created_by = account.username
      FROM tbl_users AS account
      WHERE company.created_by = account.uuid::text;

      UPDATE tbl_companies AS company
      SET updated_by = account.username
      FROM tbl_users AS account
      WHERE company.updated_by = account.uuid::text;
    END $$;
  `);
}
