import { DataSource } from 'typeorm';

// tbl_users.company_id used to hold the company uuid without a constraint. It becomes the
// company's bigint id with a real foreign key, like the other company-owned tables. The
// entity uses synchronize: false, so the column and constraint are managed here; it runs
// after synchronize so tbl_companies exists.
export async function migrateUserCompanyFk(dataSource: DataSource) {
  await dataSource.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'tbl_users'
      ) OR NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'tbl_companies'
      ) THEN
        RETURN;
      END IF;

      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'tbl_users'
          AND column_name = 'company_id'
          AND data_type = 'uuid'
      ) THEN
        ALTER TABLE tbl_users ADD COLUMN company_ref BIGINT;

        UPDATE tbl_users AS account
        SET company_ref = company.id
        FROM tbl_companies AS company
        WHERE account.company_id = company.uuid;

        ALTER TABLE tbl_users DROP COLUMN company_id;
        ALTER TABLE tbl_users RENAME COLUMN company_ref TO company_id;
      END IF;

      ALTER TABLE tbl_users ADD COLUMN IF NOT EXISTS company_id BIGINT;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_users_company'
      ) THEN
        ALTER TABLE tbl_users
          ADD CONSTRAINT fk_users_company FOREIGN KEY (company_id)
          REFERENCES tbl_companies (id) ON DELETE RESTRICT;
      END IF;

      CREATE INDEX IF NOT EXISTS ix_tbl_users_company_id ON tbl_users (company_id);
    END $$;
  `);
}
