using System;
using Abp.Configuration;
using Abp.Dependency;
using Shesha.Domain;

namespace Shesha.Configuration
{
    public class SheshaSettings: ISheshaSettings, ITransientDependency
    {
        private readonly ISettingManager _settingManager;

        public SheshaSettings(ISettingManager settingManager)
        {
            _settingManager = settingManager;
        }

        /// <summary>
        /// Upload folder for stored files (<see cref="StoredFile"/>) 
        /// </summary>
        public string UploadFolder => _settingManager.GetSettingValue(SheshaSettingNames.UploadFolder);
        public string ExchangeName => _settingManager.GetSettingValue(SheshaSettingNames.ExchangeName);
        /// <summary>
        /// Auto logoff timeout (0 - disabled)
        /// </summary>
        public string AutoLogoffTimeout => _settingManager.GetSettingValue(SheshaSettingNames.Security.AutoLogoffTimeout);

        /// <summary>
        /// Allow users to reset passwords with reset link sent to their emails.
        /// </summary>
        public string ResetPasswordWithEmailLinkIsSupported => _settingManager.GetSettingValue(SheshaSettingNames.Security.ResetPasswordWithEmailLinkIsSupported);

        /// <summary>
        /// Email link expiry delay
        /// </summary>
        public string ResetPasswordWithEmailLinkExpiryDelay => _settingManager.GetSettingValue(SheshaSettingNames.Security.ResetPasswordWithEmailLinkExpiryDelay);

        /// <summary>
        /// Allow users to reset passwords using OTPs sent to their phone numbers.
        /// </summary>
        public string ResetPasswordWithSmsOtpIsSupported => _settingManager.GetSettingValue(SheshaSettingNames.Security.ResetPasswordWithSmsOtpIsSupported);

        /// <summary>
        /// OTP expiry delay
        /// </summary>
        public string ResetPasswordWithSmsOtpExpiryDelay => _settingManager.GetSettingValue(SheshaSettingNames.Security.ResetPasswordWithSmsOtpExpiryDelay);

        /// <summary>
        /// Allow users to reset passwords using predefined security questions and answers.
        /// </summary>
        public string ResetPasswordWithSecurityQuestionsIsSupported => _settingManager.GetSettingValue(SheshaSettingNames.Security.ResetPasswordWithSecurityQuestionsIsSupported);

        /// <summary>
        /// Allow the admin to define how many questions should be selected and answered by the user.
        /// </summary>
        public string ResetPasswordWithSecurityQuestionsNumQuestionsAllowed => _settingManager.GetSettingValue(SheshaSettingNames.Security.ResetPasswordWithSecurityQuestionsNumQuestionsAllowed);
    }
}
