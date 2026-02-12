using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20251215130900)]
    public class M20251215130900 : OneWayMigration
    {
        public override void Up()
        {
            // ===========================
            // SQL Server migration
            // ===========================
            IfDatabase("SqlServer").Execute.Sql(@"
            -- ============================================================================
            -- Step 1: Update OTP settings and merge with Authentication settings FIRST
            -- (This must run before UserManagement/Security transformations to preserve original fields)
            -- ============================================================================
            DECLARE @OldOtpValue NVARCHAR(MAX);
            DECLARE @OldOtpId UNIQUEIDENTIFIER;
            DECLARE @OtpApplicationId UNIQUEIDENTIFIER;
            DECLARE @OtpUserId BIGINT;
            DECLARE @ContextUserManagementValue NVARCHAR(MAX);
            DECLARE @ContextSecurityValue NVARCHAR(MAX);

            -- Declare a cursor to iterate through all matching OTP setting values
            DECLARE otp_cursor CURSOR FOR
            SELECT
                sv.Id,
                sv.Value,
                sv.application_id,
                sv.user_id
            FROM
                [frwk].[setting_values] sv
                INNER JOIN [frwk].[setting_configurations] sc ON sv.setting_configuration_id = sc.Id
                INNER JOIN [frwk].[configuration_items] ci ON sc.Id = ci.Id
            WHERE
                ci.item_type = 'setting-configuration'
                AND (
                    ci.Name LIKE '%Otp%'
                    OR ci.Name LIKE '%OneTimePin%'
                    OR sv.Value LIKE '%passwordLength%'
                    OR sv.Value LIKE '%alphabet%'
                )
                AND sv.Value IS NOT NULL
                AND ISJSON(sv.Value) = 1;

            OPEN otp_cursor;
            FETCH NEXT FROM otp_cursor INTO @OldOtpId, @OldOtpValue, @OtpApplicationId, @OtpUserId;

            WHILE @@FETCH_STATUS = 0
            BEGIN
              -- Fetch corresponding User Management value for this context (matching application_id/user_id)
              SELECT @ContextUserManagementValue = sv.Value
              FROM [frwk].[setting_values] sv
                  INNER JOIN [frwk].[setting_configurations] sc ON sv.setting_configuration_id = sc.Id
                  INNER JOIN [frwk].[configuration_items] ci ON sc.Id = ci.Id
              WHERE ci.item_type = 'setting-configuration'
                  AND ci.Name = 'Shesha.UserManagement'
                  AND sv.Value IS NOT NULL
                  AND ISJSON(sv.Value) = 1
                  AND ((@OtpApplicationId IS NULL AND sv.application_id IS NULL) OR sv.application_id = @OtpApplicationId)
                  AND ((@OtpUserId IS NULL AND sv.user_id IS NULL) OR sv.user_id = @OtpUserId);

              -- Fetch corresponding Security value for this context (matching application_id/user_id)
              SELECT @ContextSecurityValue = sv.Value
              FROM [frwk].[setting_values] sv
                  INNER JOIN [frwk].[setting_configurations] sc ON sv.setting_configuration_id = sc.Id
                  INNER JOIN [frwk].[configuration_items] ci ON sc.Id = ci.Id
              WHERE ci.item_type = 'setting-configuration'
                  AND ci.Name = 'Shesha.Security'
                  AND sv.Value IS NOT NULL
                  AND ISJSON(sv.Value) = 1
                  AND ((@OtpApplicationId IS NULL AND sv.application_id IS NULL) OR sv.application_id = @OtpApplicationId)
                  AND ((@OtpUserId IS NULL AND sv.user_id IS NULL) OR sv.user_id = @OtpUserId);

              -- Now combine OTP and any other auth settings into DefaultAuthenticationSettings
              DECLARE @NewDefaultAuthValue NVARCHAR(MAX);

              -- Extract OTP values
              DECLARE @PasswordLength INT = CASE WHEN @OldOtpValue IS NOT NULL THEN CAST(JSON_VALUE(@OldOtpValue, '$.passwordLength') AS INT) ELSE NULL END;
              DECLARE @Alphabet NVARCHAR(100) = CASE WHEN @OldOtpValue IS NOT NULL THEN JSON_VALUE(@OldOtpValue, '$.alphabet') ELSE NULL END;
              DECLARE @DefaultLifetime INT = CASE WHEN @OldOtpValue IS NOT NULL THEN CAST(JSON_VALUE(@OldOtpValue, '$.defaultLifetime') AS INT) ELSE NULL END;
              DECLARE @IgnoreOtpValidation BIT = CASE WHEN @OldOtpValue IS NOT NULL THEN CAST(JSON_VALUE(@OldOtpValue, '$.ignoreOtpValidation') AS BIT) ELSE NULL END;
              DECLARE @DefaultSubjectTemplate NVARCHAR(500) = CASE WHEN @OldOtpValue IS NOT NULL THEN JSON_VALUE(@OldOtpValue, '$.defaultSubjectTemplate') ELSE NULL END;
              DECLARE @DefaultBodyTemplate NVARCHAR(MAX) = CASE WHEN @OldOtpValue IS NOT NULL THEN JSON_VALUE(@OldOtpValue, '$.defaultBodyTemplate') ELSE NULL END;
              DECLARE @DefaultEmailSubjectTemplate NVARCHAR(500) = CASE WHEN @OldOtpValue IS NOT NULL THEN JSON_VALUE(@OldOtpValue, '$.defaultEmailSubjectTemplate') ELSE NULL END;
              DECLARE @DefaultEmailBodyTemplate NVARCHAR(MAX) = CASE WHEN @OldOtpValue IS NOT NULL THEN JSON_VALUE(@OldOtpValue, '$.defaultEmailBodyTemplate') ELSE NULL END;

              -- Extract User Management values that go into DefaultAuth (from context-specific value)
              DECLARE @RequireEmailVerification BIT = CASE WHEN @ContextUserManagementValue IS NOT NULL THEN CAST(JSON_VALUE(@ContextUserManagementValue, '$.requireEmailVerification') AS BIT) ELSE NULL END;
              DECLARE @UserEmailAsUsername BIT = CASE WHEN @ContextUserManagementValue IS NOT NULL THEN CAST(JSON_VALUE(@ContextUserManagementValue, '$.userEmailAsUsername') AS BIT) ELSE NULL END;
              DECLARE @SupportedRegistrationMethods INT = CASE WHEN @ContextUserManagementValue IS NOT NULL THEN CAST(JSON_VALUE(@ContextUserManagementValue, '$.supportedRegistrationMethods') AS INT) ELSE NULL END;

              -- Extract Security values that go into DefaultAuth (from context-specific value)
              DECLARE @ContextAutoLogoffTimeout INT = CASE WHEN @ContextSecurityValue IS NOT NULL THEN CAST(JSON_VALUE(@ContextSecurityValue, '$.autoLogoffTimeout') AS INT) ELSE NULL END;
              DECLARE @ContextUseResetPasswordViaEmailLink BIT = CASE WHEN @ContextSecurityValue IS NOT NULL THEN CAST(JSON_VALUE(@ContextSecurityValue, '$.useResetPasswordViaEmailLink') AS BIT) ELSE NULL END;
              DECLARE @ContextResetPasswordEmailLinkLifetime INT = CASE WHEN @ContextSecurityValue IS NOT NULL THEN CAST(JSON_VALUE(@ContextSecurityValue, '$.resetPasswordEmailLinkLifetime') AS INT) ELSE NULL END;
              DECLARE @ContextUseResetPasswordViaSmsOtp BIT = CASE WHEN @ContextSecurityValue IS NOT NULL THEN CAST(JSON_VALUE(@ContextSecurityValue, '$.useResetPasswordViaSmsOtp') AS BIT) ELSE NULL END;
              DECLARE @ContextResetPasswordSmsOtpLifetime INT = CASE WHEN @ContextSecurityValue IS NOT NULL THEN CAST(JSON_VALUE(@ContextSecurityValue, '$.resetPasswordSmsOtpLifetime') AS INT) ELSE NULL END;
              DECLARE @ContextUseResetPasswordViaSecurityQuestions BIT = CASE WHEN @ContextSecurityValue IS NOT NULL THEN CAST(JSON_VALUE(@ContextSecurityValue, '$.useResetPasswordViaSecurityQuestions') AS BIT) ELSE NULL END;
              DECLARE @ContextResetPasswordViaSecurityQuestionsNumQuestionsAllowed INT = CASE WHEN @ContextSecurityValue IS NOT NULL THEN CAST(JSON_VALUE(@ContextSecurityValue, '$.resetPasswordViaSecurityQuestionsNumQuestionsAllowed') AS INT) ELSE NULL END;

              SET @NewDefaultAuthValue = (
                  SELECT
                      -- From old user management
                      ISNULL(@RequireEmailVerification, 0) AS requireOtpVerification,
                      CAST(1 AS BIT) AS allowLocalUsernamePasswordAuth,
                      CAST(1 AS BIT) AS useDefaultRegistrationForm,
                      ISNULL(@UserEmailAsUsername, 1) AS userEmailAsUsername,
                      @SupportedRegistrationMethods AS supportedVerificationMethods,

                      -- From old security settings (context-specific)
                      ISNULL(@ContextUseResetPasswordViaEmailLink, 1) AS useResetPasswordViaEmailLink,
                      ISNULL(@ContextResetPasswordEmailLinkLifetime, 360) AS resetPasswordEmailLinkLifetime,
                      ISNULL(@ContextUseResetPasswordViaSmsOtp, 1) AS useResetPasswordViaSmsOtp,
                      ISNULL(@ContextResetPasswordSmsOtpLifetime, 180) AS resetPasswordSmsOtpLifetime,
                      ISNULL(@ContextUseResetPasswordViaSecurityQuestions, 0) AS useResetPasswordViaSecurityQuestions,
                      ISNULL(@ContextResetPasswordViaSecurityQuestionsNumQuestionsAllowed, 0) AS resetPasswordViaSecurityQuestionsNumQuestionsAllowed,

                      -- From old OTP settings
                      ISNULL(@PasswordLength, 6) AS passwordLength,
                      ISNULL(@Alphabet, '0123456789') AS alphabet,
                      ISNULL(@DefaultLifetime, 360) AS defaultLifetime,
                      ISNULL(@IgnoreOtpValidation, 0) AS ignoreOtpValidation,
                      ISNULL(@DefaultSubjectTemplate, 'One-Time-Pin') AS defaultSubjectTemplate,
                      ISNULL(@DefaultBodyTemplate, 'Your One-Time-Pin is {{password}}') AS defaultBodyTemplate,
                      ISNULL(@DefaultEmailSubjectTemplate, 'One-Time-Pin') AS defaultEmailSubjectTemplate,
                      ISNULL(@DefaultEmailBodyTemplate, '') AS defaultEmailBodyTemplate,

                      -- Password Complexity (defaults - not in old structure)
                      CAST(0 AS BIT) AS requireDigit,
                      CAST(0 AS BIT) AS requireLowercase,
                      CAST(0 AS BIT) AS requireNonAlphanumeric,
                      CAST(0 AS BIT) AS requireUppercase,
                      6 AS requiredLength,

                      -- User Lockout (defaults - not in old structure)
                      CAST(0 AS BIT) AS userLockOutEnabled,
                      5 AS maxFailedAccessAttemptsBeforeLockout,
                      300 AS defaultAccountLockoutSeconds
                  FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
              );

              -- Find or create DefaultAuthenticationSettings
              DECLARE @DefaultAuthSettingsId UNIQUEIDENTIFIER;
              DECLARE @DefaultAuthSettingsConfigId UNIQUEIDENTIFIER;

              SELECT @DefaultAuthSettingsConfigId = ci.Id
              FROM [frwk].[configuration_items] ci
              WHERE ci.item_type = 'setting-configuration'
                AND ci.Name = 'Shesha.DefaultAuthentication';

              IF @DefaultAuthSettingsConfigId IS NOT NULL
              BEGIN
                  -- Find existing setting value for this specific context (application_id/user_id)
                  SELECT @DefaultAuthSettingsId = Id
                  FROM [frwk].[setting_values]
                  WHERE setting_configuration_id = @DefaultAuthSettingsConfigId
                      AND ((@OtpApplicationId IS NULL AND application_id IS NULL) OR application_id = @OtpApplicationId)
                      AND ((@OtpUserId IS NULL AND user_id IS NULL) OR user_id = @OtpUserId);

                  IF @DefaultAuthSettingsId IS NOT NULL
                  BEGIN
                      -- Update existing
                      UPDATE [frwk].[setting_values]
                      SET Value = @NewDefaultAuthValue,
                          last_modification_time = GETUTCDATE()
                      WHERE Id = @DefaultAuthSettingsId;
                  END
                  ELSE
                  BEGIN
                      -- Insert new with matching application_id/user_id context
                      INSERT INTO [frwk].[setting_values] (Id, setting_configuration_id, application_id, user_id, Value, creation_time)
                      VALUES (NEWID(), @DefaultAuthSettingsConfigId, @OtpApplicationId, @OtpUserId, @NewDefaultAuthValue, GETUTCDATE());
                  END
              END

                -- Reset context variables for next iteration
                SET @ContextUserManagementValue = NULL;
                SET @ContextSecurityValue = NULL;

                FETCH NEXT FROM otp_cursor INTO @OldOtpId, @OldOtpValue, @OtpApplicationId, @OtpUserId;
            END

            CLOSE otp_cursor;
            DEALLOCATE otp_cursor;

            -- ============================================================================
            -- Step 2: Update User Management settings to new structure
            -- ============================================================================
            DECLARE @OldUserManagementValue NVARCHAR(MAX);
            DECLARE @OldUserManagementId UNIQUEIDENTIFIER;

            -- Declare a cursor to iterate through all matching User Management setting values
            DECLARE user_mgmt_cursor CURSOR FOR
            SELECT
                sv.Id,
                sv.Value
            FROM
                [frwk].[setting_values] sv
                INNER JOIN [frwk].[setting_configurations] sc ON sv.setting_configuration_id = sc.Id
                INNER JOIN [frwk].[configuration_items] ci ON sc.Id = ci.Id
            WHERE
                ci.item_type = 'setting-configuration'
                AND ci.Name = 'Shesha.UserManagement'
                AND sv.Value IS NOT NULL
                AND ISJSON(sv.Value) = 1;  -- Ensure it's valid JSON

            OPEN user_mgmt_cursor;
            FETCH NEXT FROM user_mgmt_cursor INTO @OldUserManagementId, @OldUserManagementValue;

            WHILE @@FETCH_STATUS = 0
            BEGIN
                -- Parse and transform to new structure
                DECLARE @NewUserManagementValue NVARCHAR(MAX);

                -- Extract individual values first for easier debugging
                DECLARE @AdditionalRegistrationInfo BIT = CAST(JSON_VALUE(@OldUserManagementValue, '$.additionalRegistrationInfo') AS BIT);
                DECLARE @AdditionalRegistrationInfoFormModule NVARCHAR(200) = JSON_VALUE(@OldUserManagementValue, '$.additionalRegistrationInfoFormModule');
                DECLARE @AdditionalRegistrationInfoFormName NVARCHAR(200) = JSON_VALUE(@OldUserManagementValue, '$.additionalRegistrationInfoFormName');
                DECLARE @CreationMode INT = CAST(JSON_VALUE(@OldUserManagementValue, '$.creationMode') AS INT);
                DECLARE @DefaultRoles NVARCHAR(MAX) = JSON_QUERY(@OldUserManagementValue, '$.defaultRoles');
                DECLARE @PersonEntityType NVARCHAR(200) = JSON_VALUE(@OldUserManagementValue, '$.personEntityType');

                -- Build the new JSON structure
                SET @NewUserManagementValue = (
                    SELECT
                        ISNULL(@AdditionalRegistrationInfo, 0) AS additionalRegistrationInfo,
                        @AdditionalRegistrationInfoFormModule AS 'additionalRegistrationInfoForm._module',
                        @AdditionalRegistrationInfoFormName AS 'additionalRegistrationInfoForm._name',
                        'form-configuration' AS 'additionalRegistrationInfoForm._className',
                        CAST(1 AS BIT) AS allowSelfRegistration,
                        '' AS allowedEmailDomains,
                        ISNULL(@CreationMode, 0) AS creationMode,
                        JSON_QUERY(ISNULL(@DefaultRoles, '[]')) AS defaultRoles,
                        @PersonEntityType AS 'personEntityType._className'
                    FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
                );

                -- Update the value
                UPDATE [frwk].[setting_values]
                SET Value = @NewUserManagementValue,
                    last_modification_time = GETUTCDATE()
                WHERE Id = @OldUserManagementId;

                FETCH NEXT FROM user_mgmt_cursor INTO @OldUserManagementId, @OldUserManagementValue;
            END

            CLOSE user_mgmt_cursor;
            DEALLOCATE user_mgmt_cursor;

            -- ============================================================================
            -- Step 3: Update Security settings to new structure
            -- ============================================================================
            DECLARE @OldSecurityValue NVARCHAR(MAX);
            DECLARE @OldSecurityId UNIQUEIDENTIFIER;
            DECLARE @AutoLogoffTimeout INT;

            -- Declare a cursor to iterate through all matching Security setting values
            DECLARE security_cursor CURSOR FOR
                  SELECT
                      sv.Id,
                      sv.Value
                  FROM
                      [frwk].[setting_values] sv
                      INNER JOIN [frwk].[setting_configurations] sc ON sv.setting_configuration_id = sc.Id
                      INNER JOIN [frwk].[configuration_items] ci ON sc.Id = ci.Id
                  WHERE
                      ci.item_type = 'setting-configuration'
                      AND ci.Name = 'Shesha.Security'
                      AND sv.Value IS NOT NULL
                      AND ISJSON(sv.Value) = 1;

                  OPEN security_cursor;
                  FETCH NEXT FROM security_cursor INTO @OldSecurityId, @OldSecurityValue;

                  WHILE @@FETCH_STATUS = 0
                  BEGIN
                      -- Extract values
                      SET @AutoLogoffTimeout = CAST(JSON_VALUE(@OldSecurityValue, '$.autoLogoffTimeout') AS INT);

                      -- Transform to GeneralFrontendSecuritySettings
                      DECLARE @NewGeneralSecurityValue NVARCHAR(MAX);
                  
                      SET @NewGeneralSecurityValue = (
                          SELECT
                              CASE WHEN ISNULL(@AutoLogoffTimeout, 0) > 0 THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS autoLogoffAfterInactivity,
                              ISNULL(@AutoLogoffTimeout, 0) AS autoLogoffTimeout
                          FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
                      );
                  
                      -- Update the value
                      UPDATE [frwk].[setting_values]
                      SET Value = @NewGeneralSecurityValue,
                          last_modification_time = GETUTCDATE()
                      WHERE Id = @OldSecurityId;

                      FETCH NEXT FROM security_cursor INTO @OldSecurityId, @OldSecurityValue;
                  END

                  CLOSE security_cursor;
                  DEALLOCATE security_cursor;
            ");
            
            // ===========================
            // PostgreSQL migration
            // ===========================
            IfDatabase("PostgreSql").Execute.Sql(@"
            -- ============================================================================
            -- Migration Script: Update Authentication Settings to New Structure (PostgreSQL)
            -- Description: Transforms existing JSON objects in setting values to match
            --              the new consolidated structure
            -- ============================================================================
            
            DO $$
            DECLARE
                v_user_mgmt_record RECORD;
                v_security_record RECORD;
                v_otp_record RECORD;
                v_new_user_mgmt_value JSONB;
                v_new_general_security_value JSONB;
                v_new_default_auth_value JSONB;
                v_default_auth_settings_config_id UUID;
                v_default_auth_settings_id UUID;
                v_auto_logoff_timeout INTEGER;
                v_context_user_mgmt_value JSONB;
                v_context_security_value JSONB;

            BEGIN
                -- ============================================================================
                -- Step 1: Find and process OTP settings FIRST
                -- (This must run before UserManagement/Security transformations to preserve original fields)
                -- ============================================================================

                -- Iterate through all OTP settings
                FOR v_otp_record IN
                    SELECT
                        sv.id,
                        sv.""value""::JSONB as value,
                        sv.application_id,
                        sv.user_id
                    FROM
                        frwk.setting_values sv
                        INNER JOIN frwk.setting_configurations sc ON sv.setting_configuration_id = sc.id
                        INNER JOIN frwk.configuration_items ci ON sc.id = ci.id
                    WHERE
                        ci.item_type = 'setting-configuration'
                        AND (
                            ci.""name"" LIKE '%Otp%'
                            OR ci.""name"" LIKE '%OneTimePin%'
                            OR sv.""value""::TEXT LIKE '%passwordLength%'
                            OR sv.""value""::TEXT LIKE '%alphabet%'
                        )
                        AND sv.""value"" IS NOT NULL
                LOOP
                    -- Fetch corresponding User Management value for this context (matching application_id/user_id)
                    SELECT sv.""value""::JSONB
                    INTO v_context_user_mgmt_value
                    FROM frwk.setting_values sv
                        INNER JOIN frwk.setting_configurations sc ON sv.setting_configuration_id = sc.id
                        INNER JOIN frwk.configuration_items ci ON sc.id = ci.id
                    WHERE ci.item_type = 'setting-configuration'
                        AND ci.""name"" = 'Shesha.UserManagement'
                        AND sv.""value"" IS NOT NULL
                        AND ((v_otp_record.application_id IS NULL AND sv.application_id IS NULL) OR sv.application_id = v_otp_record.application_id)
                        AND ((v_otp_record.user_id IS NULL AND sv.user_id IS NULL) OR sv.user_id = v_otp_record.user_id)
                    LIMIT 1;

                    -- Fetch corresponding Security value for this context (matching application_id/user_id)
                    SELECT sv.""value""::JSONB
                    INTO v_context_security_value
                    FROM frwk.setting_values sv
                        INNER JOIN frwk.setting_configurations sc ON sv.setting_configuration_id = sc.id
                        INNER JOIN frwk.configuration_items ci ON sc.id = ci.id
                    WHERE ci.item_type = 'setting-configuration'
                        AND ci.""name"" = 'Shesha.Security'
                        AND sv.""value"" IS NOT NULL
                        AND ((v_otp_record.application_id IS NULL AND sv.application_id IS NULL) OR sv.application_id = v_otp_record.application_id)
                        AND ((v_otp_record.user_id IS NULL AND sv.user_id IS NULL) OR sv.user_id = v_otp_record.user_id)
                    LIMIT 1;

                    -- ============================================================================
                    -- Step 4: Combine all into DefaultAuthenticationSettings
                    -- ============================================================================
                    v_new_default_auth_value := jsonb_build_object(
                        -- From old user management (context-specific)
                        'requireOtpVerification', COALESCE((v_context_user_mgmt_value->>'requireEmailVerification')::BOOLEAN, FALSE),
                        'allowLocalUsernamePasswordAuth', TRUE,
                        'useDefaultRegistrationForm', TRUE,
                        'userEmailAsUsername', COALESCE((v_context_user_mgmt_value->>'userEmailAsUsername')::BOOLEAN, TRUE),
                        'supportedVerificationMethods', (v_context_user_mgmt_value->>'supportedRegistrationMethods')::INTEGER,

                        -- From old security settings (context-specific)
                        'useResetPasswordViaEmailLink', COALESCE((v_context_security_value->>'useResetPasswordViaEmailLink')::BOOLEAN, TRUE),
                        'resetPasswordEmailLinkLifetime', COALESCE((v_context_security_value->>'resetPasswordEmailLinkLifetime')::INTEGER, 360),
                        'useResetPasswordViaSmsOtp', COALESCE((v_context_security_value->>'useResetPasswordViaSmsOtp')::BOOLEAN, TRUE),
                        'resetPasswordSmsOtpLifetime', COALESCE((v_context_security_value->>'resetPasswordSmsOtpLifetime')::INTEGER, 180),
                        'useResetPasswordViaSecurityQuestions', COALESCE((v_context_security_value->>'useResetPasswordViaSecurityQuestions')::BOOLEAN, FALSE),
                        'resetPasswordViaSecurityQuestionsNumQuestionsAllowed', COALESCE((v_context_security_value->>'resetPasswordViaSecurityQuestionsNumQuestionsAllowed')::INTEGER, 0),

                        -- From old OTP settings
                        'passwordLength', COALESCE((v_otp_record.value->>'passwordLength')::INTEGER, 6),
                        'alphabet', COALESCE(v_otp_record.value->>'alphabet', '0123456789'),
                        'defaultLifetime', COALESCE((v_otp_record.value->>'defaultLifetime')::INTEGER, 360),
                        'ignoreOtpValidation', COALESCE((v_otp_record.value->>'ignoreOtpValidation')::BOOLEAN, FALSE),
                        'defaultSubjectTemplate', COALESCE(v_otp_record.value->>'defaultSubjectTemplate', 'One-Time-Pin'),
                        'defaultBodyTemplate', COALESCE(v_otp_record.value->>'defaultBodyTemplate', 'Your One-Time-Pin is {{password}}'),
                        'defaultEmailSubjectTemplate', COALESCE(v_otp_record.value->>'defaultEmailSubjectTemplate', 'One-Time-Pin'),
                        'defaultEmailBodyTemplate', COALESCE(v_otp_record.value->>'defaultEmailBodyTemplate', ''),

                        -- Password Complexity (defaults - not in old structure)
                        'requireDigit', FALSE,
                        'requireLowercase', FALSE,
                        'requireNonAlphanumeric', FALSE,
                        'requireUppercase', FALSE,
                        'requiredLength', 6,

                        -- User Lockout (defaults - not in old structure)
                        'userLockOutEnabled', FALSE,
                        'maxFailedAccessAttemptsBeforeLockout', 5,
                        'defaultAccountLockoutSeconds', 300
                    );
            
                    -- Find or create DefaultAuthenticationSettings
                    SELECT ci.id INTO v_default_auth_settings_config_id
                    FROM frwk.configuration_items ci
                    WHERE ci.item_type = 'setting-configuration'
                      AND ci.""name"" = 'Shesha.DefaultAuthentication'
                    LIMIT 1;

                    IF v_default_auth_settings_config_id IS NOT NULL THEN
                        -- Find existing setting value for this specific context (application_id/user_id)
                        SELECT id INTO v_default_auth_settings_id
                        FROM frwk.setting_values
                        WHERE setting_configuration_id = v_default_auth_settings_config_id
                            AND ((v_otp_record.application_id IS NULL AND application_id IS NULL) OR application_id = v_otp_record.application_id)
                            AND ((v_otp_record.user_id IS NULL AND user_id IS NULL) OR user_id = v_otp_record.user_id)
                        LIMIT 1;

                        IF v_default_auth_settings_id IS NOT NULL THEN
                            -- Update existing
                            UPDATE frwk.setting_values
                            SET ""value"" = v_new_default_auth_value::TEXT,
                                last_modification_time = NOW()
                            WHERE id = v_default_auth_settings_id;

                        ELSE
                            -- Insert new with matching application_id/user_id context
                            INSERT INTO frwk.setting_values (id, setting_configuration_id, application_id, user_id, ""value"", creation_time)
                            VALUES (gen_random_uuid(), v_default_auth_settings_config_id, v_otp_record.application_id, v_otp_record.user_id, v_new_default_auth_value::TEXT, NOW());

                        END IF;
                    END IF;

                    -- Reset context variables for next iteration
                    v_context_user_mgmt_value := NULL;
                    v_context_security_value := NULL;

                END LOOP;

                -- ============================================================================
                -- Step 2: Find and update User Management settings
                -- ============================================================================

                -- Iterate through all User Management settings
                FOR v_user_mgmt_record IN
                    SELECT
                        sv.id,
                        sv.""value""::JSONB as value
                    FROM
                        frwk.setting_values sv
                        INNER JOIN frwk.setting_configurations sc ON sv.setting_configuration_id = sc.id
                        INNER JOIN frwk.configuration_items ci ON sc.id = ci.id
                    WHERE
                        ci.item_type = 'setting-configuration'
                        AND ci.""name"" = 'Shesha.UserManagement'
                        AND sv.""value"" IS NOT NULL
                LOOP
                    -- Transform to new structure
                    v_new_user_mgmt_value := jsonb_build_object(
                        'additionalRegistrationInfo', COALESCE((v_user_mgmt_record.value->>'additionalRegistrationInfo')::BOOLEAN, FALSE),
                        'additionalRegistrationInfoForm', jsonb_build_object(
                            '_module', v_user_mgmt_record.value->>'additionalRegistrationInfoFormModule',
                            '_name', v_user_mgmt_record.value->>'additionalRegistrationInfoFormName',
                            '_className', 'form-configuration'
                        ),
                        'allowSelfRegistration', TRUE,
                        'allowedEmailDomains', '',
                        'creationMode', COALESCE((v_user_mgmt_record.value->>'creationMode')::INTEGER, 0),
                        'defaultRoles', COALESCE(v_user_mgmt_record.value->'defaultRoles', '[]'::JSONB),
                        'personEntityType', jsonb_build_object(
                            '_className', v_user_mgmt_record.value->>'personEntityType'
                        )
                    );

                    -- Update the value
                    UPDATE frwk.setting_values
                    SET ""value"" = v_new_user_mgmt_value::TEXT,
                        last_modification_time = NOW()
                    WHERE id = v_user_mgmt_record.id;

                END LOOP;

                -- ============================================================================
                -- Step 3: Find and update Security settings
                -- ============================================================================

                -- Iterate through all Security settings
                FOR v_security_record IN
                    SELECT
                        sv.id,
                        sv.""value""::JSONB as value
                    FROM
                        frwk.setting_values sv
                        INNER JOIN frwk.setting_configurations sc ON sv.setting_configuration_id = sc.id
                        INNER JOIN frwk.configuration_items ci ON sc.id = ci.id
                    WHERE
                        ci.item_type = 'setting-configuration'
                        AND ci.""name"" = 'Shesha.Security'
                        AND sv.""value"" IS NOT NULL
                LOOP
                    v_auto_logoff_timeout := COALESCE((v_security_record.value->>'autoLogoffTimeout')::INTEGER, 0);

                    -- Transform to GeneralFrontendSecuritySettings
                    v_new_general_security_value := jsonb_build_object(
                        'autoLogoffAfterInactivity', v_auto_logoff_timeout > 0,
                        'autoLogoffTimeout', v_auto_logoff_timeout
                    );

                    -- Update the value
                    UPDATE frwk.setting_values
                    SET ""value"" = v_new_general_security_value::TEXT,
                        last_modification_time = NOW()
                    WHERE id = v_security_record.id;
                END LOOP;
            END $$;

        ");
        }
    }
}
