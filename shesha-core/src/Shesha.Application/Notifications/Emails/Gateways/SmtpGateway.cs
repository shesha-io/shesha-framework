using Shesha.Domain;
using Shesha.Email.Dtos;
using Shesha.Notifications.Configuration.Email;
using Shesha.Notifications.Configuration.Email.Gateways;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using Shesha.Notifications.Configuration;
using Castle.Core.Logging;
using Shesha.Utilities;

namespace Shesha.Notifications.Emails.Gateways
{
    public class SmtpGateway : IEmailGateway
    {
        public string Name => "SmtpGateway";

        private readonly IEmailGatewaySettings _emailGatewaySettings;
        private readonly INotificationSettings _notificationSettings;

        public ILogger Logger { get; set; } = NullLogger.Instance;

        public SmtpGateway(IEmailGatewaySettings emailGatewaySettings, INotificationSettings notificationSettings)
        {
            _emailGatewaySettings = emailGatewaySettings;   
            _notificationSettings = notificationSettings;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="fromPerson"></param>
        /// <param name="toPerson"></param>
        /// <param name="message"></param>
        /// <param name="isBodyHtml"></param>
        /// <param name="cc"></param>
        /// <param name="throwException"></param>
        /// <param name="attachments"></param>
        /// <returns></returns>
        /// <exception cref="NotImplementedException"></exception>
        public Task<bool> SendAsync(string fromPerson, string toPerson, NotificationMessage message, bool isBodyHtml, string cc = "", bool throwException = false, List<EmailAttachment> attachments = null)
        {
            // Send email via SMTP or email service provider
            using (var mail = BuildMessageWith(fromPerson, toPerson, message.Subject, message.Message, isBodyHtml, cc))
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
                    SendEmail(mail);
                    return Task.FromResult(true) ;
                }
                catch (Exception e)
                {
                    // Log the exception
                    Logger.Error("Failed to send email", e);
                    if (throwException)
                        throw;
                    return Task.FromResult(false);
                }
            };
        }

        public Task<Tuple<bool, string>> BroadcastAsync(string topicSubscribers, string subject, string message, List<EmailAttachment> attachments = null)
        {
            using (var mail = BuildMessageWith(null, topicSubscribers, subject, message, true))
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
                    SendEmail(mail);
                    return Task.FromResult(new Tuple<bool, string>(true, "Successfully Sent!"));
                }
                catch (Exception e)
                {
                    // Log the exception
                    Logger.Error("Failed to send email", e);
                    return Task.FromResult(new Tuple<bool, string>(true, e.Message));
                }
            };
        }

        #region private methods

        /// <summary>
        /// 
        /// </summary>
        /// <param name="mail"></param>
        private void SendEmail(MailMessage mail)
        {
            using (var smtpClient = GetSmtpClient().Result)
            {
                smtpClient.Send(mail);
            }
        }

        /// <summary>
        /// Returns SmtpClient configured according to the current application settings
        /// </summary>
        private async Task<SmtpClient> GetSmtpClient()
        {
            var smtpSettings = await _emailGatewaySettings.SmtpSettings.GetValueAsync();

            var client = new SmtpClient(smtpSettings.Host, smtpSettings.Port)
            {
                EnableSsl = smtpSettings.EnableSsl,
                Credentials = string.IsNullOrWhiteSpace(smtpSettings.Domain)
                    ? new NetworkCredential(smtpSettings.UserName, smtpSettings.Password)
                    : new NetworkCredential(smtpSettings.UserName, smtpSettings.Password, smtpSettings.Domain)
            };

            return client;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="fromAddress"></param>
        /// <param name="toAddress"></param>
        /// <param name="subject"></param>
        /// <param name="body"></param>
        /// <param name="isBodyHtml"></param>
        /// <param name="cc"></param>
        /// <returns></returns>
        private MailMessage BuildMessageWith(string fromAddress, string toAddress, string subject, string body, bool isBodyHtml, string cc = "")
        {
            var smtpSettings = _emailGatewaySettings.SmtpSettings.GetValue();
            var message = new MailMessage
            {
                Subject = (subject ?? "").Replace("\r", " ").Replace("\n", " ").RemoveDoubleSpaces(),
                Body = isBodyHtml ? body.WrapAsHtmlDocument() : body,
                IsBodyHtml = isBodyHtml,
            };

            message.From = string.IsNullOrWhiteSpace(fromAddress) ? new MailAddress(smtpSettings.DefaultFromAddress) : new MailAddress(fromAddress);

            string[] tos = toAddress.Split(';');

            foreach (string to in tos)
            {
                message.To.Add(new MailAddress(to));
            }

            // Add "carbon copies" to email if defined
            if (!string.IsNullOrEmpty(cc))
            {
                string[] copies = cc.Split(',');
                foreach (var copyAddress in copies)
                {
                    message.CC.Add(new MailAddress(copyAddress.Trim()));
                }
            }

            return message;
        }

        #endregion
    }
}
