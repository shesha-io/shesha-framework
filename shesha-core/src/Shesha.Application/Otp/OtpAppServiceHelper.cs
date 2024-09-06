using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Net.Mail;
using Abp.UI;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.Otp.Configuration;
using Shesha.Otp.Dto;
using Shesha.Sms;
using System;
using System.Threading.Tasks;

namespace Shesha.Otp
{
    public class OtpAppServiceHelper : IOtpAppServiceHelper, ITransientDependency
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

        /// <summary>
        /// Sends an OTP based on the provided OtpDto, using the appropriate method (SMS or email) as specified in the OtpDto's SendType.
        /// </summary>
        /// <param name="otp">The OTP data transfer object containing details about the OTP to be sent.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        public async Task SendInternal(OtpDto otp)
        {
            var settings = await _otpSettings.OneTimePins.GetValueAsync();
            switch (otp.SendType)
            {
                case OtpSendType.Sms:
                    {
                        var bodyTemplate = settings.DefaultBodyTemplate ?? OtpDefaults.DefaultBodyTemplate;
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
                        var body = bodyTemplate.Replace("{{token}}", otp.Pin)
                                               .Replace("{{userid}}", otp.RecipientId);
                        await _emailSender.SendAsync(otp.SendTo, subjectTemplate, body, true);
                        break;
                    }
                default:
                    throw new NotSupportedException($"Unsupported {nameof(otp.SendType)}: {otp.SendType}");
            }
        }

        /// <summary>
        /// Sends an OTP based on the provided OtpDto and OtpConfig, using the configuration settings for templates and sending method.
        /// </summary>
        /// <param name="otpAuditItem">The OTP data transfer object containing details about the OTP to be sent.</param>
        /// <param name="config">The OTP configuration containing templates and settings for sending the OTP.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        public async Task SendInternalWithConfig(OtpDto otpAuditItem, OtpConfig config)
        {
            var notificationTemplate = config.NotificationTemplate;
            var bodyTemplate = notificationTemplate.Body;
            var subjectTemplate = notificationTemplate.Subject ?? "One Time Pin";

            string messageBody = bodyTemplate.Replace("{{password}}", otpAuditItem.Pin);

            switch (otpAuditItem.SendType)
            {
                case OtpSendType.Sms:
                    await _smsGateway.SendSmsAsync(otpAuditItem.SendTo, messageBody);
                    break;

                case OtpSendType.Email:
                    string subject = subjectTemplate.Replace("{{password}}", otpAuditItem.Pin);
                    await _emailSender.SendAsync(otpAuditItem.SendTo, subject, messageBody, false);
                    break;

                case OtpSendType.EmailLink:
                    messageBody = messageBody.Replace("{{token}}", otpAuditItem.Pin);
                    await _emailSender.SendAsync(otpAuditItem.SendTo, subjectTemplate, messageBody, true);
                    break;

                default:
                    throw new NotSupportedException($"Unsupported {nameof(otpAuditItem.SendType)}: {otpAuditItem.SendType}");
            }
        }

        /// <summary>
        /// Retrieves an OTP based on the provided operation ID.
        /// </summary>
        /// <param name="operationId">The operation ID of the OTP to retrieve.</param>
        /// <returns>A task representing the asynchronous operation, with the OTP data transfer object if found.</returns>
        /// <exception cref="UserFriendlyException">Thrown if the operation ID is invalid.</exception>
        public async Task<OtpDto> GetOtpWithOperationId(Guid? operationId)
        {
            var otp = await _otpStorage.GetAsync(operationId.Value);
            if (otp == null)
                throw new UserFriendlyException("OperationId is invalid");

            return otp;
        }

