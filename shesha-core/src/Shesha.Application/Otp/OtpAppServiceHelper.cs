using Abp.Domain.Repositories;
using Abp.Net.Mail;
using Abp.UI;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.Otp.Configuration;
using Shesha.Otp.Dto;
using Shesha.Sms;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Otp
{
    public class OtpAppServiceHelper
    {
        private readonly IOtpSettings _otpSettings;
        private readonly ISmsGateway _smsGateway;
        private readonly IEmailSender _emailSender;
        private readonly IOtpStorage _otpStorage;
        private readonly IOtpGenerator _otpGenerator;
        private readonly IRepository<OtpConfig, Guid> _otpConfigRepository;
        public OtpAppServiceHelper(
        IOtpSettings otpSettings,
        ISmsGateway smsGateway,
        IEmailSender emailSender,
        IOtpStorage otpStorage,
        IOtpGenerator otpGenerator,
        IRepository<OtpConfig, Guid> otpConfigRepository)
        {
            _otpSettings = otpSettings;
            _smsGateway = smsGateway;
            _emailSender = emailSender;
            _otpStorage = otpStorage;
            _otpGenerator = otpGenerator;
            _otpConfigRepository = otpConfigRepository;
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
                        var subject = subjectTemplate.Replace("{{password}}", otp.Pin);

                        await _emailSender.SendAsync(otp.SendTo, subject, body, false);
                        break;
                    }
                case OtpSendType.EmailLink:
                    {
                        var subjectTemplate = settings.DefaultEmailSubjectTemplate;
                        var bodyTemplate = settings.DefaultEmailBodyTemplate;

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

        private async Task<OtpDto> GetOtpWithOperationId(Guid? operationId)
        {
            var otp = await _otpStorage.GetAsync(operationId.Value);
            if (otp == null)
                throw new UserFriendlyException("OperationId is invalid");

            return otp;
        }

        private async Task<OtpDto> GetOtpWithCompositeKey(string moduleName, string actionType, Guid sourceEntityId)
        {
            var otp = await _otpStorage.GetAsync(moduleName, actionType, sourceEntityId.ToString());
            if (otp == null)
                throw new UserFriendlyException("Combination of keys ins\'t linked to an Otp Item");

            return otp;
        }

        private async Task<OtpConfig> GetOtpConfigAsync(string module, string otpConfig)
        {
            var config = await _otpConfigRepository.FirstOrDefaultAsync(x => x.Name == otpConfig && x.Module.Name == module);
            if (config == null)
                throw new UserFriendlyException("Invalid OTP Config");
            return config;
        }

        private string GenerateOtpCode(OtpSendType sendType)
        {
            return sendType == OtpSendType.EmailLink ? Guid.NewGuid().ToString("N") : _otpGenerator.GeneratePin();
        }

        private OtpDto CreateOtp(string sendTo, OtpConfig config, string sourceEntityId, string pinCode, string recipientId = null)
        {
            return new OtpDto
            {
                OperationId = Guid.NewGuid(),
                SendTo = sendTo,
                SendType = config.SendType ?? throw new UserFriendlyException("SendType must be specified within config"),
                RecipientId = recipientId,
                RecipientType = config.RecipientType,
                ActionType = config.ActionType,
                ModuleName = config.Module.Name,
                Pin = pinCode,
                ExpiresOn = DateTime.Now.AddSeconds(config.Lifetime ?? 300), // Default to 5 minutes
                SentOn = DateTime.Now,
                SourceEntityId = !string.IsNullOrEmpty(sourceEntityId) ? Guid.Parse(sourceEntityId) : (Guid?)null
            };
        }

        private async Task SendOtpAsync(OtpDto otp, OtpConfig config)
        {
            if (config.NotificationTemplate == null || !config.NotificationTemplate.IsEnabled)
                throw new UserFriendlyException("Invalid or disabled NotificationTemplate in Config");

            try
            {
                await SendInternalWithConfig(otp, config);
                otp.SendStatus = OtpSendStatus.Sent;
            }
            catch (Exception ex)
            {
                otp.SendStatus = OtpSendStatus.Failed;
                otp.ErrorMessage = ex.Message;
            }
        }

        private string GetSendToAddress(Person person, OtpSendType? sendType)
        {
            if (sendType == OtpSendType.Sms)
                return !string.IsNullOrEmpty(person.MobileNumber1) ? person.MobileNumber1 : person.MobileNumber2 ?? throw new UserFriendlyException("No valid mobile number found");

            if (sendType == OtpSendType.Email || sendType == OtpSendType.EmailLink)
                return !string.IsNullOrEmpty(person.EmailAddress1) ? person.EmailAddress1 : person.EmailAddress2 ?? throw new UserFriendlyException("No valid email address found");

            throw new UserFriendlyException("Unsupported SendType in config");
        }
    }
}
