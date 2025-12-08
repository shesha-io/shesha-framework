//using FluentMigrator;
//using Shesha.FluentMigrator;
//using System;

//namespace Shesha.Migrations
//{
//    /// <summary>
//    /// Migration to consolidate password complexity settings from ABP settings into DefaultAuthenticationSettings
//    /// </summary>
//    [Migration(20251119120000)]
//    public class M20251119120000 : OneWayMigration
//    {
//        public override void Up()
//        {
//            // Get the DefaultAuthenticationSettings configuration item ID
//            var getSettingConfigIdSql = @"
//                      select top 1 id
//                      from frwk.configuration_items
//                      where [name] = 'default-authentication-settings'
//                      order by last_modification_time desc";

//            // SQL Server version
//            IfDatabase("SqlServer").Execute.Sql($@"
//declare @settingConfigId uniqueidentifier;
//set @settingConfigId = ({getSettingConfigIdSql});

//-- Only proceed if the DefaultAuthenticationSettings configuration exists
//if @settingConfigId is not null
//begin
//    -- Migrate password complexity settings from ABP settings to DefaultAuthenticationSettings
//    -- for each application and tenant combination

//    -- Create a temp table to hold the merged settings
//    select
//        application_id,
//        user_id,
//        setting_value_id,
//        new_value
//    into #new_json_values
//    from (
//        -- Get existing DefaultAuthenticationSettings values
//        select
//            coalesce(es.application_id, aps.application_id) as application_id,
//            coalesce(es.user_id, aps.user_id) as user_id,
//            es.setting_value_id,
//            case
//                when es.value is null then
//                    -- Create new JSON object with password complexity settings
//                    N'{{' +
//                    case when aps.RequireDigit is not null then N'""RequireDigit"":' + lower(aps.RequireDigit) + N',' else N'' end +
//                    case when aps.RequireLowercase is not null then N'""RequireLowercase"":' + lower(aps.RequireLowercase) + N',' else N'' end +
//                    case when aps.RequireNonAlphanumeric is not null then N'""RequireNonAlphanumeric"":' + lower(aps.RequireNonAlphanumeric) + N',' else N'' end +
//                    case when aps.RequireUppercase is not null then N'""RequireUppercase"":' + lower(aps.RequireUppercase) + N',' else N'' end +
//                    case when aps.RequiredLength is not null then N'""RequiredLength"":' + aps.RequiredLength else N'' end +
//                    N'}}'
//                else
//                    -- Merge with existing JSON (simple string manipulation for basic cases)
//                    -- Remove the closing brace, add password complexity fields, then close
//                    replace(
//                        rtrim(ltrim(es.value)),
//                        N'}}',
//                        case when es.value like N'%{{%}}' then N'' else N',' end +
//                        case when aps.RequireDigit is not null then N'""RequireDigit"":' + lower(aps.RequireDigit) + N',' else N'' end +
//                        case when aps.RequireLowercase is not null then N'""RequireLowercase"":' + lower(aps.RequireLowercase) + N',' else N'' end +
//                        case when aps.RequireNonAlphanumeric is not null then N'""RequireNonAlphanumeric"":' + lower(aps.RequireNonAlphanumeric) + N',' else N'' end +
//                        case when aps.RequireUppercase is not null then N'""RequireUppercase"":' + lower(aps.RequireUppercase) + N',' else N'' end +
//                        case when aps.RequiredLength is not null then N'""RequiredLength"":' + aps.RequiredLength else N'' end +
//                        N'}}'
//                    )
//            end as new_value
//        from (
//            select
//                sv.application_id,
//                sv.user_id,
//                sv.value,
//                sv.id as setting_value_id
//            from frwk.setting_values sv
//            where sv.setting_configuration_id = @settingConfigId
//        ) es
//        full outer join (
//            select
//                null as application_id,
//                null as user_id,
//                max(case when Name = 'Abp.Zero.UserManagement.PasswordComplexity.RequireDigit' then Value else null end) as RequireDigit,
//                max(case when Name = 'Abp.Zero.UserManagement.PasswordComplexity.RequireLowercase' then Value else null end) as RequireLowercase,
//                max(case when Name = 'Abp.Zero.UserManagement.PasswordComplexity.RequireNonAlphanumeric' then Value else null end) as RequireNonAlphanumeric,
//                max(case when Name = 'Abp.Zero.UserManagement.PasswordComplexity.RequireUppercase' then Value else null end) as RequireUppercase,
//                max(case when Name = 'Abp.Zero.UserManagement.PasswordComplexity.RequiredLength' then Value else null end) as RequiredLength
//            from AbpSettings
//            where Name in (
//                'Abp.Zero.UserManagement.PasswordComplexity.RequireDigit',
//                'Abp.Zero.UserManagement.PasswordComplexity.RequireLowercase',
//                'Abp.Zero.UserManagement.PasswordComplexity.RequireNonAlphanumeric',
//                'Abp.Zero.UserManagement.PasswordComplexity.RequireUppercase',
//                'Abp.Zero.UserManagement.PasswordComplexity.RequiredLength'
//            )
//        ) aps on coalesce(es.application_id, '00000000-0000-0000-0000-000000000000') = coalesce(aps.application_id, '00000000-0000-0000-0000-000000000000')
//            and coalesce(es.user_id, 0) = coalesce(aps.user_id, 0)
//        where aps.RequireDigit is not null
//            or aps.RequireLowercase is not null
//            or aps.RequireNonAlphanumeric is not null
//            or aps.RequireUppercase is not null
//            or aps.RequiredLength is not null
//    ) merged_data;

