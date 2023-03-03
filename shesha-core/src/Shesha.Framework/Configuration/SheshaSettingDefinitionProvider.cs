using Abp.Dependency;
using Abp.Localization;
using Abp.Zero.Configuration;
using Shesha.Settings;

namespace Shesha.Configuration
{
    public class SheshaSettingDefinitionProvider : SettingDefinitionProvider, ITransientDependency
    {
        private static class Categories {
            public const string Authentication = "Authentication";
            public const string PasswordComplexity = "Password strength";
            public const string PasswordReset = "Password reset";
            public const string General = "General";
        }

        public override void Define(ISettingDefinitionContext context)
        {
            #region Abp settings

            context.Add(
                       /*
                              new SettingDefinition<bool>(
                                  AbpZeroSettingNames.UserManagement.IsEmailConfirmationRequiredForLogin,
                                  false,
                                  "Require email confirmation on login")
                              {
                                  Category = Categories.Authentication,
                                  IsClientSpecific = true,
                                  Description = "Is email confirmation required for login.",
                              },

                              new SettingDefinition<int>(
                                  AbpZeroSettingNames.OrganizationUnits.MaxUserMembershipCount,
                                  int.MaxValue,
                                  "Max user membership count")
                              {
                                  IsClientSpecific = true,
                                  Description = "Maximum allowed organization unit membership count for a user."
                              },

                              new SettingDefinition<bool>(
                                  AbpZeroSettingNames.UserManagement.TwoFactorLogin.IsEnabled,
                                  true,
                                  "Enable 2FA")
                              {
                                  Category = Categories.Authentication,
                                  IsClientSpecific = true,
                                  Description = "Is two factor login enabled." 
                              },

                              new SettingDefinition<bool>(
                                  AbpZeroSettingNames.UserManagement.TwoFactorLogin.IsRememberBrowserEnabled,
                                  true,
                                  "Enable `Remember me`")
                              {
                                  Category = Categories.Authentication,
                                  IsClientSpecific = true,
                                  Description = "Is browser remembering enabled for two factor login." 
                              },

                              new SettingDefinition<bool>(
                                  AbpZeroSettingNames.UserManagement.TwoFactorLogin.IsEmailProviderEnabled,
                                  true,
                                  "Use email provider")
                              {
                                  Category = Categories.Authentication,
                                  IsClientSpecific = true,
                                  Description = "Is email provider enabled for two factor login." 
                              },

                              new SettingDefinition<bool>(
                                  AbpZeroSettingNames.UserManagement.TwoFactorLogin.IsSmsProviderEnabled,
                                  true,
                                  "Use sms provider")
                              {
                                  Category = Categories.Authentication,
                                  IsClientSpecific = true,
                                  Description = "Is sms provider enabled for two factor login." 
                              },
                       */

            #region UserLockOut
                       new SettingDefinition<bool>(
                           AbpZeroSettingNames.UserManagement.UserLockOut.IsEnabled,
                           true,
                           "Enable user lockout")
                       {
                           Category = Categories.Authentication,
                           IsClientSpecific = true, 
                           Description = "Is user lockout enabled." 
                       },

                       new SettingDefinition<int>(
                           AbpZeroSettingNames.UserManagement.UserLockOut.MaxFailedAccessAttemptsBeforeLockout,
                           5,
                           "Max failed login attempts before lockout")
                       {
                           Category = Categories.Authentication,
                           IsClientSpecific = true,
                           Description = "Maximum Failed access attempt count before user lockout." 
                       },

                       new SettingDefinition<int>(
                           AbpZeroSettingNames.UserManagement.UserLockOut.DefaultAccountLockoutSeconds,
                           300 /* 5 minutes */,
                           "User lockout (sec)")
                       {
                           Category = Categories.Authentication,
                           IsClientSpecific = true,
                           Description = "User lockout in seconds." 
                       },

            #endregion

            #region password complexity
                       new SettingDefinition<bool>(
                           AbpZeroSettingNames.UserManagement.PasswordComplexity.RequireDigit,
                           false,
                           "Require digit")
                       {
                           Category = Categories.PasswordComplexity,
                           IsClientSpecific = true
                       },

                       new SettingDefinition<bool>(
                           AbpZeroSettingNames.UserManagement.PasswordComplexity.RequireLowercase,
                           false,
                           "Require lowercase"
                           )
                       {
                           Category = Categories.PasswordComplexity,
                           IsClientSpecific = true,
                       },

                       new SettingDefinition<bool>(
                           AbpZeroSettingNames.UserManagement.PasswordComplexity.RequireNonAlphanumeric,
                           false,
                           "Require non alphanumeric")
                       {
                           Category = Categories.PasswordComplexity,
                           IsClientSpecific = true,
                       },

                       new SettingDefinition<bool>(
                           AbpZeroSettingNames.UserManagement.PasswordComplexity.RequireUppercase,
                           false,
                           "Require upper case")
                       {
                           Category = Categories.PasswordComplexity,
                           IsClientSpecific = true
                       },

                       new SettingDefinition<int>(
                           AbpZeroSettingNames.UserManagement.PasswordComplexity.RequiredLength,
                           3,
                           "Required length")
                       {
                           Category = Categories.PasswordComplexity,
                           IsClientSpecific = true
                       },

                       new SettingDefinition<string>(
                           "TestSetting",
                           "Lorem ipsum",
                           "Test setting")
                       {
                           Category = Categories.PasswordComplexity,
                           IsClientSpecific = true
                       }
                       #endregion
            );

            #endregion

            context.Add(
                new SettingDefinition<string>(SheshaSettingNames.UploadFolder, 
                    "~/App_Data/Upload", 
                    "Upload folder"
                ) {
                    Category = Categories.General,
                },
                
                new SettingDefinition<string>(
                    SheshaSettingNames.RabbitMQ.ExchangeName,
                    "",
                    "Exchange name"
                )
                {
                    Category = Categories.General,
                },
                new SettingDefinition<int>(
                    SheshaSettingNames.Security.AutoLogoffTimeout,
                    0,
                    "Auto logoff timeout"
                )
                {
                    Category = Categories.Authentication,
                },
                new SettingDefinition<bool>(
                    SheshaSettingNames.Security.ResetPasswordWithEmailLinkIsSupported,
                    false,
                    "Use reset password via email"
                )
                {
                    Category = Categories.Authentication,
                },
                new SettingDefinition<int>(
                    SheshaSettingNames.Security.ResetPasswordWithEmailLinkExpiryDelay,
                    0,
                    "Email link lifetime"
                )
                {
                    Category = Categories.Authentication,
                },
                new SettingDefinition<bool>(
                    SheshaSettingNames.Security.ResetPasswordWithSmsOtpIsSupported,
                    false,
                    "Use reset password via sms"
                )
                {
                    Category = Categories.Authentication,
                },
                new SettingDefinition<int>(
                    SheshaSettingNames.Security.ResetPasswordWithSmsOtpExpiryDelay,
                    0,
                    "OTP lifetime"
                )
                {
                    Category = Categories.Authentication,
                },
                new SettingDefinition<bool>(
                    SheshaSettingNames.Security.ResetPasswordWithSecurityQuestionsIsSupported,
                    false,
                    "Use reset password via security questions"
                )
                {
                    Category = Categories.Authentication,
                },
                new SettingDefinition<int>(
                    SheshaSettingNames.Security.ResetPasswordWithSecurityQuestionsNumQuestionsAllowed,
                    3,
                    "Num questions allowed"
                )
                {
                    Category = Categories.Authentication,
                }
            );
        }
    }
}