        /// <summary>
        /// Retrieves an OTP based on the provided composite key (module name, action type, and source entity ID).
        /// </summary>
        /// <param name="moduleName">The module name associated with the OTP.</param>
        /// <param name="actionType">The action type associated with the OTP.</param>
        /// <param name="sourceEntityId">The source entity ID associated with the OTP.</param>
        /// <returns>A task representing the asynchronous operation, with the OTP data transfer object if found.</returns>
        /// <exception cref="UserFriendlyException">Thrown if the combination of keys is not linked to an OTP item.</exception>
        public async Task<OtpDto> GetOtpWithCompositeKey(string moduleName, string actionType, Guid sourceEntityId)
        {
            var otp = await _otpStorage.GetAsync(moduleName, actionType, sourceEntityId.ToString());
            if (otp == null)
                throw new UserFriendlyException("Combination of keys isn't linked to an Otp Item");

            return otp;
        }

        /// <summary>
        /// Retrieves an OTP configuration based on the provided module and OTP configuration name.
        /// </summary>
        /// <param name="module">The module name associated with the OTP configuration.</param>
        /// <param name="otpConfig">The OTP configuration name.</param>
        /// <returns>A task representing the asynchronous operation, with the OTP configuration if found.</returns>
        /// <exception cref="UserFriendlyException">Thrown if the OTP configuration is invalid.</exception>
        public async Task<OtpConfig> GetOtpConfigAsync(string module, string otpConfig)
        {
            var config = await _otpConfigRepository.FirstOrDefaultAsync(x => x.Name == otpConfig && x.Module.Name == module);
            if (config == null)
                throw new UserFriendlyException("Invalid OTP Config");
            return config;
        }

        /// <summary>
        /// Generates an OTP code based on the send type.
        /// </summary>
        /// <param name="sendType">The type of sending method (e.g., SMS or email).</param>
        /// <returns>The generated OTP code.</returns>
        public string GenerateOtpCode(OtpSendType sendType)
        {
            return sendType == OtpSendType.EmailLink ? Guid.NewGuid().ToString("N") : _otpGenerator.GeneratePin();
        }

        /// <summary>
        /// Creates an OTP data transfer object with the provided details.
        /// </summary>
        /// <param name="sendTo">The address to which the OTP will be sent.</param>
        /// <param name="config">The OTP configuration containing settings for the OTP.</param>
        /// <param name="sourceEntityId">The source entity ID associated with the OTP.</param>
        /// <param name="pinCode">The OTP code.</param>
        /// <param name="recipientId">The recipient ID (optional).</param>
        /// <returns>The created OTP data transfer object.</returns>
        public OtpDto CreateOtp(string sendTo, OtpConfig config, string sourceEntityId, string pinCode, string recipientId = null)
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

        /// <summary>
        /// Sends an OTP and updates its status based on the outcome of the sending operation.
        /// </summary>
        /// <param name="otp">The OTP data transfer object containing details about the OTP to be sent.</param>
        /// <param name="config">The OTP configuration containing settings for the OTP.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        public async Task SendOtpAsync(OtpDto otp, OtpConfig config)
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

        /// <summary>
        /// Gets the appropriate address to send the OTP based on the person's details and the OTP sending type.
        /// </summary>
        /// <param name="person">The person to whom the OTP will be sent.</param>
        /// <param name="sendType">The type of sending method (e.g., SMS or email).</param>
        /// <returns>The address to send the OTP to.</returns>
        /// <exception cref="UserFriendlyException">Thrown if no valid address is found for the specified send type.</exception>
        public string GetSendToAddress(Person person, OtpSendType? sendType)
        {
            if (sendType == OtpSendType.Sms)
                return !string.IsNullOrEmpty(person.MobileNumber1) ? person.MobileNumber1 : person.MobileNumber2 ?? throw new UserFriendlyException("No valid mobile number found");

            if (sendType == OtpSendType.Email || sendType == OtpSendType.EmailLink)
                return !string.IsNullOrEmpty(person.EmailAddress1) ? person.EmailAddress1 : person.EmailAddress2 ?? throw new UserFriendlyException("No valid email address found");

            throw new UserFriendlyException("Unsupported SendType in config");
        }