//    -- Update existing setting values
//    update sv
//    set value = replace(replace(njv.new_value, N',,', N','), N',}}', N'}}')
//    from frwk.setting_values sv
//    inner join #new_json_values njv on sv.id = njv.setting_value_id
//    where njv.setting_value_id is not null;

//    -- Insert new setting values where they don't exist
//    insert into frwk.setting_values (
//        id,
//        creation_time,
//        creator_user_id,
//        value,
//        application_id,
//        setting_configuration_id,
//        user_id
//    )
//    select
//        newid(),
//        getdate(),
//        null,
//        replace(replace(njv.new_value, N',,', N','), N',}}', N'}}'),
//        njv.application_id,
//        @settingConfigId,
//        njv.user_id
//    from #new_json_values njv
//    where njv.setting_value_id is null;

//    -- Clean up temp table
//    drop table #new_json_values;

//    -- Clean up old ABP password complexity settings
//    delete from AbpSettings
//    where Name in (
//        'Abp.Zero.UserManagement.PasswordComplexity.RequireDigit',
//        'Abp.Zero.UserManagement.PasswordComplexity.RequireLowercase',
//        'Abp.Zero.UserManagement.PasswordComplexity.RequireNonAlphanumeric',
//        'Abp.Zero.UserManagement.PasswordComplexity.RequireUppercase',
//        'Abp.Zero.UserManagement.PasswordComplexity.RequiredLength'
//    );
//end
//");

//            // PostgreSQL version
//            IfDatabase("PostgreSql").Execute.Sql($@"
//do $$
//declare
//    v_setting_config_id uuid;
//begin
//    -- Get the DefaultAuthenticationSettings configuration item ID
//    select id into v_setting_config_id
//    from frwk.configuration_items
//    where item_type = 'setting-configuration'
//        and name = 'Shesha.DefaultAuthenticationSettings'
//        and is_last = true;

