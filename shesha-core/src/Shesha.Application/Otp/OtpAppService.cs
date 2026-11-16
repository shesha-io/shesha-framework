using Abp.Dependency;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shesha.Authorization;
using Shesha.Domain.Enums;
using Shesha.Otp.Configuration;
using Shesha.Otp.Dto;
using System.Threading.Tasks;

namespace Shesha.Otp
{
    public class OtpAppService : SheshaAppServiceBase, IOtpAppService, ITransientDependency
    {
        private readonly IOtpSettings _otpSettings;
        private readonly IOtpManager _otpManager;


        public OtpAppService(IOtpManager otpManager, IOtpSettings otpSettings)
        {
            _otpManager = otpManager;
            _otpSettings = otpSettings;
        }

        /// <summary>
        /// Send one-time-pin
        /// </summary>
        [AllowAnonymous]
        public async Task<ISendPinResponse> SendPinAsync(SendPinInput input)
        {
            return await _otpManager.SendPinAsync(input);
        }

        /// <summary>
        /// Resend one-time-pin
        /// </summary>
        [AllowAnonymous]
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