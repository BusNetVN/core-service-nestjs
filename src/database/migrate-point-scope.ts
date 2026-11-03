import { DataSource } from 'typeorm';

export async function migratePointScope(dataSource: DataSource) {
  await dataSource.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'tbl_points'
      ) THEN
        RETURN;
      END IF;

      ALTER TABLE tbl_points
      ADD COLUMN IF NOT EXISTS scope VARCHAR(16);

      UPDATE tbl_points
      SET scope = CASE
        WHEN company_id IS NULL THEN 'SYSTEM'
        ELSE 'COMPANY'
      END
      WHERE scope IS NULL OR scope = '';

      ALTER TABLE tbl_points
      ALTER COLUMN scope SET DEFAULT 'SYSTEM';

      ALTER TABLE tbl_points
      ALTER COLUMN scope SET NOT NULL;
    END $$;
  `);
}
