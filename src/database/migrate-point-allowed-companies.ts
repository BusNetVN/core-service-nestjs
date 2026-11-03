import { DataSource } from 'typeorm';

export async function migratePointAllowedCompanies(dataSource: DataSource) {
  await dataSource.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'tbl_point_allowed_companies'
      ) THEN
        RETURN;
      END IF;

      ALTER TABLE tbl_point_allowed_companies
      DROP CONSTRAINT IF EXISTS fk_point_allowed_companies_point;

      ALTER TABLE tbl_point_allowed_companies
      ADD CONSTRAINT fk_point_allowed_companies_point
      FOREIGN KEY (point_id) REFERENCES tbl_points(id) ON DELETE CASCADE;

      ALTER TABLE tbl_point_allowed_companies
      DROP CONSTRAINT IF EXISTS fk_point_allowed_companies_company;

      ALTER TABLE tbl_point_allowed_companies
      ADD CONSTRAINT fk_point_allowed_companies_company
      FOREIGN KEY (company_id) REFERENCES tbl_companies(id) ON DELETE CASCADE;
    END $$;
  `);
}
