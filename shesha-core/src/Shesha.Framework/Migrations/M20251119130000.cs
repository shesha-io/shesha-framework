//using FluentMigrator;
//using Shesha.FluentMigrator;
//using System;

//namespace Shesha.Migrations
//{
//    /// <summary>
//    /// Migration to transform UserManagementSettings from old structure to new structure
//    /// and move authentication-related settings to DefaultAuthenticationSettings
//    /// </summary>
//    [Migration(20251119130000)]
//    public class M20251119130000 : OneWayMigration
//    {
//        public override void Up()
//        {
//            // Get the configuration item IDs for both settings
//            var getUserManagementConfigIdSql = @"
//                select top 1 id
//                from frwk.configuration_items
//                where [name] = 'user-management-settings'
//                order by last_modification_time desc";

//            var getDefaultAuthConfigIdSql = @"
//                select top 1 id
//                from frwk.configuration_items
//                where [name] = 'default-authentication-settings'
//                order by last_modification_time desc";

//            // SQL Server version
//            IfDatabase("SqlServer").Execute.Sql($@"
//declare @userMgmtConfigId uniqueidentifier;
//declare @defaultAuthConfigId uniqueidentifier;

//set @userMgmtConfigId = ({getUserManagementConfigIdSql});
//set @defaultAuthConfigId = ({getDefaultAuthConfigIdSql});

//-- Only proceed if both configuration items exist
//if @userMgmtConfigId is not null and @defaultAuthConfigId is not null
//begin
//    -- Process each existing UserManagementSettings value
//    declare @settingValueId uniqueidentifier;
//    declare @applicationId uniqueidentifier;
//    declare @userId bigint;
//    declare @oldValue nvarchar(max);
//    declare @newUserMgmtValue nvarchar(max);
//    declare @defaultAuthValue nvarchar(max);
//    declare @existingDefaultAuthValue nvarchar(max);

//    -- Cursor to iterate through all UserManagementSettings
//    declare settings_cursor cursor for
//        select id, application_id, user_id, value
//        from frwk.setting_values
//        where setting_configuration_id = @userMgmtConfigId;

//    open settings_cursor;

//    fetch next from settings_cursor into @settingValueId, @applicationId, @userId, @oldValue;

//    while @@FETCH_STATUS = 0
//    begin
//        -- Parse old JSON and build new JSON structures
//        -- Old structure properties to extract:
//        -- supportedRegistrationMethods -> moves to DefaultAuthentication.SupportedVerificationMethods
//        -- requireEmailVerification -> moves to DefaultAuthentication.RequireOtpVerification
//        -- goToUrlAfterRegistration -> removed (not in new structure)
//        -- userEmailAsUsername -> moves to DefaultAuthentication.UserEmailAsUsername
//        -- additionalRegistrationInfo -> stays in UserManagementSettings
//        -- additionalRegistrationInfoFormModule + additionalRegistrationInfoFormName
//        --   -> combines into additionalRegistrationInfoForm

//        -- Build new UserManagementSettings structure
//        set @newUserMgmtValue = N'{{' +
//            N'""allowSelfRegistration"":' +
//            case
//                when JSON_VALUE(@oldValue, '$.supportedRegistrationMethods') = '1' then N'false'
//                else N'true'
//            end + N',' +
//            N'""allowedEmailDomains"":"""",' +
//            N'""defaultRoles"":[],' +
//            N'""personEntityType"":null,' +
//            N'""creationMode"":""0"",' +
//            N'""additionalRegistrationInfo"":' +
//            coalesce(JSON_VALUE(@oldValue, '$.additionalRegistrationInfo'), N'false') +
//            case
//                when JSON_VALUE(@oldValue, '$.additionalRegistrationInfoFormModule') is not null
//                    and JSON_VALUE(@oldValue, '$.additionalRegistrationInfoFormName') is not null
//                then N',""additionalRegistrationInfoForm"":""' +
//                    JSON_VALUE(@oldValue, '$.additionalRegistrationInfoFormModule') + N':' +
//                    JSON_VALUE(@oldValue, '$.additionalRegistrationInfoFormName') + N'""'
//                else N''
//            end +
//            N'}}';

