using System.Threading.Tasks;
using Abp.Configuration;
using Abp.Net.Mail;
using Abp.Runtime.Session;
using Abp.Runtime.Validation;
using Microsoft.AspNetCore.Mvc;
using Shesha.Configuration;
using Shesha.Email.Dtos;
using Shesha.Utilities;

namespace Shesha.Email
{
    /// <summary>
    /// Email Sender Application Service
    /// </summary>
    public class EmailSenderAppService : SheshaAppServiceBase, IEmailSenderAppService
    {

        /// <summary>
        /// Reference to the current Session.
        /// </summary>
        public IAbpSession AbpSession { get; set; }

        private readonly ISettingManager _settingManager;
        private readonly IEmailSender _emailSender;

        /// <summary>
        /// Default constructor
        /// </summary>
        /// <param name="settingManager"></param>
        /// <param name="emailSender"></param>
        public EmailSenderAppService(ISettingManager settingManager, IEmailSender emailSender)
        {
            _settingManager = settingManager;
            _emailSender = emailSender;

            AbpSession = NullAbpSession.Instance;
        }

        /// inheritDoc
        [HttpPost]
        public async Task<bool> UpdateSmtpSettingsAsync(SmtpSettingsDto input)
        {
            await ChangeSettingAsync(EmailSettingNames.Smtp.Host, input.Host);
            await ChangeSettingAsync(EmailSettingNames.Smtp.Port, input.Port);
            await ChangeSettingAsync(EmailSettingNames.Smtp.Domain, input.Domain);
            await ChangeSettingAsync(EmailSettingNames.Smtp.UserName, input.UserName);
            await ChangeSettingAsync(EmailSettingNames.Smtp.Password, input.Password);
            await ChangeSettingAsync(EmailSettingNames.Smtp.EnableSsl, input.EnableSsl);
            await ChangeSettingAsync(EmailSettingNames.Smtp.UseDefaultCredentials, input.UseDefaultCredentials);

            await ChangeSettingAsync(EmailSettingNames.DefaultFromAddress, input.DefaultFromAddress);
            await ChangeSettingAsync(EmailSettingNames.DefaultFromDisplayName, input.DefaultFromDisplayName);
            await ChangeSettingAsync(SheshaSettingNames.Email.SupportSmtpRelay, input.SupportSmtpRelay);
            await ChangeSettingAsync(SheshaSettingNames.Email.RedirectAllMessagesTo, input.RedirectAllMessagesTo);
            await ChangeSettingAsync(SheshaSettingNames.Email.EmailsEnabled, input.EmailsEnabled);

            return true;
        }

        /// inheritDoc
        [HttpGet]
        public async Task<SmtpSettingsDto> GetSmtpSettingsAsync()
        {
            var settings = new SmtpSettingsDto
            {
                Host = await GetSettingValueAsync(EmailSettingNames.Smtp.Host),
                Port = (await GetSettingValueAsync(EmailSettingNames.Smtp.Port)).ToInt(0),
                Domain = await GetSettingValueAsync(EmailSettingNames.Smtp.Domain),
                UserName = await GetSettingValueAsync(EmailSettingNames.Smtp.UserName),
                Password = await GetSettingValueAsync(EmailSettingNames.Smtp.Password),
                EnableSsl = (await GetSettingValueAsync(EmailSettingNames.Smtp.EnableSsl)) == true.ToString(),
                UseDefaultCredentials = (await GetSettingValueAsync(EmailSettingNames.Smtp.UseDefaultCredentials)) == true.ToString(),

                DefaultFromAddress = await GetSettingValueAsync(EmailSettingNames.DefaultFromAddress),
                DefaultFromDisplayName = await GetSettingValueAsync(EmailSettingNames.DefaultFromDisplayName),
                SupportSmtpRelay = (await GetSettingValueAsync(SheshaSettingNames.Email.SupportSmtpRelay)) == true.ToString(),
                RedirectAllMessagesTo = await GetSettingValueAsync(SheshaSettingNames.Email.RedirectAllMessagesTo),
                EmailsEnabled = (await GetSettingValueAsync(SheshaSettingNames.Email.EmailsEnabled)) == true.ToString()
            };
            
            return settings;
        }

        /// inheritDoc
        [HttpPost]
        [EnableValidation]
        public async Task<SendTestEmailDto> SendEmail(SendTestEmailInput input)
        {
            /*
            // note: validation doesn't work for ControllerBase (looks like not supported by Abp)
            // todo: check support by the `Controller` and try it in the `ApplicationService`
            if (!ModelState.IsValid)
                throw new ValidationException();
            */
            
            await _emailSender.SendAsync(
                input.To,
                input.Subject,
                input.Body,
                false);

            return new SendTestEmailDto() { Success = true };
        }
    }
}
