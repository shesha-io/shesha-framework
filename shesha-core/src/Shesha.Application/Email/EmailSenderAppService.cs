using Abp.Net.Mail;
using Abp.Runtime.Validation;
using Microsoft.AspNetCore.Mvc;
using Shesha.Configuration;
using Shesha.Email.Dtos;
using System;
using System.Threading.Tasks;

namespace Shesha.Email
{
    /// <summary>
    /// Email Sender Application Service
    /// </summary>
    public class EmailSenderAppService : SheshaAppServiceBase, IEmailSenderAppService
    {
        private readonly IEmailSender _emailSender;
        private readonly IEmailSettings _emailSettings;

        /// <summary>
        /// Default constructor
        /// </summary>
        public EmailSenderAppService(IEmailSettings emailSettings, IEmailSender emailSender)
        {
            _emailSettings = emailSettings;
            _emailSender = emailSender;
        }

        /// inheritDoc
        [Obsolete]
        [HttpPost]
        public async Task<bool> UpdateSmtpSettingsAsync(SmtpSettingsDto input)
        {
            await _emailSettings.EmailsEnabled.SetValueAsync(input.EmailsEnabled);
            await _emailSettings.RedirectAllMessagesTo.SetValueAsync(input.RedirectAllMessagesTo);
            await _emailSettings.SmtpSettings.SetValueAsync(new SmtpSettings { 
                Host = input.Host,
                Port = input.Port,
                Domain = input.Domain,
                UserName = input.UserName,
                Password = input.Password,
                EnableSsl = input.EnableSsl,
                DefaultFromAddress = input.DefaultFromAddress,
                DefaultFromDisplayName = input.DefaultFromDisplayName,
            });

            return true;
        }

        /// inheritDoc
        [Obsolete]
        [HttpGet]
        public async Task<SmtpSettingsDto> GetSmtpSettingsAsync()
        {
            var smtpSettings = await _emailSettings.SmtpSettings.GetValueAsync();

            var settings = new SmtpSettingsDto
            {
                Host = smtpSettings.Host,
                Port = smtpSettings.Port,
                Domain = smtpSettings.Domain,
                UserName = smtpSettings.UserName,
                Password = smtpSettings.Password,
                EnableSsl = smtpSettings.EnableSsl,
                DefaultFromAddress = smtpSettings.DefaultFromAddress,
                DefaultFromDisplayName = smtpSettings.DefaultFromDisplayName,
                SupportSmtpRelay = smtpSettings.UseSmtpRelay,

                RedirectAllMessagesTo = await _emailSettings.RedirectAllMessagesTo.GetValueAsync(),
                EmailsEnabled = await _emailSettings.EmailsEnabled.GetValueAsync(),
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
