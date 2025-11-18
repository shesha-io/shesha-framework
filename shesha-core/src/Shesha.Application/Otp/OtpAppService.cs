using System.Threading.Tasks;
using Abp.Dependency;
using Microsoft.AspNetCore.Mvc;
using Shesha.Configuration.Security.Frontend;
using Shesha.Otp.Configuration;
using Shesha.Otp.Dto;

namespace Shesha.Otp
{
    public class OtpAppService : SheshaAppServiceBase, IOtpAppService, ITransientDependency
    {
        private readonly IUserManagementSettings _userManagementSettings;
        private readonly IOtpManager _otpManager;
        

        public OtpAppService(IOtpManager otpManager, IUserManagementSettings userManagementSettings)
        {
            _otpManager = otpManager;
            _userManagementSettings = userManagementSettings;
        }

        /// <summary>
        /// Send one-time-pin
        /// </summary>
        public async Task<ISendPinResponse> SendPinAsync(SendPinInput input)
        {
            return await _otpManager.SendPinAsync(input);
        }

        /// <summary>
        /// Resend one-time-pin
        /// </summary>
        public async Task<ISendPinResponse> ResendPinAsync(ResendPinInput input)
        {
            return await _otpManager.ResendPinAsync(input);
        }


        /// <summary>
        /// Verify one-time-pin
        /// </summary>
        public async Task<IVerifyPinResponse> VerifyPinAsync(VerifyPinInput input)
        {
            return await _otpManager.VerifyPinAsync(input);
        }

        /// inheritDoc
        [HttpPost]
        public async Task<bool> UpdateSettingsAsync(OtpSettingsDto input)
        {
            await _userManagementSettings.DefaultAuthentication.SetValueAsync(new DefaultAuthenticationSettings
            {
                PasswordLength = input.PasswordLength,
                Alphabet = input.Alphabet,
                DefaultLifetime = input.DefaultLifetime,
                IgnoreOtpValidation = input.IgnoreOtpValidation,
                DefaultEmailBodyTemplate = input.EmailBodyTemplate,
                DefaultEmailSubjectTemplate = input.EmailSubject,
            });

            return true;
        }

        /// inheritDoc
        [HttpGet]
        public async Task<OtpSettingsDto> GetSettingsAsync()
        {
            var emailSettings = await _userManagementSettings.DefaultAuthentication.GetValueAsync();

            var settings = new OtpSettingsDto
            {
                PasswordLength = emailSettings.PasswordLength,
                Alphabet = emailSettings.Alphabet,
                DefaultLifetime = emailSettings.DefaultLifetime,
                IgnoreOtpValidation = emailSettings.IgnoreOtpValidation,
                EmailSubject = emailSettings.DefaultEmailSubjectTemplate,
                EmailBodyTemplate = emailSettings.DefaultEmailBodyTemplate,
            };
            
            return settings;
        }
    }
}