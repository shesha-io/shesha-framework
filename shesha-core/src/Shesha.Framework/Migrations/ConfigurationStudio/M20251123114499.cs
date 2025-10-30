using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.ConfigurationStudio
{
    [Migration(20251123114499)]
    public class M20251123114499 : OneWayMigration
    {
        public override void Up()
        {
            Execute.Sql(@"INSERT INTO frwk.user_login_attempts
	(id, tenant_id, browser_info, client_ip_address, client_name, creation_time, device_name, imei, login_attempt_number, result_lkp, tenancy_name, user_id, user_name_or_email_address)
select ""Id""
      ,""TenantId""
      ,""BrowserInfo""
      ,""ClientIpAddress""
      ,""ClientName""
      ,""CreationTime""
	  ,""DeviceName""
      ,""IMEI""
	  ,""LoginAttemptNumber""
      ,""ResultLkp""
      ,""TenancyName""
      ,""UserId""
      ,""UserNameOrEmailAddress""     
from ""Frwk_UserLoginAttempts""
");

            Execute.Sql(@"insert into frwk.user_registrations
    (id
    ,additional_registration_info_form_module
    ,additional_registration_info_form_name
    ,creation_time
    ,go_to_url_after_registration
    ,is_complete
    ,user_id
    ,user_name_or_email_address)
select
	""Id""
    ,""AdditionalRegistrationInfoFormModule""
    ,""AdditionalRegistrationInfoFormName""
    ,""CreationTime""
	,""GoToUrlAfterRegistration""
	,""IsComplete""
	,""UserId""
	,""UserNameOrEmailAddress""
from ""Frwk_UserRegistration""");

            Execute.Sql(@"insert into frwk.mobile_devices
    (id
    ,creation_time
    ,creator_user_id
    ,last_modification_time
    ,last_modifier_user_id
    ,is_deleted
    ,deletion_time
    ,deleter_user_id
    ,imei
    ,is_locked
    ,last_bearing
    ,last_heart_beat_is_stationary
    ,last_heart_beat_time
    ,last_lat
    ,last_long
    ,last_speed
    ,name
    ,stationary_lat
    ,stationary_long
    ,stationary_time
    ,frwk_discriminator)
select 
	""Id""
	,""CreationTime""
    ,""CreatorUserId""
    ,""LastModificationTime""
    ,""LastModifierUserId""
    ,""IsDeleted""
    ,""DeletionTime""
    ,""DeleterUserId""
	,""IMEI""
	,""IsLocked""
	,""LastBearing""
	,""LastHeartBeatIsStationary""
	,""LastHeartBeatTime""
	,""LastLat""
    ,""LastLong""
	,""LastSpeed""
    ,""Name""
    ,""StationaryLat""
    ,""StationaryLong""
    ,""StationaryTime""
    ,""Frwk_Discriminator""
from ""Frwk_MobileDevices""
");

            Execute.Sql(@"insert into frwk.otp_audit_items
	(id
	,creation_time
	,creator_user_id
	,last_modification_time
	,last_modifier_user_id
	,is_deleted
	,deletion_time
	,deleter_user_id
	,action_type
	,error_message
	,expires_on
	,otp
	,recipient_id
	,recipient_type
	,send_status_lkp
	,send_to
	,send_type_lkp
	,sent_on)
select
	""Id""
    ,""CreationTime""
    ,""CreatorUserId""
    ,""LastModificationTime""
    ,""LastModifierUserId""
    ,""IsDeleted""
    ,""DeletionTime""
    ,""DeleterUserId""
    ,""ActionType""
    ,""ErrorMessage""
    ,""ExpiresOn""
    ,""Otp""
    ,""RecipientId""
    ,""RecipientType""
    ,""SendStatusLkp""
    ,""SendTo""
    ,""SendTypeLkp""
	,""SentOn""
from ""Frwk_OtpAuditItems""
");

            Execute.Sql(@"insert into frwk.device_force_updates
	(id
	,creation_time
	,creator_user_id
	,last_modification_time
	,last_modifier_user_id
	,is_deleted
	,deletion_time
	,deleter_user_id
	,app_store_url
	,description
	,name
	,os_type
	,version_no
	,frwk_discriminator)
select 
	""Id""
	,""CreationTime""
    ,""CreatorUserId""
    ,""LastModificationTime""
    ,""LastModifierUserId""
    ,""IsDeleted""
    ,""DeletionTime""
    ,""DeleterUserId""
	,""AppStoreUrl""
	,""Description""
    ,""Name""
    ,""OSType""
	,""VersionNo""  
    ,""Frwk_Discriminator""
from ""Frwk_DeviceForceUpdates""
");

            Execute.Sql(@"insert into frwk.stored_files
    (id
    ,creation_time
    ,creator_user_id
    ,last_modification_time
    ,last_modifier_user_id
    ,is_deleted
    ,deletion_time
    ,deleter_user_id
    ,tenant_id
    ,owner_id
    ,owner_class_name
    ,category
    ,description
    ,file_name
    ,file_type
    ,folder
    ,is_version_controlled
    ,sort_order
    ,temporary
    ,parent_file_id)
select
	""Id""
    ,""CreationTime""
    ,""CreatorUserId""
    ,""LastModificationTime""
    ,""LastModifierUserId""
    ,""IsDeleted""
    ,""DeletionTime""
    ,""DeleterUserId""
    ,""TenantId""
    ,""OwnerId""
    ,""OwnerClassName""
	,""Category""
	,""Description""
    ,""FileName""
    ,""FileType""
    ,""Folder""
    ,""IsVersionControlled""
	,""SortOrder""
	,""Temporary""
    ,""ParentFileId""
from ""Frwk_StoredFiles""
");

            Execute.Sql(@"INSERT INTO frwk.stored_file_versions
    (id
    ,creation_time
    ,creator_user_id
    ,last_modification_time
    ,last_modifier_user_id
    ,is_deleted
    ,deletion_time
    ,deleter_user_id
    ,tenant_id
    ,description
    ,file_name
    ,file_size
    ,file_type
    ,is_last
    ,is_signed
    ,version_no
    ,file_id)
select
	""Id""
    ,""CreationTime""
    ,""CreatorUserId""
    ,""LastModificationTime""
    ,""LastModifierUserId""
    ,""IsDeleted""
    ,""DeletionTime""
    ,""DeleterUserId""
    ,""TenantId""
    ,""Description""
	,""FileName""
	,""FileSize""
    ,""FileType""
	,""IsLast""
	,""IsSigned""
	,""VersionNo""
    ,""FileId""
from ""Frwk_StoredFileVersions""
");

            Execute.Sql(@"insert into frwk.versioned_fields
    (id
    ,creation_time
    ,creator_user_id
    ,last_modification_time
    ,last_modifier_user_id
    ,is_deleted
    ,deletion_time
    ,deleter_user_id
    ,tenant_id
    ,name
    ,frwk_owner_id
    ,frwk_owner_type
    ,track_versions)
select 
	""Id""
    ,""CreationTime""
    ,""CreatorUserId""
    ,""LastModificationTime""
    ,""LastModifierUserId""
    ,""IsDeleted""
    ,""DeletionTime""
    ,""DeleterUserId""
    ,""TenantId""
    ,""Name""
    ,""Frwk_OwnerId""
    ,""Frwk_OwnerType""
    ,""TrackVersions""
from ""Frwk_VersionedFields""
");

            Execute.Sql(@"insert into frwk.versioned_field_versions
    (id
    ,creation_time
    ,creator_user_id
    ,last_modification_time
    ,last_modifier_user_id
    ,is_deleted
    ,deletion_time
    ,deleter_user_id
    ,tenant_id
    ,content
    ,is_last
    ,field_id)
select 
	""Id""
    ,""CreationTime""
    ,""CreatorUserId""
    ,""LastModificationTime""
    ,""LastModifierUserId""
    ,""IsDeleted""
    ,""DeletionTime""
    ,""DeleterUserId""
    ,""TenantId""
    ,""Content""
    ,""IsLast""
	,""FieldId""    
from ""Frwk_VersionedFieldVersions""
");

            Execute.Sql(@"insert into frwk.bootstrapper_startups
    (id
    ,bootstrapper_name
    ,context
    ,creation_time
    ,finished_on
    ,force
    ,result
    ,started_on
    ,status)
select
	id
    ,bootstrapper_name
	,context
	,creation_time
	,finished_on
    ,force
    ,result
    ,started_on
	,status
from frwk_bootstrapper_startups
");

            Execute.Sql(@"insert into frwk.import_results
	(id
	,creation_time
	,creator_user_id
	,last_modification_time
	,last_modifier_user_id
	,is_deleted
	,deletion_time
	,deleter_user_id
	,tenant_id
	,avg_speed
	,comment
	,error_message
	,finished_on
	,imported_file_md5
	,is_success
	,log_file_path
	,rows_affected
	,rows_inactivated
	,rows_inserted
	,rows_skipped
	,rows_skipped_not_changed
	,rows_updated
	,source_type_lkp
	,started_on
	,frwk_discriminator
	,imported_file_id
	,log_file_id)
select 
	""Id""
    ,""CreationTime""
    ,""CreatorUserId""
    ,""LastModificationTime""
    ,""LastModifierUserId""
    ,""IsDeleted""
    ,""DeletionTime""
    ,""DeleterUserId""
    ,""TenantId""
    ,""AvgSpeed""
    ,coalesce(""Comment"", '')
    ,coalesce(""ErrorMessage"", '')
    ,""FinishedOn""
    ,""ImportedFileMD5""
	,""IsSuccess""
	,coalesce(""LogFilePath"", '')
	,""RowsAffected""
	,""RowsInactivated""
    ,""RowsInserted""
	,""RowsSkipped""
    ,""RowsSkippedNotChanged""
	,""RowsUpdated""
	,""SourceTypeLkp""
	,""StartedOn""
	,""Frwk_Discriminator""
	,""ImportedFileId""
    ,""LogFileId""
from ""Frwk_ImportResults""");

            Execute.Sql(@"insert into frwk.application_startups
(id, account, error_message, finished_on, folder, machine_name, started_on, bootstrappers_disabled, migrations_disabled, status)
select
id, account, error_message, finished_on, folder, machine_name, started_on, bootstrappers_disabled, migrations_disabled, status
from 
frwk_application_startups");

            Execute.Sql(@"insert into frwk.application_startup_assemblies
(id, file_md5, file_name, file_path, file_version, product_version, application_startup_id)
select
id, file_md5, file_name, file_path, file_version, product_version, application_startup_id
from
frwk_application_startup_assemblies
where
application_startup_id is not null");

            Execute.Sql(@"insert into frwk.hi_lo_sequences
	(sequence_name, next_value)
select
	""SequenceName"", ""NextValue""
from ""Frwk_HiLoSequences""");
        }
    }
}
