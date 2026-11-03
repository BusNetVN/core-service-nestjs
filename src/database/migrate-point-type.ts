import { DataSource } from 'typeorm';

export async function migratePointType(dataSource: DataSource) {
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
      ADD COLUMN IF NOT EXISTS point_type VARCHAR(32);

      UPDATE tbl_points
      SET point_type = ''
      WHERE point_type IS NULL;

      ALTER TABLE tbl_points
      ALTER COLUMN point_type SET DEFAULT '';

      ALTER TABLE tbl_points
      ALTER COLUMN point_type SET NOT NULL;
    END $$;
  `);
}
