using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.ConfigurationStudio
{
    [Migration(20251123154199)]
    public class M20251123154199 : OneWayMigration
    {
        private void MoveFks(string oldTable, string newTable) 
        {
            this.Shesha().MoveForeignKeys(oldTable, null, "Id", newTable, "frwk", "id");
        }

        public override void Up()
        {
            MoveFks("Frwk_UserLoginAttempts", "user_login_attempts");
            MoveFks("Frwk_UserRegistration", "user_registrations");
            MoveFks("Frwk_StoredFiles", "stored_files");
            MoveFks("Frwk_StoredFileVersions", "stored_file_versions");
            MoveFks("Frwk_VersionedFields", "versioned_fields");
            MoveFks("Frwk_VersionedFieldVersions", "versioned_field_versions");
            MoveFks("Frwk_OtpAuditItems", "otp_audit_items");
            MoveFks("Frwk_MobileDevices", "mobile_devices");
            MoveFks("Frwk_DeviceForceUpdates", "device_force_updates");
            MoveFks("frwk_bootstrapper_startups", "bootstrapper_startups");
            MoveFks("frwk_application_startups", "application_startups");
            MoveFks("frwk_application_startup_assemblies", "application_startup_assemblies");
            MoveFks("Frwk_ImportResults", "import_results");


            Create.Index("ix_stored_files_owner").OnTable("stored_files").InSchema("frwk")
                .OnColumn("owner_id").Ascending()
                .OnColumn("owner_class_name").Ascending()
                .OnColumn("category").Ascending()
                .OnColumn("is_deleted").Ascending();

            IfDatabase("SqlServer").Execute.Sql(@"create trigger frwk.trg_stored_file_versions_update_is_last_ad
   ON frwk.stored_file_versions
   AFTER DELETE
AS 
BEGIN
	SET NOCOUNT ON;
	
	if exists (select 1 from deleted where is_last = 1)
	begin
		update 
			ver
		set
			is_last = (case when ver.is_last = 1 then 0 else 1 end)
		from
			frwk.stored_file_versions ver WITH(NOLOCK)
			inner join (select distinct file_id from deleted) file_ids on file_ids.file_id = ver.file_id
		where
			ver.is_last <> (case when exists (
				select 
					1 
				from 
					frwk.stored_file_versions nerwer_ver WITH(NOLOCK)
				where
					nerwer_ver.file_id = ver.file_id
					and nerwer_ver.id <> ver.id
					and nerwer_ver.is_deleted = 0
					and nerwer_ver.creation_time > ver.creation_time
			) then 0 else 1 end)
	end
END");

            IfDatabase("SqlServer").Execute.Sql(@"create trigger frwk.trg_stored_file_versions_update_is_last_aiu
   ON frwk.stored_file_versions
   AFTER INSERT, UPDATE
AS 
BEGIN
	SET NOCOUNT ON;

	IF UPDATE (creation_time) or UPDATE(is_deleted) or UPDATE (is_last)
	begin
		update 
			ver
		set
			is_last = (case when ver.is_last = 1 then 0 else 1 end)
		from
			frwk.stored_file_versions ver WITH(NOLOCK)
			inner join (select distinct file_id from inserted) file_ids on file_ids.file_id = ver.file_id
		where
			ver.is_last <> (case when exists (
				select 
					1 
				from 
					frwk.stored_file_versions newer_ver WITH(NOLOCK)
				where
					newer_ver.file_id = ver.file_id
					and newer_ver.id <> ver.id
					and newer_ver.is_deleted = 0
					and newer_ver.creation_time > ver.creation_time
			) then 0 else 1 end)
	end
END");

            IfDatabase("SqlServer").Execute.Sql(@"create trigger frwk.trg_user_login_attempts_update_last_login_date_ai
   ON frwk.user_login_attempts
   AFTER insert
AS 
BEGIN
	SET NOCOUNT ON;
	
	update 
		AbpUsers 
	set 
		LastLoginDate = i.creation_time
	from
		AbpUsers
		inner join inserted i on i.user_id = AbpUsers.Id
	where
		i.user_id is not null
		and i.result_lkp = 1
END");

            IfDatabase("SqlServer").Execute.Sql(@"create trigger frwk.trg_versioned_field_versions_update_is_last_ad
   ON frwk.versioned_field_versions
   AFTER DELETE
AS 
BEGIN
	SET NOCOUNT ON;
	
	if exists (select 1 from deleted where is_last = 1)
	begin
		update 
			ver
		set
			is_last = (case when ver.is_last = 1 then 0 else 1 end)
		from
			frwk.versioned_field_versions ver WITH(NOLOCK)
			inner join (select distinct field_id from deleted) field_ids on field_ids.field_id = ver.field_id
		where
			ver.is_last <> (case when exists (
				select 
					1 
				from 
					frwk.versioned_field_versions nerwer_ver WITH(NOLOCK)
				where
					nerwer_ver.field_id = ver.field_id
					and nerwer_ver.id <> ver.id
					and nerwer_ver.is_deleted = 0
					and nerwer_ver.creation_time > ver.creation_time
			) then 0 else 1 end)
	end
END");

            IfDatabase("SqlServer").Execute.Sql(@"create trigger frwk.trg_versioned_field_versions_update_is_last_aiu
   ON frwk.versioned_field_versions
   AFTER INSERT, UPDATE
AS 
BEGIN
	SET NOCOUNT ON;

	IF UPDATE (creation_time) or UPDATE(is_deleted) or UPDATE (is_last)
	begin
		update 
			ver
		set
			is_last = (case when ver.is_last = 1 then 0 else 1 end)
		from
			frwk.versioned_field_versions ver WITH(NOLOCK)
			inner join (select distinct field_id from inserted) field_ids on field_ids.field_id = ver.field_id
		where
			ver.is_last <> (case when exists (
				select 
					1 
				from 
					frwk.versioned_field_versions newer_ver WITH(NOLOCK)
				where
					newer_ver.field_id = ver.field_id
					and newer_ver.id <> ver.id
					and newer_ver.is_deleted = 0
					and newer_ver.creation_time > ver.creation_time
			) then 0 else 1 end)
	end
END");
			IfDatabase("PostgreSql").Execute.Sql(@"CREATE OR REPLACE FUNCTION frwk.log_stored_file_versions_update_is_last_ad()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
declare
    v_cnt numeric;
    toupdate numeric;
BEGIN

    v_cnt := 0;
	
	IF (SELECT 1 FROM deleted WHERE is_last = TRUE) IS NOT NULL THEN
		UPDATE frwk.stored_file_versions AS ver
		SET is_last = TRUE
		FROM (
			SELECT DISTINCT file_id
			FROM deleted
		) AS del
		WHERE (ver.is_last = FALSE OR ver.is_last IS NULL)
			AND ver.file_id = ANY (ARRAY(SELECT DISTINCT file_id FROM deleted))
			AND ver.id = (
				SELECT id
				FROM frwk.stored_file_versions AS ver2
				WHERE ver2.file_id = ver.file_id
				ORDER BY ver2.creation_time DESC
				LIMIT 1
			);
			
    GET DIAGNOSTICS v_cnt = ROW_COUNT;
    Raise notice 'set IsLast = true: %', (v_cnt);
	
	END IF;
	RETURN NULL;
END;
$function$
;
CREATE OR REPLACE FUNCTION frwk.log_stored_file_versions_update_is_last_ai()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
declare
    v_cnt numeric;
    toupdate numeric;
BEGIN

    v_cnt := 0;
	
	UPDATE frwk.stored_file_versions AS ver
	SET is_last = FALSE
	WHERE (ver.is_last = TRUE OR ver.is_last IS NULL)
		AND ver.file_id = ANY (ARRAY(SELECT DISTINCT file_id FROM inserted))
		AND ver.id <> (
			SELECT id
			FROM frwk.stored_file_versions AS ver2
			WHERE ver2.file_id = ver.file_id
			ORDER BY ver2.creation_time DESC
			LIMIT 1
		);

	
    GET DIAGNOSTICS v_cnt = ROW_COUNT;
    Raise notice 'set IsLast = false: %', (v_cnt);
    select count(1) into toupdate
	FROM frwk.stored_file_versions AS ver
    WHERE (ver.is_last = TRUE OR ver.is_last IS NULL)
		AND ver.file_id = ANY (ARRAY(SELECT DISTINCT file_id FROM inserted))
		AND ver.id <> (
			SELECT id
			FROM frwk.stored_file_versions AS ver2
			WHERE ver2.file_id = ver.file_id
			ORDER BY ver2.creation_time DESC
			LIMIT 1
        );  
    Raise notice 'toupdate: %', (toupdate);
    v_cnt := 0;
	
	UPDATE frwk.stored_file_versions AS ver
	SET is_last = TRUE
	WHERE (ver.is_last = FALSE OR ver.is_last IS NULL)
		AND ver.file_id = ANY (ARRAY(SELECT DISTINCT file_id FROM inserted))
		AND ver.id = (
			SELECT id
			FROM frwk.stored_file_versions AS ver2
			WHERE ver2.file_id = ver.file_id
			ORDER BY ver2.creation_time DESC
			LIMIT 1
		);
		
    GET DIAGNOSTICS v_cnt = ROW_COUNT;
    Raise notice 'set IsLast = true: %', (v_cnt);
	
	RETURN NULL;
END;
$function$
;
CREATE OR REPLACE FUNCTION frwk.log_stored_file_versions_update_is_last_au()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
declare
    v_cnt numeric;
    toupdate numeric;
BEGIN

    v_cnt := 0;
	
	IF TG_OP = 'UPDATE'  THEN
		 IF EXISTS ( SELECT 1 FROM updated
						inner join frwk.stored_file_versions conf on conf.id=updated.id
						WHERE (updated.creation_time IS DISTINCT FROM conf.creation_time)
					) THEN

			UPDATE frwk.stored_file_versions AS ver
			SET is_last = FALSE
			WHERE (ver.is_last = TRUE OR ver.is_last IS NULL)
				AND ver.file_id = ANY (ARRAY(SELECT DISTINCT file_id FROM updated))
				AND ver.id <> (
					SELECT id
					FROM frwk.stored_file_versions AS ver2
					WHERE ver2.file_id = ver.file_id
					ORDER BY ver2.creation_time DESC
					LIMIT 1
				);

	
    GET DIAGNOSTICS v_cnt = ROW_COUNT;
    Raise notice 'set IsLast = false: %', (v_cnt);
    select count(1) into toupdate
	FROM frwk.stored_file_versions AS ver
    WHERE (ver.is_last = TRUE OR ver.is_last IS NULL)
				AND ver.file_id = ANY (ARRAY(SELECT DISTINCT file_id FROM updated))
				AND ver.id <> (
					SELECT id
					FROM frwk.stored_file_versions AS ver2
					WHERE ver2.file_id = ver.file_id
					ORDER BY ver2.creation_time DESC
					LIMIT 1
				);

    Raise notice 'toupdate: %', (toupdate);
    v_cnt := 0;
	
			UPDATE frwk.stored_file_versions AS ver
			SET is_last = TRUE
			WHERE (ver.is_last = FALSE OR ver.is_last IS NULL)
				AND ver.file_id = ANY (ARRAY(SELECT DISTINCT file_id FROM updated))
				AND ver.id = (
					SELECT id
					FROM frwk.stored_file_versions AS ver2
					WHERE ver2.file_id = ver.file_id
					ORDER BY ver2.creation_time DESC
					LIMIT 1
				);
				
    GET DIAGNOSTICS v_cnt = ROW_COUNT;
    Raise notice 'set IsLast = true: %', (v_cnt);
	
		END IF;
	END IF;

	RETURN NEW;
END;
$function$
;
create trigger trg_versioned_field_versions_update_is_last_ad after
delete
    on
    frwk.stored_file_versions referencing old table as deleted for each statement execute function frwk.log_stored_file_versions_update_is_last_ad();
    
create trigger trg_versioned_field_versions_update_is_last_ai after
insert
    on
    frwk.stored_file_versions referencing new table as inserted for each statement execute function frwk.log_stored_file_versions_update_is_last_ai();    
    
create trigger trg_versioned_field_versions_update_is_last_au after
update
    on
    frwk.stored_file_versions referencing old table as updated for each statement execute function frwk.log_stored_file_versions_update_is_last_au();");

			IfDatabase("PostgreSql").Execute.Sql(@"CREATE OR REPLACE FUNCTION frwk.log_user_login_attempts_update_last_login_date_ai()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$

BEGIN
	IF NEW.user_id IS NOT NULL AND NEW.result_lkp = 1 THEN
		UPDATE ""AbpUsers""
		SET ""LastLoginDate"" = NEW.creation_time
		WHERE ""Id"" = NEW.user_id;
	END IF;
	
	RETURN NEW;
END;
$function$
;

create trigger trg_user_login_attempts_update_last_login_date_ai after
insert
    on
    frwk.user_login_attempts for each row execute function frwk.log_user_login_attempts_update_last_login_date_ai();");

			IfDatabase("PostgreSql").Execute.Sql(@"CREATE OR REPLACE FUNCTION frwk.log_versioned_field_versions_update_is_last_ad()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
declare
    v_cnt numeric;
BEGIN

    v_cnt := 0;
	
	if exists (select 1 from deleted where is_last = TRUE) then
	
		update frwk.versioned_field_versions log
		set is_last = TRUE 
		where
			(log.is_last = FALSE or log.is_last is null)
			and log.field_id = ANY (ARRAY(SELECT DISTINCT field_id FROM deleted))
			and log.id = (
				select 
					id
				from
					frwk.versioned_field_versions log2
				where
					(log2.is_deleted = FALSE or log2.is_deleted is null)
					and log2.field_id = log.field_id
				order by log2.creation_time desc
				limit 1
			);

    GET DIAGNOSTICS v_cnt = ROW_COUNT;
    Raise notice 'set is_last = true: %', (v_cnt);
	end if;
	RETURN NULL;
END;
$function$
;

CREATE OR REPLACE FUNCTION frwk.log_versioned_field_versions_update_is_last_ai()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
declare
    v_cnt numeric;
    toupdate numeric;
BEGIN
    v_cnt := 0;
	
	update frwk.versioned_field_versions log
	set is_last = FALSE  
	where
		(log.is_last = TRUE or log.is_last is null)
		and log.field_id = ANY (ARRAY(SELECT DISTINCT field_id FROM inserted))
		and log.id <> (
			select id
			from frwk.versioned_field_versions log2
			where (log2.is_deleted = FALSE or log2.is_deleted is null)
				and log2.field_id = log.field_id
			order by log2.creation_time desc
			limit 1
		);

	
    GET DIAGNOSTICS v_cnt = ROW_COUNT;
    Raise notice 'set is_last = false: %', (v_cnt);
    select count(1) into toupdate
	FROM frwk.versioned_field_versions log
	where (log.is_last = TRUE or log.is_last is null)
		and log.field_id = ANY (ARRAY(SELECT DISTINCT field_id FROM inserted))
		and log.id <> (
			select id
			from frwk.versioned_field_versions log2
			where (log2.is_deleted = FALSE or log2.is_deleted is null)
				and log2.field_id = log.field_id
			order by log2.creation_time desc
			limit 1
        );  
    Raise notice 'toupdate: %', (toupdate);
    v_cnt := 0;
	
	update frwk.versioned_field_versions log
	set is_last = TRUE 
	where (log.is_last = FALSE or log.is_last is null)
		and log.field_id = ANY (ARRAY(SELECT DISTINCT field_id FROM inserted))
		and log.id = (
			select 
				id
			from frwk.versioned_field_versions log2
			where (log2.is_deleted = FALSE or log2.is_deleted is null)
				and log2.field_id = log.field_id
			order by log2.creation_time desc
			limit 1
		);
		
    GET DIAGNOSTICS v_cnt = ROW_COUNT;
    Raise notice 'set is_last = true: %', (v_cnt);
	
	RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION frwk.log_versioned_field_versions_update_is_last_au()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
declare
    v_cnt numeric;
    toupdate numeric;
BEGIN

    v_cnt := 0;
	
    IF (TG_OP = 'UPDATE') THEN
		 IF EXISTS ( SELECT 1 FROM updated
						inner join frwk.versioned_field_versions conf on conf.id=updated.id
						WHERE (updated.creation_time IS DISTINCT FROM conf.creation_time) OR (updated.is_deleted IS DISTINCT FROM conf.is_deleted)
					) THEN
			update frwk.versioned_field_versions log
			set is_last = false  
			where (log.is_last = true or log.is_last is null)
				and log.field_id = ANY (ARRAY(SELECT DISTINCT field_id FROM updated))
				and log.id <> (
					select id
					from frwk.versioned_field_versions log2
					where (log2.is_deleted = false or log2.is_deleted is null)
						and log2.field_id = log.field_id
					order by log2.creation_time desc
					limit 1
				);

	
    GET DIAGNOSTICS v_cnt = ROW_COUNT;
    Raise notice 'set is_last = false: %', (v_cnt);
    select count(1) into toupdate
	FROM frwk.versioned_field_versions log
			where (log.is_last = true or log.is_last is null)
				and log.field_id = ANY (ARRAY(SELECT DISTINCT field_id FROM updated))
				and log.id <> (
					select id
					from frwk.versioned_field_versions log2
					where (log2.is_deleted = false or log2.is_deleted is null)
						and log2.field_id = log.field_id
					order by log2.creation_time desc
					limit 1
        );  
    Raise notice 'toupdate: %', (toupdate);
    v_cnt := 0;
	
			update frwk.versioned_field_versions log
			set is_last = true  
			where
				(log.is_last = false or log.is_last is null)
				and log.field_id = ANY (ARRAY(SELECT DISTINCT field_id FROM updated))
				and log.id = (
					select id
					from frwk.versioned_field_versions log2
					where (log2.is_deleted = false or log2.is_deleted is null)
						and log2.field_id = log.field_id
					order by log2.creation_time desc
					limit 1
				);
    GET DIAGNOSTICS v_cnt = ROW_COUNT;
    Raise notice 'set is_last = true: %', (v_cnt);
	
		end if;
	end if;
	RETURN NULL;
END;
$function$
;

create trigger trg_versioned_field_versions_update_is_last_ad after
delete
    on
    frwk.versioned_field_versions referencing old table as deleted for each statement execute function frwk.log_versioned_field_versions_update_is_last_ad();

create trigger trg_versioned_field_versions_update_is_last_ai after
insert
    on
    frwk.versioned_field_versions referencing new table as inserted for each statement execute function frwk.log_versioned_field_versions_update_is_last_ai();
    
create trigger trg_versioned_field_versions_update_is_last_au after
update
    on
    frwk.versioned_field_versions referencing old table as updated for each statement execute function frwk.log_versioned_field_versions_update_is_last_au();
");
        }
    }
}