//        -- Get existing DefaultAuthentication value if it exists
//        select @existingDefaultAuthValue = value
//        from frwk.setting_values
//        where setting_configuration_id = @defaultAuthConfigId
//            and coalesce(application_id, '00000000-0000-0000-0000-000000000000') = coalesce(@applicationId, '00000000-0000-0000-0000-000000000000')
//            and coalesce(user_id, 0) = coalesce(@userId, 0);

//        -- Build/Update DefaultAuthenticationSettings with moved properties
//        if @existingDefaultAuthValue is null
//        begin
//            set @defaultAuthValue = N'{{}}';
//        end
//        else
//        begin
//            set @defaultAuthValue = @existingDefaultAuthValue;
//        end;

//        -- Add/update properties in DefaultAuthentication JSON
//        set @defaultAuthValue = JSON_MODIFY(@defaultAuthValue, '$.SupportedVerificationMethods',
//            JSON_VALUE(@oldValue, '$.supportedRegistrationMethods'));
//        set @defaultAuthValue = JSON_MODIFY(@defaultAuthValue, '$.RequireOtpVerification',
//            case when JSON_VALUE(@oldValue, '$.requireEmailVerification') = 'true' then cast(1 as bit) else cast(0 as bit) end);
//        set @defaultAuthValue = JSON_MODIFY(@defaultAuthValue, '$.UserEmailAsUsername',
//            case when JSON_VALUE(@oldValue, '$.userEmailAsUsername') = 'true' then cast(1 as bit) else cast(0 as bit) end);

//        -- Update UserManagementSettings with new structure
//        update frwk.setting_values
//        set value = @newUserMgmtValue
//        where id = @settingValueId;

//        -- Update or insert DefaultAuthenticationSettings
//        if @existingDefaultAuthValue is null
//        begin
//            insert into frwk.setting_values (
//                id,
//                creation_time,
//                creator_user_id,
//                value,
//                application_id,
//                setting_configuration_id,
//                user_id
//            )
//            values (
//                newid(),
//                getdate(),
//                null,
//                @defaultAuthValue,
//                @applicationId,
//                @defaultAuthConfigId,
//                @userId
//            );
//        end
//        else
//        begin
//            update frwk.setting_values
//            set value = @defaultAuthValue
//            where setting_configuration_id = @defaultAuthConfigId
//                and coalesce(application_id, '00000000-0000-0000-0000-000000000000') = coalesce(@applicationId, '00000000-0000-0000-0000-000000000000')
//                and coalesce(user_id, 0) = coalesce(@userId, 0);
//        end;

//        fetch next from settings_cursor into @settingValueId, @applicationId, @userId, @oldValue;
//    end;

//    close settings_cursor;
//    deallocate settings_cursor;
//end;
//");

//            // PostgreSQL version
//            IfDatabase("PostgreSql").Execute.Sql($@"
//do $$
//declare
//    v_user_mgmt_config_id uuid;
//    v_default_auth_config_id uuid;
//    v_setting_record record;
//    v_new_user_mgmt_value jsonb;
//    v_default_auth_value jsonb;
//    v_existing_default_auth_value jsonb;
//    v_supported_reg_methods text;
//    v_require_email_verification boolean;
//    v_user_email_as_username boolean;
//    v_additional_registration_info boolean;
//    v_form_module text;
//    v_form_name text;
//    v_allow_self_registration boolean;
//begin
//    -- Get the configuration item IDs
//    select id into v_user_mgmt_config_id
//    from frwk.configuration_items
//    where item_type = 'setting-configuration'
//        and name = 'Shesha.UserManagementSettings'
//        and is_last = true;

//    select id into v_default_auth_config_id
//    from frwk.configuration_items
//    where item_type = 'setting-configuration'
//        and name = 'Shesha.DefaultAuthenticationSettings'
//        and is_last = true;

