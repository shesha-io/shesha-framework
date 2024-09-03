using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Net.Mail;
using Abp.UI;
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

        public OtpAppService(ISmsGateway smsGateway, IEmailSender emailSender, IOtpStorage otpStorage, IOtpGenerator passwordGenerator, IOtpSettings otpSettings, IRepository<OtpConfig, Guid> otpConfigRepository)
        {
            _smsGateway = smsGateway;
            _emailSender = emailSender;
            _otpStorage = otpStorage;
            _otpGenerator = passwordGenerator;
            _otpSettings = otpSettings;
            _otpConfigRepository = otpConfigRepository;
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

                    await SendInternal(otp);
                    
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

        public async Task<SendPinResponse> SendPinWithConfig(Guid otpConfigId, string sourceEntityId, string sendTo)
        {

            //Retrieve OtpConfig using provided ID
            var config = await _otpConfigRepository.GetAsync(otpConfigId);
            if (config == null)
            {
                throw new UserFriendlyException("Invalid OTP Config");
            }

            //Validate inputs
            if (string.IsNullOrEmpty(sendTo))
            {
                throw new UserFriendlyException("SendTo must be specified");
            }

            //Extract settings from OtpConfig
            var moduleName = config.Module.Name;
            var sendType = config.SendType ?? throw new UserFriendlyException("SendType must be specified within config");
            var recipientType = config.RecipientType;
            var lifetime = config.Lifetime ?? 300; //Default to 5 minutes when no lifetime is provided in config
            var actionType = config.ActionType;

            //Generate OTP Based on sendType
            string otpCode = sendType == OtpSendType.EmailLink ? Guid.NewGuid().ToString("N") : _otpGenerator.GeneratePin();

            //Create OtpAuditItem And save initial details
            var otpAuditItem = new OtpDto
            {
                OperationId = Guid.NewGuid(),
                SendTo = sendTo,
                SendType = sendType,
                RecipientId = null,
                RecipientType = recipientType ?? null,
                ActionType = actionType,
                ModuleName = moduleName,
                Pin = otpCode,
                ExpiresOn = DateTime.Now.AddSeconds(lifetime),
                SentOn = DateTime.Now,
                SourceEntityId = Guid.Parse(sourceEntityId) //Ensures Valid Guid for sourceEntityId
            };

            try
            {
                //Prepare and send the Otp using notificationTemplate
                if (config.NotificationTemplate == null || !config.NotificationTemplate.IsEnabled)
                    throw new UserFriendlyException("Invalid or disabled NotifiactionTemplate in Config");

                var messageBody = config.NotificationTemplate.Body;
                // Replace message placeholders with data
                //foreach (var key in messageData.Keys)
                //{
                //    messageBody = messageBody.Replace($"{{{{{key}}}}}", messageData[key]);
                //}
                //messageBody = messageBody.Replace($"{{{{{key}}}}}", messageData[key])

                // Perform the actual send operation (implement SendInternal to handle different send types)
                await SendInternalWithConfig(otpAuditItem, config);

                otpAuditItem.SendStatus = OtpSendStatus.Sent;
            }
            catch (Exception ex)
            {
                otpAuditItem.SendStatus = OtpSendStatus.Failed;
                otpAuditItem.ErrorMessage = ex.Message;
            }

            // Save audit item
            await _otpStorage.SaveAsync(otpAuditItem);

            // Return response
            return new SendPinResponse
            {
                OperationId = otpAuditItem.OperationId,
                SentTo = otpAuditItem.SendTo,
                ModuleName = moduleName,
                ActionType = actionType,
                SourceEntityId = Guid.Parse(sourceEntityId)
            };
        }

        /// <summary>
        /// Resend one-time-pin
        /// </summary>
        public async Task<ISendPinResponse> ResendPinAsync(IResendPinInput input)
        {
            var settings = await _otpSettings.OneTimePins.GetValueAsync();
            var otp = await _otpStorage.GetAsync(input.OperationId);
            if (otp == null)
                throw new UserFriendlyException("OTP not found, try to request a new one");

            if (otp.ExpiresOn < DateTime.Now)
                throw new UserFriendlyException("OTP has expired, try to request a new one");

            // note: we ignore _otpSettings.IgnoreOtpValidation here, the user pressed `resend` manually

            // send otp
            var sendTime = DateTime.Now;
            try
            {
                await SendInternal(otp);
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

        public async Task<ISendPinResponse> ResendPinWithConfig(IResendPinInput input, Guid OtpConfigId)
        {
            // Retrieve OTP details
            var otp = await _otpStorage.GetAsync(input.OperationId);
            if (otp == null)
                throw new UserFriendlyException("OTP not found, try to request a new one");

            // Check OTP expiration
            if (otp.ExpiresOn < DateTime.Now)
                throw new UserFriendlyException("OTP has expired, try to request a new one");

            // Fetch OtpConfig based on ModuleName and ActionType stored in OtpDto
            
            var config = await _otpConfigRepository.GetAsync(OtpConfigId);
            if (config == null)
                throw new UserFriendlyException("Unable to find the matching OTP configuration");

            // Validate NotificationTemplate
            if (config.NotificationTemplate == null || !config.NotificationTemplate.IsEnabled)
                throw new UserFriendlyException("Invalid or disabled notification template in config");

            // Prepare to resend the OTP
            var sendTime = DateTime.Now;
            try
            {
                // Send using the new method with config
                await SendInternalWithConfig(otp, config);

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


        private async Task SendInternal(OtpDto otp)
        {
            var settings = await _otpSettings.OneTimePins.GetValueAsync();
            switch (otp.SendType)
            {
                case OtpSendType.Sms:
                {
                    var bodyTemplate = settings.DefaultBodyTemplate;
                    if (string.IsNullOrWhiteSpace(bodyTemplate))
                        bodyTemplate = OtpDefaults.DefaultBodyTemplate;

                    // todo: use mustache
                    var messageBody = bodyTemplate.Replace("{{password}}", otp.Pin);
                    await _smsGateway.SendSmsAsync(otp.SendTo, messageBody);
                    break;
                }
                case OtpSendType.Email:
                {
                    var bodyTemplate = settings.DefaultBodyTemplate;
                    var subjectTemplate = settings.DefaultSubjectTemplate;

                    var body = bodyTemplate.Replace("{{password}}", otp.Pin);
                    var subject= subjectTemplate.Replace("{{password}}", otp.Pin);

                    await _emailSender.SendAsync(otp.SendTo, subject, body, false);
                    break;
                }
                case OtpSendType.EmailLink:
                {
                    var subjectTemplate = settings.DefaultEmailSubjectTemplate;
                    var bodyTemplate  = settings.DefaultEmailBodyTemplate;

                    var body = bodyTemplate.Replace("{{token}}", otp.Pin);
                    body = body.Replace("{{userid}}", otp.RecipientId);
                    await _emailSender.SendAsync(otp.SendTo, subjectTemplate, body, true);
                    break;
                }
                default:
                    throw new NotSupportedException($"unsupported {nameof(otp.SendType)}: {otp.SendType}");
            }
        }

        private async Task SendInternalWithConfig(OtpDto otpAuditItem, OtpConfig config)
        {
            //Extract templates from OtpConfig
            var notificationTemplate = config.NotificationTemplate;

            var bodyTemplate = notificationTemplate.Body;
            var subjectTemplate = notificationTemplate.Subject ?? "One Time Pin"; // Default subject if not specified

            // Replace placeholders with actual OTP and recipient details
            string messageBody = bodyTemplate.Replace("{{password}}", otpAuditItem.Pin); // Customize this as per your placeholder logic
            //messageBody = messageBody.Replace("{{userid}}", otpAuditItem.RecipientId); // Customize this as per the needs

            switch (otpAuditItem.SendType)
            {
                case OtpSendType.Sms:
                    // Send SMS using configured body template
                    await _smsGateway.SendSmsAsync(otpAuditItem.SendTo, messageBody);
                    break;

                case OtpSendType.Email:
                    // Send email using configured subject and body templates
                    string subject = subjectTemplate.Replace("{{password}}", otpAuditItem.Pin); // Customize subject if needed
                    await _emailSender.SendAsync(otpAuditItem.SendTo, subject, messageBody, false);
                    break;

                case OtpSendType.EmailLink:
                    // Customize the email body for link scenarios if needed
                    messageBody = messageBody.Replace("{{token}}", otpAuditItem.Pin); // Token placeholder replacement
                    await _emailSender.SendAsync(otpAuditItem.SendTo, subjectTemplate, messageBody, true);
                    break;

                default:
                    throw new NotSupportedException($"Unsupported {nameof(otpAuditItem.SendType)}: {otpAuditItem.SendType}");
            }
        }

        /// <summary>
        /// Verify one-time-pin
        /// </summary>
        public async Task<IVerifyPinResponse> VerifyPinAsync(IVerifyPinInput input)
        {
            var settings = await _otpSettings.OneTimePins.GetValueAsync();
            if (!settings.IgnoreOtpValidation)
            {
                var pinDto = await _otpStorage.GetAsync(input.OperationId);
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

        public async Task<IVerifyPinResponse> VerifyPinWithConfigAsync(IVerifyPinInput input, Guid otpConfigId)
        {
            // Retrieve OTP settings
            var settings = await _otpSettings.OneTimePins.GetValueAsync();

            // Retrieve OTP details based on the operation ID
            var pinDto = await _otpStorage.GetAsync(input.OperationId);
            if (pinDto == null)
            {
                return VerifyPinResponse.Failed("OTP not found, please request a new one.");
            }

            // Retrieve OtpConfig using the provided config ID
            var config = await _otpConfigRepository.GetAsync(otpConfigId);
            if (config == null)
            {
                throw new UserFriendlyException("Invalid OTP configuration.");
            }

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
        public async Task<IOtpDto> GetAsync(Guid operationId)
        {
            return await _otpStorage.GetAsync(operationId);
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