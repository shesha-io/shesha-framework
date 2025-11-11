using Abp.UI;
using Castle.Core.Logging;
using Shesha.Configuration;
using Shesha.Configuration.Email;
using Shesha.Domain;
using Shesha.Email;
using Shesha.Email.Dtos;
using Shesha.Notifications.Dto;
using Shesha.Notifications.MessageParticipants;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.Net.Mail;
using System.Threading.Tasks;

namespace Shesha.Notifications
{
    public class EmailChannelSender : INotificationChannelSender
    {
        private readonly IEmailSettings _emailSettings;
        public ILogger Logger { get; set; } = NullLogger.Instance;

        public EmailChannelSender(IEmailSettings emailSettings)
        {
            _emailSettings = emailSettings;
        }

        public string? GetRecipientId(Person person)
        {
            return person?.EmailAddress1;
        }

        private async Task<EmailSettings> GetSettingsAsync()
        {
            return await _emailSettings.EmailSettings.GetValueAsync();
        }

        public async Task<SendStatus> SendAsync(IMessageSender? sender, IMessageReceiver receiver, NotificationMessage message, List<EmailAttachment>? attachments = null)
        {
            var settings = await GetSettingsAsync();

            if (settings == null)
                return SendStatus.Failed("Email settings are not configured");

            if (!settings.EmailsEnabled)
            {
                Logger.Warn("Emails are disabled");
                return SendStatus.Failed("Emails are disabled");
            }

            var toAddress = !string.IsNullOrWhiteSpace(settings.RedirectAllMessagesTo)
                ? settings.RedirectAllMessagesTo 
                : receiver.GetAddress(this);
            if (string.IsNullOrWhiteSpace(toAddress))
                return SendStatus.Failed("Recipient address is empty");

            using (var mail = BuildMessageWith(sender?.GetAddress(this), toAddress, message.Subject, message.Message, message.Cc))
            {
                if (attachments != null)
                {
                    foreach (var attachment in attachments)
                    {
                        mail.Attachments.Add(new Attachment(attachment.Stream, attachment.FileName));
                    }
                }
                try
                {
                    await SendEmailAsync(mail);
                    return SendStatus.Success();
                }
                catch (Exception e)
                {
                    Logger.Error("Failed to send email", e);
                    return SendStatus.Failed(e.Message);
                }
            };
        }

        #region private methods

        /// <summary>
        /// 
        /// </summary>
        /// <param name="mail"></param>
        private async Task SendEmailAsync(MailMessage mail)
        {
            try
            {
                var mimeMessage = MailKitEmailHelper.ConvertToMimeMessage(mail);
                var smtpSettings = await _emailSettings.SmtpSettings.GetValueAsync();
                await MailKitEmailHelper.SendAsync(mimeMessage, smtpSettings);
            }
            catch (Exception ex)
            {
                Logger.Error($"Error sending email: {ex.Message}", ex);
                throw new InvalidOperationException($"An error occurred while sending the email. Message: {ex.Message} ", ex);
            }
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="fromAddress"></param>
        /// <param name="toAddress"></param>
        /// <param name="subject"></param>
        /// <param name="body"></param>
        /// <param name="cc"></param>
        /// <returns></returns>
        private MailMessage BuildMessageWith(string? fromAddress, string toAddress, string subject, string body, string? cc = null)
        {
            var smtpSettings = _emailSettings.SmtpSettings.GetValue();
            var message = new MailMessage
            {
                Subject = (subject ?? "").Replace("\r", " ").Replace("\n", " ").RemoveDoubleSpaces(),
                Body = body.WrapAsHtmlDocument(),
                IsBodyHtml = true,
            };

            if (string.IsNullOrWhiteSpace(fromAddress))
            {
                if (!StringHelper.IsValidEmail(smtpSettings.DefaultFromAddress))
                {
                    throw new UserFriendlyException("Default from address is not valid!");
                }

                message.From = new MailAddress(smtpSettings.DefaultFromAddress);
            }
            else if (StringHelper.IsValidEmail(fromAddress))
            {
                message.From = new MailAddress(fromAddress);
            }
            else
            {
                throw new ArgumentException("Invalid email address provided.");
            }

            string[] tos = toAddress.Split(';');

            foreach (string to in tos)
            {
                if (StringHelper.IsValidEmail(to))
                {
                    message.To.Add(new MailAddress(to.Trim()));
                }
                else
                {
                    throw new ArgumentException($"Invalid 'to' email address: {to}");
                }
            }

            if (!string.IsNullOrEmpty(cc))
            {
                string[] copies = cc.Split(',');
                foreach (var copyAddress in copies)
                {
                    var trimmedCopy = copyAddress.Trim();
                    if (StringHelper.IsValidEmail(trimmedCopy))
                    {
                        message.CC.Add(new MailAddress(trimmedCopy));
                    }
                    else
                    {
                        throw new ArgumentException($"Invalid 'cc' email address: {trimmedCopy}");
                    }
                }
            }

            return message;
        }

        #endregion
    }
}
