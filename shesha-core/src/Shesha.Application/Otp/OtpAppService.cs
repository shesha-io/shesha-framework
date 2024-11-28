using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Net.Mail;
using Abp.UI;
using DocumentFormat.OpenXml.Drawing;
using GraphQL;
using Microsoft.AspNetCore.Mvc;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.Exceptions;
using Shesha.Otp.Configuration;
using Shesha.Otp.Dto;
using Shesha.Sms;
using System;
using System.Threading.Tasks;

namespace Shesha.Otp
{
    public class OtpAppService : SheshaAppServiceBase, IOtpAppService, ITransientDependency
    {
        private readonly ISmsGateway _smsGateway;
        private readonly IEmailSender _emailSender;
        private readonly IOtpStorage _otpStorage;
        private readonly IOtpGenerator _otpGenerator;
        private readonly IOtpSettings _otpSettings;
        private readonly IRepository<OtpConfig, Guid> _otpConfigRepository;
        private readonly IRepository<Person, Guid> _personRepository;
        private readonly IOtpAppServiceHelper _otpServiceHelper;
        private readonly IOtpManager _otpManager;

        public OtpAppService(ISmsGateway smsGateway, IEmailSender emailSender, IOtpStorage otpStorage,
            IOtpGenerator passwordGenerator, IOtpSettings otpSettings,
            IRepository<OtpConfig, Guid> otpConfigRepository,
            IRepository<Person, Guid> personRepository,
            IOtpAppServiceHelper otpServiceHelper, IOtpManager otpManager)
        {
            _smsGateway = smsGateway;
            _emailSender = emailSender;
            _otpStorage = otpStorage;
            _otpGenerator = passwordGenerator;
            _otpSettings = otpSettings;
            _otpConfigRepository = otpConfigRepository;
            _personRepository = personRepository;
            _otpServiceHelper = otpServiceHelper;
            _otpManager = otpManager; 
        }

