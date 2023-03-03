using Abp.Dependency;
using Shesha.Settings;

namespace Shesha.Sms.SmsPortal
{
    /// <summary>
    /// Defines Clickatell gateway settings.
    /// </summary>
    public class SmsPortalSettingProvider : SettingDefinitionProvider, ITransientDependency
    {
        private const string CategoryName = "Sms Portal";

        public override void Define(ISettingDefinitionContext context)
        {
            context.Add(
                new SettingDefinition<string>(
                    SmsPortalSettingNames.Host,
                    "mymobileapi.com/api5/http5.aspx",
                    "SmsPortal Host")
                { Category = CategoryName },
                new SettingDefinition<string>(
                    SmsPortalSettingNames.Username,
                    null,
                    "SmsPortal Login")
                { Category = CategoryName },
                new SettingDefinition<string>(
                    SmsPortalSettingNames.Password,
                    null,
                    "SmsPortal Password")
                { Category = CategoryName },

                new SettingDefinition<bool>(
                    SmsPortalSettingNames.UseProxy,
                    false,
                    "Use Proxy")
                { Category = CategoryName },
                new SettingDefinition<bool>(
                    SmsPortalSettingNames.UseDefaultProxyCredentials,
                    true,
                    "Use default proxy credentials")
                { Category = CategoryName },
                new SettingDefinition<string>(
                    SmsPortalSettingNames.WebProxyAddress,
                    null,
                    "Web Proxy Address")
                { Category = CategoryName },
                new SettingDefinition<string>(
                    SmsPortalSettingNames.WebProxyUsername,
                    null,
                    "Proxy Login")
                { Category = CategoryName },
                new SettingDefinition<string>(
                    SmsPortalSettingNames.WebProxyPassword,
                    null,
                    "Proxy Password")
                { Category = CategoryName }
            );
        }
    }
}
