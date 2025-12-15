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
            -- Update User Management settings to new structure
                  DECLARE @OldUserManagementValue NVARCHAR(MAX);
                  DECLARE @OldUserManagementId UNIQUEIDENTIFIER;
                  
                  -- Find the old User Management setting
                  SELECT TOP 1
                      @OldUserManagementId = sv.Id,
                      @OldUserManagementValue = sv.Value
                  FROM
                      [frwk].[setting_values] sv
                      INNER JOIN [frwk].[setting_configurations] sc ON sv.setting_configuration_id = sc.Id
                      INNER JOIN [frwk].[configuration_items] ci ON sc.Id = ci.Id
                  WHERE
                      ci.item_type = 'setting-configuration'
                      AND ci.Name = 'Shesha.UserManagement'
                      AND sv.Value IS NOT NULL
                      AND ISJSON(sv.Value) = 1;  -- Ensure it's valid JSON
                  
                  IF @OldUserManagementValue IS NOT NULL AND ISJSON(@OldUserManagementValue) = 1
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
                  END
                  
                  -- ============================================================================
                  -- Step 2: Update Security settings to new structure
                  -- ============================================================================
                  DECLARE @OldSecurityValue NVARCHAR(MAX);
                  DECLARE @OldSecurityId UNIQUEIDENTIFIER;
                  
                  -- Find the old Security setting
                  SELECT TOP 1
                      @OldSecurityId = sv.Id,
                      @OldSecurityValue = sv.Value
                  FROM
                      [frwk].[setting_values] sv
                      INNER JOIN [frwk].[setting_configurations] sc ON sv.setting_configuration_id = sc.Id
                      INNER JOIN [frwk].[configuration_items] ci ON sc.Id = ci.Id
                  WHERE
                      ci.item_type = 'setting-configuration'
                      ci.Name = 'Shesha.Security'
                      AND sv.Value IS NOT NULL
                      AND ISJSON(sv.Value) = 1;
                  
                  IF @OldSecurityValue IS NOT NULL AND ISJSON(@OldSecurityValue) = 1
                  BEGIN
                      -- Extract values
                      DECLARE @AutoLogoffTimeout INT = CAST(JSON_VALUE(@OldSecurityValue, '$.autoLogoffTimeout') AS INT);
                      DECLARE @UseResetPasswordViaEmailLink BIT = CAST(JSON_VALUE(@OldSecurityValue, '$.useResetPasswordViaEmailLink') AS BIT);
                      DECLARE @ResetPasswordEmailLinkLifetime INT = CAST(JSON_VALUE(@OldSecurityValue, '$.resetPasswordEmailLinkLifetime') AS INT);
                      DECLARE @UseResetPasswordViaSmsOtp BIT = CAST(JSON_VALUE(@OldSecurityValue, '$.useResetPasswordViaSmsOtp') AS BIT);
                      DECLARE @ResetPasswordSmsOtpLifetime INT = CAST(JSON_VALUE(@OldSecurityValue, '$.resetPasswordSmsOtpLifetime') AS INT);
                      DECLARE @UseResetPasswordViaSecurityQuestions BIT = CAST(JSON_VALUE(@OldSecurityValue, '$.useResetPasswordViaSecurityQuestions') AS BIT);
                      DECLARE @ResetPasswordViaSecurityQuestionsNumQuestionsAllowed INT = CAST(JSON_VALUE(@OldSecurityValue, '$.resetPasswordViaSecurityQuestionsNumQuestionsAllowed') AS INT);
                  
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
                  END
                  
                  -- ============================================================================
                  -- Step 3: Update OTP settings and merge with Authentication settings
                  -- ============================================================================
                  DECLARE @OldOtpValue NVARCHAR(MAX);
                  DECLARE @OldOtpId UNIQUEIDENTIFIER;
                  
                  -- Find the old OTP setting
                  SELECT TOP 1
                      @OldOtpId = sv.Id,
                      @OldOtpValue = sv.Value
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
                  
                  IF @OldOtpValue IS NOT NULL AND ISJSON(@OldOtpValue) = 1
                  BEGIN
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
                    
                    -- Extract User Management values that go into DefaultAuth
                    DECLARE @RequireEmailVerification BIT = CASE WHEN @OldUserManagementValue IS NOT NULL THEN CAST(JSON_VALUE(@OldUserManagementValue, '$.requireEmailVerification') AS BIT) ELSE NULL END;
                    DECLARE @UserEmailAsUsername BIT = CASE WHEN @OldUserManagementValue IS NOT NULL THEN CAST(JSON_VALUE(@OldUserManagementValue, '$.userEmailAsUsername') AS BIT) ELSE NULL END;
                    DECLARE @SupportedRegistrationMethods INT = CASE WHEN @OldUserManagementValue IS NOT NULL THEN CAST(JSON_VALUE(@OldUserManagementValue, '$.supportedRegistrationMethods') AS INT) ELSE NULL END;
                    
                    SET @NewDefaultAuthValue = (
                        SELECT
                            -- From old user management
                            ISNULL(@RequireEmailVerification, 0) AS requireOtpVerification,
                            CAST(1 AS BIT) AS allowLocalUsernamePasswordAuth,
                            CAST(1 AS BIT) AS useDefaultRegistrationForm,
                            ISNULL(@UserEmailAsUsername, 1) AS userEmailAsUsername,
                            @SupportedRegistrationMethods AS supportedVerificationMethods,
                    
                            -- From old security settings
                            ISNULL(@UseResetPasswordViaEmailLink, 1) AS useResetPasswordViaEmailLink,
                            ISNULL(@ResetPasswordEmailLinkLifetime, 360) AS resetPasswordEmailLinkLifetime,
                            ISNULL(@UseResetPasswordViaSmsOtp, 1) AS useResetPasswordViaSmsOtp,
                            ISNULL(@ResetPasswordSmsOtpLifetime, 180) AS resetPasswordSmsOtpLifetime,
                            ISNULL(@UseResetPasswordViaSecurityQuestions, 0) AS useResetPasswordViaSecurityQuestions,
                            ISNULL(@ResetPasswordViaSecurityQuestionsNumQuestionsAllowed, 0) AS resetPasswordViaSecurityQuestionsNumQuestionsAllowed,
                    
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
                        SELECT @DefaultAuthSettingsId = Id
                        FROM [frwk].[setting_values]
                        WHERE setting_configuration_id = @DefaultAuthSettingsConfigId;
                    
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
                            -- Insert new
                            INSERT INTO [frwk].[setting_values] (Id, setting_configuration_id, Value, creation_time)
                            VALUES (NEWID(), @DefaultAuthSettingsConfigId, @NewDefaultAuthValue, GETUTCDATE());
                        END
                    END
                  END
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
                v_old_user_mgmt_value JSONB;
                v_old_user_mgmt_id UUID;
                v_old_security_value JSONB;
                v_old_security_id UUID;
                v_old_otp_value JSONB;
                v_old_otp_id UUID;
                v_new_user_mgmt_value JSONB;
                v_new_general_security_value JSONB;
                v_new_default_auth_value JSONB;
                v_default_auth_settings_config_id UUID;
                v_default_auth_settings_id UUID;
                v_auto_logoff_timeout INTEGER;
            
            BEGIN
                -- ============================================================================
                -- Step 1: Find and update User Management settings
                -- ============================================================================
            
                -- Find the old User Management setting
                SELECT
                    sv.id,
                    sv.""value""::JSONB
                INTO
                    v_old_user_mgmt_id,
                    v_old_user_mgmt_value
                FROM
                    frwk.setting_values sv
                    INNER JOIN frwk.setting_configurations sc ON sv.setting_configuration_id = sc.id
                    INNER JOIN frwk.configuration_items ci ON sc.id = ci.id
                WHERE
                    ci.item_type = 'setting-configuration'
                    AND ci.""name"" = 'Shesha.UserManagement'
                    AND sv.""value"" IS NOT NULL
                LIMIT 1;
            
                IF v_old_user_mgmt_value IS NOT NULL THEN
            
                    -- Transform to new structure
                    v_new_user_mgmt_value := jsonb_build_object(
                        'additionalRegistrationInfo', COALESCE((v_old_user_mgmt_value->>'additionalRegistrationInfo')::BOOLEAN, FALSE),
                        'additionalRegistrationInfoForm', jsonb_build_object(
                            '_module', v_old_user_mgmt_value->>'additionalRegistrationInfoFormModule',
                            '_name', v_old_user_mgmt_value->>'additionalRegistrationInfoFormName',
                            '_className', 'form-configuration'
                        ),
                        'allowSelfRegistration', TRUE,
                        'allowedEmailDomains', '',
                        'creationMode', COALESCE((v_old_user_mgmt_value->>'creationMode')::INTEGER, 0),
                        'defaultRoles', COALESCE(v_old_user_mgmt_value->'defaultRoles', '[]'::JSONB),
                        'personEntityType', jsonb_build_object(
                            '_className', v_old_user_mgmt_value->>'personEntityType'
                        )
                    );
            
                    -- Update the value
                    UPDATE frwk.setting_values
                    SET ""value"" = v_new_user_mgmt_value::TEXT,
                        last_modification_time = NOW()
                    WHERE id = v_old_user_mgmt_id;
            
                END IF;
            
                -- ============================================================================
                -- Step 2: Find and update Security settings
                -- ============================================================================
            
                -- Find the old Security setting
                SELECT
                    sv.id,
                    sv.""value""::JSONB
                INTO
                    v_old_security_id,
                    v_old_security_value
                FROM
                    frwk.setting_values sv
                    INNER JOIN frwk.setting_configurations sc ON sv.setting_configuration_id = sc.id
                    INNER JOIN frwk.configuration_items ci ON sc.id = ci.id
                WHERE
                    ci.item_type = 'setting-configuration'
                    AND (
                        ci.""name"" LIKE '%Security%'
                        OR sv.""value""::TEXT LIKE '%autoLogoffTimeout%'
                        OR sv.""value""::TEXT LIKE '%useResetPasswordViaEmailLink%'
                    )
                    AND sv.""value"" IS NOT NULL
                LIMIT 1;
            
                IF v_old_security_value IS NOT NULL THEN
            
                    v_auto_logoff_timeout := COALESCE((v_old_security_value->>'autoLogoffTimeout')::INTEGER, 0);
            
                    -- Transform to GeneralFrontendSecuritySettings
                    v_new_general_security_value := jsonb_build_object(
                        'autoLogoffAfterInactivity', v_auto_logoff_timeout > 0,
                        'autoLogoffTimeout', v_auto_logoff_timeout
                    );
            
                    -- Update the value
                    UPDATE frwk.setting_values
                    SET ""value"" = v_new_general_security_value::TEXT,
                        last_modification_time = NOW()
                    WHERE id = v_old_security_id;
                END IF;
            
                -- ============================================================================
                -- Step 3: Find OTP settings
                -- ============================================================================
            
                -- Find the old OTP setting
                SELECT
                    sv.id,
                    sv.""value""::JSONB
                INTO
                    v_old_otp_id,
                    v_old_otp_value
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
                LIMIT 1;
            
                -- ============================================================================
                -- Step 4: Combine all into DefaultAuthenticationSettings
                -- ============================================================================
            IF v_old_otp_value IS NOT NULL OR v_old_user_mgmt_value IS NOT NULL OR v_old_security_value IS NOT NULL THEN
                v_new_default_auth_value := jsonb_build_object(
                    -- From old user management
                    'requireOtpVerification', COALESCE((v_old_user_mgmt_value->>'requireEmailVerification')::BOOLEAN, FALSE),
                    'allowLocalUsernamePasswordAuth', TRUE,
                    'useDefaultRegistrationForm', TRUE,
                    'userEmailAsUsername', COALESCE((v_old_user_mgmt_value->>'userEmailAsUsername')::BOOLEAN, TRUE),
                    'supportedVerificationMethods', (v_old_user_mgmt_value->>'supportedRegistrationMethods')::INTEGER,
            
                    -- From old security settings
                    'useResetPasswordViaEmailLink', COALESCE((v_old_security_value->>'useResetPasswordViaEmailLink')::BOOLEAN, TRUE),
                    'resetPasswordEmailLinkLifetime', COALESCE((v_old_security_value->>'resetPasswordEmailLinkLifetime')::INTEGER, 360),
                    'useResetPasswordViaSmsOtp', COALESCE((v_old_security_value->>'useResetPasswordViaSmsOtp')::BOOLEAN, TRUE),
                    'resetPasswordSmsOtpLifetime', COALESCE((v_old_security_value->>'resetPasswordSmsOtpLifetime')::INTEGER, 180),
                    'useResetPasswordViaSecurityQuestions', COALESCE((v_old_security_value->>'useResetPasswordViaSecurityQuestions')::BOOLEAN, FALSE),
                    'resetPasswordViaSecurityQuestionsNumQuestionsAllowed', COALESCE((v_old_security_value->>'resetPasswordViaSecurityQuestionsNumQuestionsAllowed')::INTEGER, 0),
            
                    -- From old OTP settings
                    'passwordLength', COALESCE((v_old_otp_value->>'passwordLength')::INTEGER, 6),
                    'alphabet', COALESCE(v_old_otp_value->>'alphabet', '0123456789'),
                    'defaultLifetime', COALESCE((v_old_otp_value->>'defaultLifetime')::INTEGER, 360),
                    'ignoreOtpValidation', COALESCE((v_old_otp_value->>'ignoreOtpValidation')::BOOLEAN, FALSE),
                    'defaultSubjectTemplate', COALESCE(v_old_otp_value->>'defaultSubjectTemplate', 'One-Time-Pin'),
                    'defaultBodyTemplate', COALESCE(v_old_otp_value->>'defaultBodyTemplate', 'Your One-Time-Pin is {{password}}'),
                    'defaultEmailSubjectTemplate', COALESCE(v_old_otp_value->>'defaultEmailSubjectTemplate', 'One-Time-Pin'),
                    'defaultEmailBodyTemplate', COALESCE(v_old_otp_value->>'defaultEmailBodyTemplate', ''),
            
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
                    SELECT id INTO v_default_auth_settings_id
                    FROM frwk.setting_values
                    WHERE setting_configuration_id = v_default_auth_settings_config_id
                    LIMIT 1;
            
                    IF v_default_auth_settings_id IS NOT NULL THEN
                        -- Update existing
                        UPDATE frwk.setting_values
                        SET ""value"" = v_new_default_auth_value::TEXT,
                            last_modification_time = NOW()
                        WHERE id = v_default_auth_settings_id;
            
                    ELSE
                        -- Insert new
                        INSERT INTO frwk.setting_values (id, setting_configuration_id, ""value"", creation_time)
                        VALUES (gen_random_uuid(), v_default_auth_settings_config_id, v_new_default_auth_value::TEXT, NOW());
            
                    END IF;
                END IF;
            END IF;
            END $$;

        ");
        }
    }
}