        /// <summary>
        /// Send one-time-pin
        /// </summary>
        public async Task<ISendPinResponse> SendPinAsync(SendPinInput input)
        {
            return await _otpManager.SendPinAsync(input);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="module"></param>
        /// <param name="otpConfig"></param>
        /// <param name="sourceEntityId"></param>
        /// <param name="sendTo"></param>
        /// <returns></returns>
        /// <exception cref="UserFriendlyException"></exception>
        public async Task<ISendPinResponse> SendPinWithConfig(string module, string otpConfig, Guid? sourceEntityId, string sendTo)
        {
            var config = await _otpServiceHelper.GetOtpConfigAsync(module, otpConfig);
            if (string.IsNullOrEmpty(sendTo))
                throw new UserFriendlyException("SendTo must be specified");

            var pinCode = _otpServiceHelper.GenerateOtpCode(config.SendType ?? OtpSendType.Sms);
            var otp = _otpServiceHelper.CreateOtp(sendTo, config, sourceEntityId, pinCode);
            await _otpServiceHelper.SendOtpAsync(otp, config);
            await _otpStorage.SaveAsync(otp);

            return new SendPinResponse { OperationId = otp.OperationId, SentTo = otp.SendTo, ModuleName = config.Module.Name, ActionType = config.ActionType, SourceEntityId = otp.SourceEntityId};
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="module"></param>
        /// <param name="otpConfig"></param>
        /// <param name="sourceEntityId"></param>
        /// <param name="personId"></param>
        /// <returns></returns>
        /// <exception cref="UserFriendlyException"></exception>
        public async Task<SendPinResponse> SendPinToPersonWithConfig(string module, string otpConfig, Guid? sourceEntityId, Guid personId)
        {
            var config = await _otpServiceHelper.GetOtpConfigAsync(module, otpConfig);
            var person = await _personRepository.GetAsync(personId);
            if (person == null)
                throw new UserFriendlyException("Person not found");

            string sendTo = _otpServiceHelper.GetSendToAddress(person, config.SendType);
            var pinCode = _otpServiceHelper.GenerateOtpCode(config.SendType ?? OtpSendType.Sms);
            var otp = _otpServiceHelper.CreateOtp(sendTo, config, sourceEntityId, pinCode, personId.ToString());
            await _otpServiceHelper.SendOtpAsync(otp, config);
            await _otpStorage.SaveAsync(otp);

            return new SendPinResponse { OperationId = otp.OperationId, SentTo = otp.SendTo, ModuleName = config.Module.Name, ActionType = config.ActionType, SourceEntityId = otp.SourceEntityId };
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        public async Task<ISendPinResponse> ResendPinAsync(ResendPinInput input)
        {
            return await _otpManager.ResendPinAsync(input);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="operationId"></param>
        /// <param name="lifetime"></param>
        /// <param name="moduleName"></param>
        /// <param name="otpConfigName"></param>
        /// <returns></returns>
        /// <exception cref="UserFriendlyException"></exception>
        public async Task<ISendPinResponse> ResendPinWithConfig(Guid? operationId, int? lifetime, string moduleName, string otpConfigName)
        {
            var otp = await _otpServiceHelper.GetOtpWithOperationId(operationId);

            var config = await _otpServiceHelper.GetOtpConfigAsync(moduleName, otpConfigName);
            if (config.NotificationTemplate == null || !config.NotificationTemplate.IsEnabled)
                throw new UserFriendlyException("Invalid or disabled notification template in config");

            return await _otpServiceHelper.ProcessOtpResendAsync(
                otp,
                lifetime,
                async (otp) => await _otpServiceHelper.SendInternalWithConfig(otp, config),
                async (otp) =>
                {
                    await _otpStorage.UpdateAsync(otp.OperationId, newOtp =>
                    {
                        newOtp.SentOn = DateTime.Now;
                        newOtp.SendStatus = OtpSendStatus.Sent;
                        newOtp.ExpiresOn = DateTime.Now.AddSeconds(lifetime ?? config.Lifetime ?? 300);
                        return Task.CompletedTask;
                    });
                },
                lifetime ?? config.Lifetime ?? 300
            );
        }

        public async Task<ISendPinResponse> ResendPinAsyncUsingComposite(string moduleName, string actionType, Guid sourceEntityId, int? lifetime)
        {
            var settings = await _otpSettings.OneTimePins.GetValueAsync();
            var otp = await _otpServiceHelper.GetOtpWithCompositeKey(moduleName, actionType, sourceEntityId);
            return await _otpServiceHelper.ProcessOtpResendAsync(
                otp,
                lifetime,
                async (otp) => await _otpServiceHelper.SendInternal(otp),
                async (otp) =>
                {
                    await _otpStorage.UpdateAsync(otp.OperationId, newOtp =>
                    {
                        newOtp.SentOn = DateTime.Now;
                        newOtp.SendStatus = OtpSendStatus.Sent;
                        newOtp.ExpiresOn = DateTime.Now.AddSeconds(lifetime ?? settings.DefaultLifetime);
                        return Task.CompletedTask;
                    });
                },
                lifetime ?? settings.DefaultLifetime
            );
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="actionType"></param>
        /// <param name="sourceEntityId"></param>
        /// <param name="lifetime"></param>
        /// <param name="moduleName"></param>
        /// <param name="otpConfigName"></param>
        /// <returns></returns>
        /// <exception cref="UserFriendlyException"></exception>
        public async Task<ISendPinResponse> ResendPinWithConfigUsingComposite(string moduleName, string actionType, Guid sourceEntityId, int? lifetime, string otpConfigName)
        {
            var otp = await _otpServiceHelper.GetOtpWithCompositeKey(moduleName, actionType, sourceEntityId);

            var config = await _otpServiceHelper.GetOtpConfigAsync(moduleName, otpConfigName);
            if (config.NotificationTemplate == null || !config.NotificationTemplate.IsEnabled)
                throw new UserFriendlyException("Invalid or disabled notification template in config");

            return await _otpServiceHelper.ProcessOtpResendAsync(
                otp,
                lifetime,
                async (otp) => await _otpServiceHelper.SendInternalWithConfig(otp, config),
                async (otp) =>
                {
                    await _otpStorage.UpdateAsync(otp.OperationId, newOtp =>
                    {
                        newOtp.SentOn = DateTime.Now;
                        newOtp.SendStatus = OtpSendStatus.Sent;
                        newOtp.ExpiresOn = DateTime.Now.AddSeconds(lifetime ?? config.Lifetime ?? 300);
                        return Task.CompletedTask;
                    });
                },
                lifetime ?? config.Lifetime ?? 300
            );
        }

        /// <summary>
        /// Verify one-time-pin
        /// </summary>
        public async Task<IVerifyPinResponse> VerifyPinWithComposite(string moduleName, string actionType, Guid sourceEntityId, string pin)
        {
            // Retrieve OTP settings
            var settings = await _otpSettings.OneTimePins.GetValueAsync();

            // Retrieve OTP details
            var pinDto = await _otpServiceHelper.RetrieveOtpAsync(moduleName, actionType, sourceEntityId);

            // Validate OTP and return the response
            return _otpServiceHelper.ValidateOtp(pinDto, pin, settings.IgnoreOtpValidation);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        public async Task<IVerifyPinResponse> VerifyPinAsync(VerifyPinInput input)
        {
            return await _otpManager.VerifyPinAsync(input);
        }


        /// inheritedDoc
        [ApiExplorerSettings(IgnoreApi = true)]
        public async Task<IOtpDto> GetAsync(Guid operationId)
        {
            return await _otpStorage.GetAsync(operationId);
        }

        [ApiExplorerSettings(IgnoreApi = true)]
        public async Task<IOtpDto> GetWithCompositeKey(string moduleName, string actionType, Guid sourceEntityId)
        {
            if (string.IsNullOrEmpty(moduleName))
            {
                throw new UserFriendlyException("ModuleName is required to get Otp item");
            }
            if (string.IsNullOrEmpty(actionType))
            {
                throw new UserFriendlyException("ActionType is required to get Otp item");
            }
            return await _otpStorage.GetAsync(moduleName, actionType, sourceEntityId.ToString());
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