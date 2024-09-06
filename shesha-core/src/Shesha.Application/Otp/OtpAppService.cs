using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Net.Mail;
using Abp.UI;
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

        public OtpAppService(ISmsGateway smsGateway, IEmailSender emailSender, IOtpStorage otpStorage, IOtpGenerator passwordGenerator, IOtpSettings otpSettings, IRepository<OtpConfig, Guid> otpConfigRepository, IRepository<Person, Guid> personRepository, IOtpAppServiceHelper otpServiceHelper)
        {
            _smsGateway = smsGateway;
            _emailSender = emailSender;
            _otpStorage = otpStorage;
            _otpGenerator = passwordGenerator;
            _otpSettings = otpSettings;
            _otpConfigRepository = otpConfigRepository;
            _personRepository = personRepository;
            _otpServiceHelper = otpServiceHelper;
        }

        /// <summary>
        /// Send one-time-pin
        /// </summary>
        public async Task<ISendPinResponse> SendPinAsync(ISendPinInput input)
        {
            var settings = await _otpSettings.OneTimePins.GetValueAsync();
            if (string.IsNullOrWhiteSpace(input.SendTo))
                throw new Exception($"{input.SendTo} must be specified");

            string pinCode = "";

            if (input.SendType == OtpSendType.EmailLink)
            {
                // TODO: Generate password reset token
                pinCode = Guid.NewGuid().ToString("N");
            }else
            {
                pinCode = _otpGenerator.GeneratePin();
            }


            // generate new OtpItem and save
            var otp = new OtpDto()
            {
                OperationId = Guid.NewGuid(),
                Pin = pinCode,

                SendTo = input.SendTo,
                SendType = input.SendType,
                RecipientId = input.RecipientId,
                RecipientType = input.RecipientType,
                ActionType = input.ActionType,
            };

            // send otp
            if (settings.IgnoreOtpValidation)
            {
                otp.SendStatus = OtpSendStatus.Ignored;
            } else
            {
                try
                {
                    otp.SentOn = DateTime.Now;

                    await _otpServiceHelper.SendInternal(otp);
                    
                    otp.SendStatus = OtpSendStatus.Sent;
                }
                catch (Exception e)
                {
                    otp.SendStatus = OtpSendStatus.Failed;
                    otp.ErrorMessage = e.FullMessage();
                }
            }

            // set expiration and save
            var lifeTime = input.Lifetime.HasValue && input.Lifetime.Value != 0 
                ? input.Lifetime .Value
                : settings.DefaultLifetime;

            otp.ExpiresOn = DateTime.Now.AddSeconds(lifeTime);

            await _otpStorage.SaveAsync(otp);
            
            // return response
            var response = new SendPinResponse
            {
                OperationId = otp.OperationId,
                SentTo = otp.SendTo
            };
            return response;
        }

        public async Task<ISendPinResponse> SendPinWithConfig(string module, string otpConfig, string sourceEntityId, string sendTo)
        {
            var config = await _otpServiceHelper.GetOtpConfigAsync(module, otpConfig);
            if (string.IsNullOrEmpty(sendTo))
                throw new UserFriendlyException("SendTo must be specified");

            var pinCode = _otpServiceHelper.GenerateOtpCode(config.SendType ?? OtpSendType.Sms);
            var otp = _otpServiceHelper.CreateOtp(sendTo, config, sourceEntityId, pinCode);
            await _otpServiceHelper.SendOtpAsync(otp, config);
            await _otpStorage.SaveAsync(otp);

            return new SendPinResponse { OperationId = otp.OperationId, SentTo = otp.SendTo, ModuleName = config.Module.Name, ActionType = config.ActionType };
        }

        public async Task<SendPinResponse> SendPinToPersonWithConfig(string module, string otpConfig, string sourceEntityId, Guid personId)
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

            return new SendPinResponse { OperationId = otp.OperationId, SentTo = otp.SendTo, ModuleName = config.Module.Name, ActionType = config.ActionType };
        }

        /// <summary>
        /// Resend one-time-pin
        /// </summary>
        /// <summary>
        /// Resends the one-time pin (OTP) based on the provided input. Retrieves the OTP using the specified operation ID or composite key, 
        /// sends the OTP, and updates its status and expiration time. Uses default settings for lifetime if not provided.
        /// </summary>
        /// <param name="input">The input containing OTP operation details and optional lifetime.</param>
        /// <returns>A task that represents the asynchronous operation, with a response indicating the status of the resend operation.</returns>
        public async Task<ISendPinResponse> ResendPinAsync(IResendPinInput input)
        {
            var settings = await _otpSettings.OneTimePins.GetValueAsync();
            var otp = await _otpServiceHelper.GetOtpWithOperationId(input.OperationId);
            if (otp == null)
                otp = await _otpServiceHelper.GetOtpWithCompositeKey(input.ModuleName, input.ActionType, input.SourceEntityType.Value);

            return await _otpServiceHelper.ProcessOtpResendAsync(
                otp,
                input,
                async (otp) => await _otpServiceHelper.SendInternal(otp),
                async (otp) =>
                {
                    await _otpStorage.UpdateAsync(input.OperationId, newOtp =>
                    {
                        newOtp.SentOn = DateTime.Now;
                        newOtp.SendStatus = OtpSendStatus.Sent;
                        newOtp.ExpiresOn = DateTime.Now.AddSeconds(input.Lifetime ?? settings.DefaultLifetime);
                        return Task.CompletedTask;
                    });
                },
                settings.DefaultLifetime
            );
        }

        /// <summary>
        /// Resends the one-time pin (OTP) based on the provided input and specific OTP configuration. Retrieves the OTP using the specified operation ID or composite key,
        /// validates the notification template from the provided OTP configuration, sends the OTP, and updates its status and expiration time based on the configuration.
        /// </summary>
        /// <param name="input">The input containing OTP operation details and optional lifetime.</param>
        /// <param name="module">The module name associated with the OTP configuration.</param>
        /// <param name="otpConfig">The OTP configuration identifier to use for sending the OTP.</param>
        /// <returns>A task that represents the asynchronous operation, with a response indicating the status of the resend operation.</returns>
        public async Task<ISendPinResponse> ResendPinWithConfig(IResendPinInput input, string module, string otpConfig)
        {
            var otp = await _otpServiceHelper.GetOtpWithOperationId(input.OperationId);
            if (otp == null)
                otp = await _otpServiceHelper.GetOtpWithCompositeKey(input.ModuleName, input.ActionType, input.SourceEntityType.Value);

            var config = await _otpServiceHelper.GetOtpConfigAsync(module, otpConfig);
            if (config.NotificationTemplate == null || !config.NotificationTemplate.IsEnabled)
                throw new UserFriendlyException("Invalid or disabled notification template in config");

            return await _otpServiceHelper.ProcessOtpResendAsync(
                otp,
                input,
                async (otp) => await _otpServiceHelper.SendInternalWithConfig(otp, config),
                async (otp) =>
                {
                    await _otpStorage.UpdateAsync(input.OperationId, newOtp =>
                    {
                        newOtp.SentOn = DateTime.Now;
                        newOtp.SendStatus = OtpSendStatus.Sent;
                        newOtp.ExpiresOn = DateTime.Now.AddSeconds(input.Lifetime ?? config.Lifetime ?? 300);
                        return Task.CompletedTask;
                    });
                },
                config.Lifetime ?? 300
            );
        }


        /// <summary>
        /// Verify one-time-pin
        /// </summary>
        public async Task<IVerifyPinResponse> VerifyPinWithConfig(IVerifyPinInput input, string module, string otpConfig)
        {
            // Retrieve OTP settings
            var settings = await _otpSettings.OneTimePins.GetValueAsync();

            // Retrieve OTP details
            var pinDto = await _otpServiceHelper.RetrieveOtpAsync(input);

            // Retrieve OtpConfig using the provided config ID
            var config = await _otpServiceHelper.GetOtpConfigAsync(module, otpConfig);

            // Validate NotificationTemplate in OtpConfig
            if (config.NotificationTemplate == null || !config.NotificationTemplate.IsEnabled)
            {
                throw new UserFriendlyException("The notification template in the configuration is either invalid or disabled.");
            }

            // Validate OTP and return the response
            return _otpServiceHelper.ValidateOtp(pinDto, input, settings.IgnoreOtpValidation);
        }

        public async Task<IVerifyPinResponse> VerifyPinAsync(IVerifyPinInput input)
        {
            // Retrieve OTP settings
            var settings = await _otpSettings.OneTimePins.GetValueAsync();

            // Retrieve OTP details
            var pinDto = await _otpServiceHelper.RetrieveOtpAsync(input);

            // Validate OTP and return the response
            return _otpServiceHelper.ValidateOtp(pinDto, input, settings.IgnoreOtpValidation);
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