//    -- Only proceed if both configuration items exist
//    if v_user_mgmt_config_id is not null and v_default_auth_config_id is not null then
//        -- Process each existing UserManagementSettings value
//        for v_setting_record in
//            select id, application_id, user_id, value::jsonb as old_value
//            from frwk.setting_values
//            where setting_configuration_id = v_user_mgmt_config_id
//        loop
//            -- Extract values from old structure
//            v_supported_reg_methods := v_setting_record.old_value->>'supportedRegistrationMethods';
//            v_require_email_verification := (v_setting_record.old_value->>'requireEmailVerification')::boolean;
//            v_user_email_as_username := (v_setting_record.old_value->>'userEmailAsUsername')::boolean;
//            v_additional_registration_info := coalesce((v_setting_record.old_value->>'additionalRegistrationInfo')::boolean, false);
//            v_form_module := v_setting_record.old_value->>'additionalRegistrationInfoFormModule';
//            v_form_name := v_setting_record.old_value->>'additionalRegistrationInfoFormName';

//            -- Determine allowSelfRegistration (false if supportedRegistrationMethods = 1, otherwise true)
//            v_allow_self_registration := coalesce(v_supported_reg_methods, '0') != '1';

//            -- Build new UserManagementSettings structure
//            v_new_user_mgmt_value := jsonb_build_object(
//                'allowSelfRegistration', v_allow_self_registration,
//                'allowedEmailDomains', '',
//                'defaultRoles', '[]'::jsonb,
//                'personEntityType', null,
//                'creationMode', '0',
//                'additionalRegistrationInfo', v_additional_registration_info
//            );

//            -- Add additionalRegistrationInfoForm if both module and form name exist
//            if v_form_module is not null and v_form_name is not null then
//                v_new_user_mgmt_value := v_new_user_mgmt_value ||
//                    jsonb_build_object('additionalRegistrationInfoForm', v_form_module || ':' || v_form_name);
//            end if;

//            -- Get existing DefaultAuthentication value if it exists
//            select value::jsonb into v_existing_default_auth_value
//            from frwk.setting_values
//            where setting_configuration_id = v_default_auth_config_id
//                and coalesce(application_id, '00000000-0000-0000-0000-000000000000'::uuid) =
//                    coalesce(v_setting_record.application_id, '00000000-0000-0000-0000-000000000000'::uuid)
//                and coalesce(user_id, 0) = coalesce(v_setting_record.user_id, 0);

//            -- Build/Update DefaultAuthenticationSettings with moved properties
//            if v_existing_default_auth_value is null then
//                v_default_auth_value := jsonb_build_object();
//            else
//                v_default_auth_value := v_existing_default_auth_value;
//            end if;

//            -- Add/update properties in DefaultAuthentication JSON
//            v_default_auth_value := v_default_auth_value || jsonb_build_object(
//                'SupportedVerificationMethods', case when v_supported_reg_methods ~ '^[0-9]+$' then v_supported_reg_methods::int else null end,
//                'RequireOtpVerification', coalesce(v_require_email_verification, false),
//                'UserEmailAsUsername', coalesce(v_user_email_as_username, false)
//            );

//            -- Update UserManagementSettings with new structure
//            update frwk.setting_values
//            set value = v_new_user_mgmt_value::text
//            where id = v_setting_record.id;

//            -- Update or insert DefaultAuthenticationSettings
//            if v_existing_default_auth_value is null then
//                insert into frwk.setting_values (
//                    id,
//                    creation_time,
//                    creator_user_id,
//                    value,
//                    application_id,
//                    setting_configuration_id,
//                    user_id
//                )
//                values (
//                    gen_random_uuid(),
//                    now(),
//                    null,
//                    v_default_auth_value::text,
//                    v_setting_record.application_id,
//                    v_default_auth_config_id,
//                    v_setting_record.user_id
//                );
//            else
//                update frwk.setting_values
//                set value = v_default_auth_value::text
//                where setting_configuration_id = v_default_auth_config_id
//                    and coalesce(application_id, '00000000-0000-0000-0000-000000000000'::uuid) =
//                        coalesce(v_setting_record.application_id, '00000000-0000-0000-0000-000000000000'::uuid)
//                    and coalesce(user_id, 0) = coalesce(v_setting_record.user_id, 0);
//            end if;
//        end loop;
//    end if;
//end $$;
//");
//        }
//    }
//}
