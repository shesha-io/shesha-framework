using Abp.Dependency;
using Abp.Net.Mail;
using Abp.UI;
using Shesha.Domain.Enums;
using Shesha.Exceptions;
using Shesha.Otp.Configuration;
using Shesha.Otp.Dto;
using Shesha.Sms;
using System;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Shesha.Otp
{
    public class OtpManager : IOtpManager, ITransientDependency
    {
        private readonly ISmsGatewayFactory _smsGatewayFactory;
        private readonly IEmailSender _emailSender;
        private readonly IOtpStorage _otpStorage;
        private readonly IOtpGenerator _otpGenerator;
        private readonly IOtpSettings _otpSettings;

        public OtpManager(ISmsGatewayFactory smsGatewayFactory, IEmailSender emailSender, IOtpStorage otpStorage, IOtpGenerator passwordGenerator, IOtpSettings otpSettings)
        {
            _smsGatewayFactory = smsGatewayFactory;
            _emailSender = emailSender;
            _otpStorage = otpStorage;
            _otpGenerator = passwordGenerator;
            _otpSettings = otpSettings;
        }

        /// inheritedDoc
        public async Task<IOtpDto?> GetOrNullAsync(Guid operationId)
        {
            return await _otpStorage.GetOrNullAsync(operationId);
        }

        public async Task<ISendPinResponse> ResendPinAsync(ResendPinInput input)
        {
            var settings = await _otpSettings.OneTimePins.GetValueAsync();
            var otp = await _otpStorage.GetOrNullAsync(input.OperationId);
            if (otp == null)
                throw new UserFriendlyException("OTP not found, try to request a new one");

            if (otp.ExpiresOn < DateTime.Now)
                throw new UserFriendlyException("OTP has expired, try to request a new one");

            // note: we ignore _otpSettings.IgnoreOtpValidation here, the user pressed `resend` manually

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

        public async Task<ISendPinResponse> SendPinAsync(SendPinInput input)
        {
            var settings = await _otpSettings.OneTimePins.GetValueAsync();
            if (string.IsNullOrWhiteSpace(input.SendTo))
                throw new Exception($"{input.SendTo} must be specified");

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
            if (settings.IgnoreOtpValidation)
            {
                otp.SendStatus = OtpSendStatus.Ignored;
            }
            else
            {
                try
                {
                    otp.SentOn = DateTime.Now;

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

        public async Task<IVerifyPinResponse> VerifyPinAsync(VerifyPinInput input)
        {
            var settings = await _otpSettings.OneTimePins.GetValueAsync();
            if (!settings.IgnoreOtpValidation)
            {
                var pinDto = await _otpStorage.GetOrNullAsync(input.OperationId);
                if (pinDto == null || pinDto.Pin != input.Pin)
                {
                    var message = pinDto?.SendType == OtpSendType.EmailLink
                        ? "Invalid email link"
                        : "Wrong one time pin";
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
                        var subjectTemplate = settings.DefaultEmailSubjectTemplate;
                        var bodyTemplate = EscapeAmpersands(settings.DefaultEmailBodyTemplate);
                        var isRegistration = otp.ActionType == OtpActionTypes.EmailRegistration;
                        if (isRegistration)
                            bodyTemplate = AddRegistrationLinkParameters(bodyTemplate);

                        var body = bodyTemplate.Replace("{{token}}", otp.Pin);
                        body = body.Replace("{{userid}}", otp.RecipientId);
                        // lets the link be verified in any browser, not only the one that requested it
                        body = body.Replace("{{operationId}}", otp.OperationId.ToString());
                        body = body.Replace("{{isRegistration}}", isRegistration ? "true" : "false");
                        await _emailSender.SendAsync(otp.SendTo, subjectTemplate, body, true);
                        break;
                    }
                default:
                    throw new NotSupportedException($"unsupported {nameof(otp.SendType)}: {otp.SendType}");
            }
        }

        /// <summary>
        /// Registration links need the operation id and the registration flag to work in a browser other than the one that requested
        /// them. Templates saved before the <c>{{operationId}}</c> placeholder existed don't have them, so they're added after the token.
        /// </summary>
        public static string AddRegistrationLinkParameters(string bodyTemplate)
        {
            if (string.IsNullOrEmpty(bodyTemplate) || bodyTemplate.Contains("{{operationId}}") || !bodyTemplate.Contains("{{token}}"))
                return bodyTemplate;

            return bodyTemplate.Replace("{{token}}", "{{token}}&amp;operationId={{operationId}}&amp;isRegistration=true");
        }

        /// <summary>
        /// Matches an <c>&amp;</c> that doesn't already start an HTML character reference such as <c>&amp;amp;</c> or <c>&amp;#38;</c>.
        /// </summary>
        private static readonly Regex RawAmpersand = new Regex("&(?![a-zA-Z][a-zA-Z0-9]*;|#[0-9]+;|#[xX][0-9a-fA-F]+;)", RegexOptions.Compiled);

        /// <summary>
        /// Escapes the raw <c>&amp;</c> characters in an HTML email body as <c>&amp;amp;</c>, leaving existing character references alone.
        /// A raw <c>&amp;</c> in a link can be read as an HTML entity even without the closing <c>;</c>: mail clients turn
        /// <c>&amp;registration=1</c> into <c>®istration=1</c>, which breaks the link.
        /// </summary>
        public static string EscapeAmpersands(string html)
        {
            return string.IsNullOrEmpty(html)
                ? html
                : RawAmpersand.Replace(html, "&amp;");
        }
    }
}
