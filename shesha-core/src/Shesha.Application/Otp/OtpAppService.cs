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


            // generate new pin and save
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
        public async Task<ISendPinResponse> ResendPinAsync(IResendPinInput input)
        {
            var settings = await _otpSettings.OneTimePins.GetValueAsync();
            var otp = await _otpServiceHelper.GetOtpWithOperationId(input.OperationId);
            if (otp == null)
                otp = await _otpServiceHelper.GetOtpWithCompositeKey(input.ModuleName, input.ActionType, input.SourceEntityType.Value);

            if (otp.ExpiresOn < DateTime.Now)
                throw new UserFriendlyException("OTP has expired, try to request a new one");

            // note: we ignore _otpSettings.IgnoreOtpValidation here, the user pressed `resend` manually

            // send otp
            var sendTime = DateTime.Now;
            try
            {
                await _otpServiceHelper.SendInternal(otp);
            }
            catch (Exception e)
            {
                await _otpStorage.UpdateAsync(input.OperationId, newOtp =>
                {
                    newOtp.SentOn = sendTime;
                    newOtp.SendStatus = OtpSendStatus.Failed;
                    newOtp.ErrorMessage = e.FullMessage();
                    
                    return Task.CompletedTask;
                });
            }
            
            // extend lifetime
            var lifeTime = input.Lifetime ?? settings.DefaultLifetime;
            var newExpiresOn = DateTime.Now.AddSeconds(lifeTime);

            await _otpStorage.UpdateAsync(input.OperationId, newOtp =>
            {
                newOtp.SentOn = sendTime;
                newOtp.SendStatus = OtpSendStatus.Sent;
                newOtp.ExpiresOn = newExpiresOn;

                return Task.CompletedTask;
            });

            // return response
            var response = new SendPinResponse
            {
                OperationId = otp.OperationId,
                SentTo = otp.SendTo
            };
            return response;
        }

        public async Task<ISendPinResponse> ResendPinWithConfig(IResendPinInput input, string module, string otpConfig)
        {
            // Retrieve OTP details
            var otp = await _otpServiceHelper.GetOtpWithOperationId(input.OperationId);
            if (otp == null)
                otp = await _otpServiceHelper.GetOtpWithCompositeKey(input.ModuleName, input.ActionType, input.SourceEntityType.Value);

            // Check OTP expiration
            if (otp.ExpiresOn < DateTime.Now)
                throw new UserFriendlyException("OTP has expired, try to request a new one");

            // Fetch OtpConfig based on ModuleName and ActionType stored in OtpDto

            var config = await _otpServiceHelper.GetOtpConfigAsync(module, otpConfig);

            // Validate NotificationTemplate
            if (config.NotificationTemplate == null || !config.NotificationTemplate.IsEnabled)
                throw new UserFriendlyException("Invalid or disabled notification template in config");

            // Prepare to resend the OTP
            var sendTime = DateTime.Now;
            try
            {
                // Send using the new method with config
                await _otpServiceHelper.SendInternalWithConfig(otp, config);

                // Update OTP status on successful send
                otp.SendStatus = OtpSendStatus.Sent;
                otp.SentOn = sendTime;
            }
            catch (Exception e)
            {
                // Handle send failure and update OTP status
                await _otpStorage.UpdateAsync(input.OperationId, newOtp =>
                {
                    newOtp.SentOn = sendTime;
                    newOtp.SendStatus = OtpSendStatus.Failed;
                    newOtp.ErrorMessage = e.Message;
                    return Task.CompletedTask;
                });
            }

            // Extend OTP lifetime based on input or default settings
            var lifeTime = input.Lifetime ?? config.Lifetime ?? 300; // Use config lifetime if available, otherwise default to 5 minutes
            var newExpiresOn = DateTime.Now.AddSeconds(lifeTime);

            // Update expiration and resend status
            await _otpStorage.UpdateAsync(input.OperationId, newOtp =>
            {
                newOtp.ExpiresOn = newExpiresOn;
                newOtp.SentOn = sendTime;
                newOtp.SendStatus = OtpSendStatus.Sent;
                return Task.CompletedTask;
            });

            // Return the resend response
            var response = new SendPinResponse
            {
                OperationId = otp.OperationId,
                SentTo = otp.SendTo,
                ModuleName = otp.ModuleName,
                ActionType = otp.ActionType,
                SourceEntityId = otp.SourceEntityId
            };
            return response;
        }

        /// <summary>
        /// Verify one-time-pin
        /// </summary>
        public async Task<IVerifyPinResponse> VerifyPinAsync(IVerifyPinInput input)
        {
            var settings = await _otpSettings.OneTimePins.GetValueAsync();
            if (!settings.IgnoreOtpValidation)
            {
                var pinDto = await _otpServiceHelper.GetOtpWithOperationId(input.OperationId);
                if (pinDto == null)
                    pinDto = await _otpServiceHelper.GetOtpWithCompositeKey(input.ModuleName, input.ActionType, input.SourceEntityType.Value);
                if (pinDto == null || pinDto.Pin != input.Pin)
                {
                    var message = pinDto.SendType == OtpSendType.EmailLink ? "Invalid email link" : "Wrong one time pin";
                    return VerifyPinResponse.Failed(message);
                }

                if (pinDto.ExpiresOn < DateTime.Now)
                {
                    var message = pinDto.SendType == OtpSendType.EmailLink ? "The link you have supplied has expired" : "One-time pin has expired, try to send a new one";
                    return VerifyPinResponse.Failed(message);
                }
            }

            return VerifyPinResponse.Success();
        }

        public async Task<IVerifyPinResponse> VerifyPinWithConfig(IVerifyPinInput input, string module, string otpConfig)
        {
            // Retrieve OTP settings
            var settings = await _otpSettings.OneTimePins.GetValueAsync();

            // Retrieve OTP details based on the operation ID && CompositeKey
            var pinDto = await _otpServiceHelper.GetOtpWithOperationId(input.OperationId);
            if (pinDto == null)
                pinDto = await _otpServiceHelper.GetOtpWithCompositeKey(input.ModuleName, input.ActionType, input.SourceEntityType.Value);

            // Retrieve OtpConfig using the provided config ID
            var config = await _otpServiceHelper.GetOtpConfigAsync(module, otpConfig);

            // Validate NotificationTemplate in OtpConfig
            if (config.NotificationTemplate == null || !config.NotificationTemplate.IsEnabled)
            {
                throw new UserFriendlyException("The notification template in the configuration is either invalid or disabled.");
            }

            // Validate OTP if global setting does not ignore OTP validation
            if (!settings.IgnoreOtpValidation)
            {
                // Check if the pin matches
                if (pinDto.Pin != input.Pin)
                {
                    // Use a custom message if the OtpConfig has special requirements
                    var errorMessage = pinDto.SendType == OtpSendType.EmailLink
                        ? "Invalid email link"
                        : "Incorrect one-time pin";

                    return VerifyPinResponse.Failed(errorMessage);
                }

                // Check if the OTP has expired
                if (pinDto.ExpiresOn < DateTime.Now)
                {
                    // Customize the expiration message using config settings if available
                    var expirationMessage = pinDto.SendType == OtpSendType.EmailLink
                        ? "The link you have supplied has expired"
                        :"One-time pin has expired, please request a new one";

                    return VerifyPinResponse.Failed(expirationMessage);
                }
            }

            // If all validations pass, return success
            return VerifyPinResponse.Success();
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