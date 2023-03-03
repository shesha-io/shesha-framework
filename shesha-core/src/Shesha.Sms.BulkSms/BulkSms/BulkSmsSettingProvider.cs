using Abp.Dependency;
using Shesha.Settings;

namespace Shesha.Sms.BulkSms
{
    /// <summary>
    /// Defines BulkSMS gateway settings.
    /// </summary>
    public class BulkSmsSettingProvider : SettingDefinitionProvider, ITransientDependency
    {
        private const string CategoryName = "Bulk SMS";

        public override void Define(ISettingDefinitionContext context)
        {
            context.Add(
                new SettingDefinition<string>(
                    BulkSmsSettingNames.ApiUrl,
                    "http://bulksms.2way.co.za:5567/eapi/submission/send_sms/2/2.0",
                    "Api Url")
                { Category = CategoryName },

                new SettingDefinition<string>(
                    BulkSmsSettingNames.ApiUsername,
                    null,
                    "Login")
                { Category = CategoryName },
                new SettingDefinition<string>(
                    BulkSmsSettingNames.ApiPassword,
                    null,
                    "Password")
                { Category = CategoryName },
                new SettingDefinition<bool>(
                    BulkSmsSettingNames.UseProxy,
                    false,
                    "Use Proxy")
                { Category = CategoryName },
                new SettingDefinition<bool>(
                    BulkSmsSettingNames.UseDefaultProxyCredentials,
                    true,
                    "Use default proxy credentials")
                { Category = CategoryName }, 
                new SettingDefinition<string>(
                    BulkSmsSettingNames.WebProxyAddress,
                    null,
                    "Web Proxy Address")
                { Category = CategoryName },
                new SettingDefinition<string>(
                    BulkSmsSettingNames.WebProxyUsername,
                    null,
                    "Proxy Login")
                { Category = CategoryName },
                new SettingDefinition<string>(
                    BulkSmsSettingNames.WebProxyPassword,
                    null,
                    "Proxy Password")
                { Category = CategoryName }
            );
        }
    }
}
