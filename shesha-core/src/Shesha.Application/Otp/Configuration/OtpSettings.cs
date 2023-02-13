using Abp.Configuration;
using Abp.Dependency;
using Abp.Runtime.Session;
using Shesha.Utilities;

namespace Shesha.Otp.Configuration
{
    public class OtpSettings: IOtpSettings, ITransientDependency
    {
        /// <summary>
        /// Reference to the current Session.
        /// </summary>
        public IAbpSession AbpSession { get; set; }

        protected readonly ISettingManager SettingManager;
        public OtpSettings(ISettingManager settingManager)
        {
            SettingManager = settingManager;
            AbpSession = NullAbpSession.Instance;
        }

        /// inheritedDoc
        public int PasswordLength => SettingManager.GetSettingValue<int>(OtpSettingsNames.PasswordLength);

        /// inheritedDoc
        public string Alphabet => SettingManager.GetSettingValue(OtpSettingsNames.Alphabet);

        /// inheritedDoc
        public int DefaultLifetime => SettingManager.GetSettingValue(OtpSettingsNames.DefaultLifetime).ToInt(OtpSettingProvider.DefaultLifetime);

        /// inheritedDoc
        public bool IgnoreOtpValidation => SettingManager.GetSettingValue(OtpSettingsNames.IgnoreOtpValidation) == true.ToString();
    }
}
