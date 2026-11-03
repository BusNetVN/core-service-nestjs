import { DataSource } from 'typeorm';

// tbl_route_stops becomes tbl_route_point (entity RoutePoint). Runs before synchronize so the
// existing rows are kept instead of synchronize creating an empty table next to the old one.
export async function migrateRoutePointTable(dataSource: DataSource) {
  await dataSource.query(`
    DO $$
    BEGIN
      IF to_regclass('public.tbl_route_stops') IS NULL
        OR to_regclass('public.tbl_route_point') IS NOT NULL THEN
        RETURN;
      END IF;

      ALTER TABLE tbl_route_stops RENAME TO tbl_route_point;
      ALTER SEQUENCE IF EXISTS tbl_route_stops_id_seq RENAME TO tbl_route_point_id_seq;

      IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_route_stops_route') THEN
        ALTER TABLE tbl_route_point
          RENAME CONSTRAINT fk_route_stops_route TO fk_route_point_route;
      END IF;
      IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_route_stops_point') THEN
        ALTER TABLE tbl_route_point
          RENAME CONSTRAINT fk_route_stops_point TO fk_route_point_point;
      END IF;
      ALTER INDEX IF EXISTS uq_route_stops_route_point RENAME TO uq_route_point_route_point;
    END $$;
  `);
}