        /// <summary>
        /// Retrieves an OTP based on the provided input, either by operation ID or composite key.
        /// </summary>
        /// <param name="input">The input containing the operation ID or composite key details.</param>
        /// <returns>A task representing the asynchronous operation, with the OTP data transfer object if found.</returns>
        public async Task<OtpDto> RetrieveOtpAsync(IVerifyPinInput input)
        {
            var pinDto = await GetOtpWithOperationId(input.OperationId);
            if (pinDto == null)
                pinDto = await GetOtpWithCompositeKey(input.ModuleName, input.ActionType, input.SourceEntityType.Value);

            return pinDto;
        }

        /// <summary>
        /// Validates the OTP against the provided input, considering whether OTP validation should be ignored.
        /// </summary>
        /// <param name="pinDto">The OTP data transfer object to validate.</param>
        /// <param name="input">The input containing the OTP to verify.</param>
        /// <param name="ignoreOtpValidation">Whether to ignore OTP validation.</param>
        /// <returns>The result of the OTP validation.</returns>
        public VerifyPinResponse ValidateOtp(OtpDto pinDto, IVerifyPinInput input, bool ignoreOtpValidation)
        {
            if (ignoreOtpValidation)
                return VerifyPinResponse.Success();

            if (pinDto == null || pinDto.Pin != input.Pin)
            {
                var message = GetInvalidPinMessage(pinDto.SendType);
                return VerifyPinResponse.Failed(message);
            }

            if (pinDto.ExpiresOn < DateTime.Now)
            {
                var message = GetExpiredPinMessage(pinDto.SendType);
                return VerifyPinResponse.Failed(message);
            }

            return VerifyPinResponse.Success();
        }

        /// <summary>
        /// Gets the message for an invalid OTP based on the sending type.
        /// </summary>
        /// <param name="sendType">The type of sending method (e.g., SMS or email).</param>
        /// <returns>The message indicating that the OTP is invalid.</returns>
        public string GetInvalidPinMessage(OtpSendType sendType)
        {
            return sendType == OtpSendType.EmailLink ? "Invalid email link" : "Incorrect one-time pin";
        }

        /// <summary>
        /// Gets the message for an expired OTP based on the sending type.
        /// </summary>
        /// <param name="sendType">The type of sending method (e.g., SMS or email).</param>
        /// <returns>The message indicating that the OTP has expired.</returns>
        public string GetExpiredPinMessage(OtpSendType sendType)
        {
            return sendType == OtpSendType.EmailLink
                ? "The link you have supplied has expired"
                : "One-time pin has expired, please request a new one";
        }

        /// <summary>
        /// Processes the resending of an OTP, including updating its status and handling exceptions.
        /// </summary>
        /// <param name="otp">The OTP data transfer object to be resent.</param>
        /// <param name="input">The input containing details for resending the OTP.</param>
        /// <param name="sendOtpAction">The action to perform for sending the OTP.</param>
        /// <param name="updateOtpStatus">The action to perform for updating the OTP status.</param>
        /// <param name="defaultLifetime">The default lifetime for the OTP if not specified.</param>
        /// <returns>A task representing the asynchronous operation, with the result of the OTP resend.</returns>
        public async Task<SendPinResponse> ProcessOtpResendAsync(
            OtpDto otp,
            IResendPinInput input,
            Func<OtpDto, Task> sendOtpAction,
            Func<OtpDto, Task> updateOtpStatus,
            int defaultLifetime)
        {
            if (otp.ExpiresOn < DateTime.Now)
                throw new UserFriendlyException("OTP has expired, try to request a new one");

            var sendTime = DateTime.Now;
            try
            {
                await sendOtpAction(otp);
            }
            catch (Exception e)
            {
                await _otpStorage.UpdateAsync(input.OperationId, newOtp =>
                {
                    newOtp.SentOn = sendTime;
                    newOtp.SendStatus = OtpSendStatus.Failed;
                    newOtp.ErrorMessage = e.Message;
                    return Task.CompletedTask;
                });
            }

            var lifeTime = input.Lifetime ?? defaultLifetime;
            var newExpiresOn = DateTime.Now.AddSeconds(lifeTime);

            await updateOtpStatus(otp);

            return new SendPinResponse
            {
                OperationId = otp.OperationId,
                SentTo = otp.SendTo
            };
        }
    }
}