//    -- Only proceed if the DefaultAuthenticationSettings configuration exists
//    if v_setting_config_id is not null then
//        -- Create a temporary table to hold the merged settings
//        create temp table if not exists temp_merged_settings as
//        with existing_settings as (
//            select
//                sv.application_id,
//                sv.user_id,
//                sv.value,
//                sv.id as setting_value_id
//            from frwk.setting_values sv
//            where sv.setting_configuration_id = v_setting_config_id
//        ),
//        abp_password_settings as (
//            select
//                null::uuid as application_id,
//                null::bigint as user_id,
//                max(case when ""Name"" = 'Abp.Zero.UserManagement.PasswordComplexity.RequireDigit' then ""Value"" else null end) as require_digit,
//                max(case when ""Name"" = 'Abp.Zero.UserManagement.PasswordComplexity.RequireLowercase' then ""Value"" else null end) as require_lowercase,
//                max(case when ""Name"" = 'Abp.Zero.UserManagement.PasswordComplexity.RequireNonAlphanumeric' then ""Value"" else null end) as require_non_alphanumeric,
//                max(case when ""Name"" = 'Abp.Zero.UserManagement.PasswordComplexity.RequireUppercase' then ""Value"" else null end) as require_uppercase,
//                max(case when ""Name"" = 'Abp.Zero.UserManagement.PasswordComplexity.RequiredLength' then ""Value"" else null end) as required_length
//            from ""AbpSettings""
//            where ""Name"" in (
//                'Abp.Zero.UserManagement.PasswordComplexity.RequireDigit',
//                'Abp.Zero.UserManagement.PasswordComplexity.RequireLowercase',
//                'Abp.Zero.UserManagement.PasswordComplexity.RequireNonAlphanumeric',
//                'Abp.Zero.UserManagement.PasswordComplexity.RequireUppercase',
//                'Abp.Zero.UserManagement.PasswordComplexity.RequiredLength'
//            )
//        )
//        select
//            coalesce(es.application_id, aps.application_id) as application_id,
//            coalesce(es.user_id, aps.user_id) as user_id,
//            es.value as existing_json,
//            aps.require_digit,
//            aps.require_lowercase,
//            aps.require_non_alphanumeric,
//            aps.require_uppercase,
//            aps.required_length,
//            es.setting_value_id,
//            case
//                when es.value is null then
//                    -- Create new JSON object with password complexity settings
//                    jsonb_strip_nulls(jsonb_build_object(
//                        'RequireDigit', case when aps.require_digit = 'true' then true when aps.require_digit = 'false' then false else null end,
//                        'RequireLowercase', case when aps.require_lowercase = 'true' then true when aps.require_lowercase = 'false' then false else null end,
//                        'RequireNonAlphanumeric', case when aps.require_non_alphanumeric = 'true' then true when aps.require_non_alphanumeric = 'false' then false else null end,
//                        'RequireUppercase', case when aps.require_uppercase = 'true' then true when aps.require_uppercase = 'false' then false else null end,
//                        'RequiredLength', case when aps.required_length ~ '^[0-9]+$' then aps.required_length::int else null end
//                    ))::text
//                else
//                    -- Merge with existing JSON
//                    (coalesce(es.value::jsonb, '{{}}')::jsonb ||
//                    jsonb_strip_nulls(jsonb_build_object(
//                        'RequireDigit', case when aps.require_digit = 'true' then true when aps.require_digit = 'false' then false else null end,
//                        'RequireLowercase', case when aps.require_lowercase = 'true' then true when aps.require_lowercase = 'false' then false else null end,
//                        'RequireNonAlphanumeric', case when aps.require_non_alphanumeric = 'true' then true when aps.require_non_alphanumeric = 'false' then false else null end,
//                        'RequireUppercase', case when aps.require_uppercase = 'true' then true when aps.require_uppercase = 'false' then false else null end,
//                        'RequiredLength', case when aps.required_length ~ '^[0-9]+$' then aps.required_length::int else null end
//                    )))::text
//            end as new_value
//        from existing_settings es
//        full outer join abp_password_settings aps
//            on coalesce(es.application_id, '00000000-0000-0000-0000-000000000000'::uuid) = coalesce(aps.application_id, '00000000-0000-0000-0000-000000000000'::uuid)
//            and coalesce(es.user_id, 0) = coalesce(aps.user_id, 0)
//        where aps.require_digit is not null
//            or aps.require_lowercase is not null
//            or aps.require_non_alphanumeric is not null
//            or aps.require_uppercase is not null
//            or aps.required_length is not null;

//        -- Update existing setting values
//        update frwk.setting_values sv
//        set value = tms.new_value
//        from temp_merged_settings tms
//        where sv.id = tms.setting_value_id
//            and tms.setting_value_id is not null;

//        -- Insert new setting values where they don't exist
//        insert into frwk.setting_values (
//            id,
//            creation_time,
//            creator_user_id,
//            value,
//            application_id,
//            setting_configuration_id,
//            user_id
//        )
//        select
//            gen_random_uuid(),
//            now(),
//            null,
//            tms.new_value,
//            tms.application_id,
//            v_setting_config_id,
//            tms.user_id
//        from temp_merged_settings tms
//        where tms.setting_value_id is null;

//        -- Clean up temporary table
//        drop table if exists temp_merged_settings;

//        -- Clean up old ABP password complexity settings
//        delete from ""AbpSettings""
//        where ""Name"" in (
//            'Abp.Zero.UserManagement.PasswordComplexity.RequireDigit',
//            'Abp.Zero.UserManagement.PasswordComplexity.RequireLowercase',
//            'Abp.Zero.UserManagement.PasswordComplexity.RequireNonAlphanumeric',
//            'Abp.Zero.UserManagement.PasswordComplexity.RequireUppercase',
//            'Abp.Zero.UserManagement.PasswordComplexity.RequiredLength'
//        );
//    end if;
//end $$;
//");
//        }
//    }
//}
