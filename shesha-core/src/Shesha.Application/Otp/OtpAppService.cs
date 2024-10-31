using Abp.Dependency;
using Abp.Net.Mail;
using Microsoft.AspNetCore.Mvc;
using Shesha.Otp.Configuration;
using Shesha.Otp.Dto;
using Shesha.Sms;
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
            await _otpSettings.OneTimePins.SetValueAsync(new OtpSettings
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
            var emailSettings = await _otpSettings.OneTimePins.GetValueAsync();

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