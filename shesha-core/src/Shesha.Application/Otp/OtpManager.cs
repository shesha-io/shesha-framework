using Abp.Dependency;
using Abp.Net.Mail;
using Abp.UI;
using Shesha.Domain.Enums;
using Shesha.Exceptions;
using Shesha.Otp.Configuration;
using Shesha.Otp.Dto;
using Shesha.Sms;
using System;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Otp
{
    /// <summary>
    /// Sends and verifies one-time pins
    /// </summary>
    public class OtpManager : IOtpManager, ITransientDependency
    {
        private readonly ISmsGatewayFactory _smsGatewayFactory;
        private readonly IEmailSender _emailSender;
        private readonly IOtpStorage _otpStorage;
        private readonly IOtpGenerator _otpGenerator;
        private readonly IOtpSettings _otpSettings;
        private readonly IOtpSendThrottle _sendThrottle;

        /// <summary>
        /// Default constructor
        /// </summary>
        public OtpManager(ISmsGatewayFactory smsGatewayFactory, IEmailSender emailSender, IOtpStorage otpStorage, IOtpGenerator passwordGenerator, IOtpSettings otpSettings, IOtpSendThrottle sendThrottle)
        {
            _smsGatewayFactory = smsGatewayFactory;
            _emailSender = emailSender;
            _otpStorage = otpStorage;
            _otpGenerator = passwordGenerator;
            _otpSettings = otpSettings;
            _sendThrottle = sendThrottle;
        }

        /// inheritedDoc
        public async Task<IOtpDto> GetAsync(Guid operationId)
        {
            return await _otpStorage.GetAsync(operationId);
        }

        /// inheritedDoc
        public async Task<bool> TryConsumeAsync(Guid operationId)
        {
            return await _otpStorage.TryConsumeAsync(operationId);
        }

        /// inheritedDoc
        public async Task<ISendPinResponse> ResendPinAsync(ResendPinInput input)
        {
            var settings = await _otpSettings.OneTimePins.GetValueAsync();
            var otp = await _otpStorage.GetAsync(input.OperationId);
            if (otp == null)
                throw new UserFriendlyException("OTP not found, try to request a new one");

            if (otp.ExpiresOn < DateTime.Now)
                throw new UserFriendlyException("OTP has expired, try to request a new one");

            if (otp.ConsumedOn.HasValue)
                throw new UserFriendlyException("OTP has already been used, try to request a new one");

            // resending doesn't reset the attempt counter, so the pin could no longer be verified
            if (otp.SendType != OtpSendType.EmailLink && otp.VerifyAttempts >= GetMaxVerifyAttempts(settings))
                throw new UserFriendlyException(TooManyAttemptsMessage);

            // note: we ignore _otpSettings.IgnoreOtpValidation here, the user pressed `resend` manually

            // resends count towards the same per-destination limits as new pins
            await _sendThrottle.CheckAndRegisterSendAsync(otp.SendTo, otp.SendType);

            // send otp
            var sendTime = DateTime.Now;
            try
            {
                await SendInternalAsync(otp);
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

        /// inheritedDoc
        public async Task<ISendPinResponse> SendPinAsync(SendPinInput input)
        {
            var settings = await _otpSettings.OneTimePins.GetValueAsync();
            if (string.IsNullOrWhiteSpace(input.SendTo))
                throw new Exception($"{input.SendTo} must be specified");

            // nothing is sent when validation is ignored (dev/QA), so there is nothing to throttle
            if (!settings.IgnoreOtpValidation)
                await _sendThrottle.CheckAndRegisterSendAsync(input.SendTo, input.SendType);

            string pinCode = "";

            if (input.SendType == OtpSendType.EmailLink)
            {
                // TODO: Generate password reset token
                pinCode = Guid.NewGuid().ToString("N");
            }
            else
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
            // record the send-attempt time regardless of the outcome so that the per-user OTP
            // cooldown works even when IgnoreOtpValidation is on (dev/QA) or the gateway fails.
            otp.SentOn = DateTime.Now;
            if (settings.IgnoreOtpValidation)
            {
                otp.SendStatus = OtpSendStatus.Ignored;
            }
            else
            {
                try
                {
                    await SendInternalAsync(otp);

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
                ? input.Lifetime.Value
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

        /// inheritedDoc
        public async Task<IVerifyPinResponse> VerifyPinAsync(VerifyPinInput input)
        {
            var settings = await _otpSettings.OneTimePins.GetValueAsync();
            if (!settings.IgnoreOtpValidation)
            {
                var pinDto = await _otpStorage.GetAsync(input.OperationId);
                if (pinDto == null || pinDto.ConsumedOn.HasValue)
                    return VerifyPinResponse.Failed("Wrong one time pin");

                var isEmailLink = pinDto.SendType == OtpSendType.EmailLink;

                // Email link tokens are random GUIDs and can't be brute-forced. They are also often opened more than
                // once (e.g. link scanners in mail clients), so the attempt limit only applies to numeric pins.
                if (!isEmailLink)
                {
                    // the attempt is counted before the pin is checked so that concurrent requests can't exceed the limit
                    var attempts = await _otpStorage.IncrementVerifyAttemptsAsync(input.OperationId);

                    // no attempt was counted: the OTP no longer exists, so the copy read above can't be trusted
                    if (attempts <= 0)
                        return VerifyPinResponse.Failed("Wrong one time pin");

                    if (attempts > GetMaxVerifyAttempts(settings))
                        return VerifyPinResponse.Failed(TooManyAttemptsMessage);
                }

                if (!PinMatches(pinDto.Pin, input.Pin))
                    return VerifyPinResponse.Failed(isEmailLink ? "Invalid email link" : "Wrong one time pin");

                if (pinDto.ExpiresOn < DateTime.Now)
                {
                    var message = isEmailLink ? "The link you have supplied has expired" : "One-time pin has expired, try to send a new one";
                    return VerifyPinResponse.Failed(message);
                }
            }

            return VerifyPinResponse.Success();
        }

        private const string TooManyAttemptsMessage = "Too many failed verification attempts. Please request a new code.";

        /// <summary>
        /// Maximum number of verification attempts per OTP, falling back to the default when not configured
        /// </summary>
        private static int GetMaxVerifyAttempts(OtpSettings settings)
        {
            return settings.MaxVerifyAttempts > 0
                ? settings.MaxVerifyAttempts
                : OtpDefaults.DefaultMaxVerifyAttempts;
        }

        /// <summary>
        /// Constant-time comparison of the pins to avoid leaking information through response timing
        /// </summary>
        private static bool PinMatches(string expected, string actual)
        {
            if (string.IsNullOrEmpty(expected) || actual == null)
                return false;

            return CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(expected), Encoding.UTF8.GetBytes(actual));
        }

        private async Task SendInternalAsync(OtpDto otp)
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
                        var smsGateway = await _smsGatewayFactory.GetSmsGatewayAsync();
                        await smsGateway.SendSmsAsync(otp.SendTo, messageBody);
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
                        string subjectTemplate;
                        string bodyTemplate;

                        if (otp.ActionType == OtpActionTypes.Registration)
                        {
                            subjectTemplate = !string.IsNullOrWhiteSpace(settings.DefaultRegistrationEmailSubjectTemplate)
                                ? settings.DefaultRegistrationEmailSubjectTemplate
                                : OtpDefaults.DefaultRegistrationEmailSubjectTemplate;
                            bodyTemplate = !string.IsNullOrWhiteSpace(settings.DefaultRegistrationEmailBodyTemplate)
                                ? settings.DefaultRegistrationEmailBodyTemplate
                                : OtpDefaults.DefaultRegistrationEmailBodyTemplate;
                        }
                        else
                        {
                            subjectTemplate = !string.IsNullOrWhiteSpace(settings.DefaultEmailSubjectTemplate)
                                ? settings.DefaultEmailSubjectTemplate
                                : OtpDefaults.DefaultEmailSubjectTemplate;
                            bodyTemplate = !string.IsNullOrWhiteSpace(settings.DefaultEmailBodyTemplate)
                                ? settings.DefaultEmailBodyTemplate
                                : OtpDefaults.DefaultEmailBodyTemplate;
                        }

                        var body = bodyTemplate.Replace("{{token}}", otp.Pin);
                        body = body.Replace("{{userid}}", otp.RecipientId);
                        // lets the link be verified in any browser, not only the one that requested it
                        body = body.Replace("{{operationId}}", otp.OperationId.ToString());
                        await _emailSender.SendAsync(otp.SendTo, subjectTemplate, body, true);
                        break;
                    }
                default:
                    throw new NotSupportedException($"unsupported {nameof(otp.SendType)}: {otp.SendType}");
            }
        }

    }
}
