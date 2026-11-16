using Abp.Dependency;
using Abp.UI;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Shesha.Authorization;
using Shesha.Authorization.Users;
using Shesha.Configuration.Runtime;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.Otp.Configuration;
using Shesha.Otp.Dto;
using Shesha.RateLimiting;
using System.Threading.Tasks;

namespace Shesha.Otp
{
    public class OtpAppService : SheshaAppServiceBase, IOtpAppService, ITransientDependency
    {
        private readonly IOtpSettings _otpSettings;
        private readonly IOtpManager _otpManager;
        private readonly IEntityTypeConfigurationStore _entityTypeConfigurationStore;


        public OtpAppService(IOtpManager otpManager, IOtpSettings otpSettings, IEntityTypeConfigurationStore entityTypeConfigurationStore)
        {
            _otpManager = otpManager;
            _otpSettings = otpSettings;
            _entityTypeConfigurationStore = entityTypeConfigurationStore;
        }

        /// <summary>
        /// Send one-time-pin
        /// </summary>
        [AllowAnonymous]
        [EnableRateLimiting(SheshaRateLimitingPolicies.Otp)]
        public async Task<ISendPinResponse> SendPinAsync(SendPinInput input)
        {
            if (!AbpSession.UserId.HasValue)
                RestrictAnonymousRecipient(input);

            return await _otpManager.SendPinAsync(input);
        }

        /// <summary>
        /// Anonymous callers must address the OTP themselves. They can't make the OTP manager deliver it to the stored addresses
        /// of a person selected by id: that would allow to message any user and to check which ids exist
        /// </summary>
        private void RestrictAnonymousRecipient(SendPinInput input)
        {
            if (string.IsNullOrWhiteSpace(input.SendTo))
                throw new UserFriendlyException($"{nameof(input.SendTo)} must be specified");

            if (string.IsNullOrWhiteSpace(input.RecipientType))
                return;

            // the OTP manager takes addresses from persons and users only, other recipient types are kept as is for the audit
            var entityType = _entityTypeConfigurationStore.GetOrNull(input.RecipientType)?.EntityType;
            if (entityType != null && (typeof(Person).IsAssignableFrom(entityType) || typeof(User).IsAssignableFrom(entityType)))
                input.RecipientType = null;
        }

        /// <summary>
        /// Resend one-time-pin
        /// </summary>
        [AllowAnonymous]
        [EnableRateLimiting(SheshaRateLimitingPolicies.Otp)]
        public async Task<ISendPinResponse> ResendPinAsync(ResendPinInput input)
        {
            return await _otpManager.ResendPinAsync(input);
        }


        /// <summary>
        /// Verify one-time-pin
        /// </summary>
        [AllowAnonymous]
        public async Task<IVerifyPinResponse> VerifyPinAsync(VerifyPinInput input)
        {
            return await _otpManager.VerifyPinAsync(input);
        }

        /// inheritDoc
        [HttpPost]
        [SheshaAuthorize(RefListPermissionedAccess.RequiresPermissions, PermissionNames.Application_Maintenance, PermissionNames.Application_Settings, IsConfigurable = false)]
        public async Task<bool> UpdateSettingsAsync(OtpSettingsDto input)
        {
            // note: message templates are not part of the settings anymore, they are defined by the notification templates of the OTP configurations
            var settings = await _otpSettings.OneTimePins.GetValueOrNullAsync() ?? new OtpSettings();
            settings.PasswordLength = input.PasswordLength;
            settings.Alphabet = input.Alphabet;
            settings.DefaultLifetime = input.DefaultLifetime;
            settings.IgnoreOtpValidation = input.IgnoreOtpValidation;

            await _otpSettings.OneTimePins.SetValueAsync(settings);

            return true;
        }

        /// inheritDoc
        [HttpGet]
        [SheshaAuthorize(RefListPermissionedAccess.RequiresPermissions, PermissionNames.Application_Maintenance, PermissionNames.Application_Settings, IsConfigurable = false)]
        public async Task<OtpSettingsDto> GetSettingsAsync()
        {
            var emailSettings = await _otpSettings.OneTimePins.GetValueAsync();

            var settings = new OtpSettingsDto
            {
                PasswordLength = emailSettings.PasswordLength,
                Alphabet = emailSettings.Alphabet,
                DefaultLifetime = emailSettings.DefaultLifetime,
                IgnoreOtpValidation = emailSettings.IgnoreOtpValidation,
            };

            return settings;
        }
    }
}