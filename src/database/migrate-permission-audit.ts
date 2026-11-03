import { DataSource } from 'typeorm';

// tbl_permission_groups / tbl_permissions came from the EF Core migrations and their
// entities use synchronize: false, so synchronize never adds these columns.
export async function migratePermissionAudit(dataSource: DataSource) {
  await dataSource.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'tbl_permission_groups'
      ) THEN
        ALTER TABLE tbl_permission_groups ADD COLUMN IF NOT EXISTS created_by VARCHAR(64);
        ALTER TABLE tbl_permission_groups ADD COLUMN IF NOT EXISTS updated_by VARCHAR(64);
      END IF;

      IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'tbl_permissions'
      ) THEN
        ALTER TABLE tbl_permissions ADD COLUMN IF NOT EXISTS created_by VARCHAR(64);
        ALTER TABLE tbl_permissions ADD COLUMN IF NOT EXISTS updated_by VARCHAR(64);
      END IF;
    END $$;
  `);
}
