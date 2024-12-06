using Abp.Domain.Repositories;
using Castle.Core.Logging;
using DocumentFormat.OpenXml.Spreadsheet;
using DocumentFormat.OpenXml.Wordprocessing;
using NHibernate.Linq;
using Shesha.Configuration;
using Shesha.Configuration.Email;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.Email.Dtos;
using Shesha.Notifications.Configuration;
using Shesha.Notifications.Dto;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Notifications
{
    public class EmailChannelSender : INotificationChannelSender
    {
        private readonly IEmailSettings _emailSettings;
        private readonly IRepository<UserTopicSubscription, Guid> _userTopicSubscriptionRepository;
        public ILogger Logger { get; set; } = NullLogger.Instance;

        public EmailChannelSender(IEmailSettings emailSettings, IRepository<UserTopicSubscription, Guid> userTopicSubscriptionRepository)
        {
            _emailSettings = emailSettings;
            _userTopicSubscriptionRepository = userTopicSubscriptionRepository;
        }

        public string GetRecipientId(Person person)
        {
            return person.EmailAddress1;
        }

        public async Task<string> GetRecipients(NotificationTopic topic)
        {
            var recipients = await _userTopicSubscriptionRepository.GetAll().Where(s => s.Topic.Id == topic.Id).Select(s => GetRecipientId(s.User)).ToListAsync();
            return string.Join(";", recipients);
        }


        private async Task<EmailSettings> GetSettings()
        {
            return await _emailSettings.EmailSettings.GetValueAsync();
        }

        /// <summary>
        /// 
        /// </summary>
        /// <returns></returns>
        private bool EmailsEnabled()
        {
            var enabled = _emailSettings.EmailSettings.GetValue().EmailsEnabled;
            if (!enabled)
                Logger.Warn("Emails are disabled");

            return enabled;
        }

        public async Task<SendStatus> SendAsync(Person fromPerson, Person toPerson, NotificationMessage message, string cc = "", List<EmailAttachment> attachments = null)
        {
            //if (message.Length > MaxMessageSize)
            //    throw new ArgumentException("Message exceeds the maximum allowed size for Email.");
            var settings = await GetSettings();

            if (!settings.EmailsEnabled)
            {
                Logger.Warn("Emails are disabled");
                return new SendStatus()
                {
                    IsSuccess = false,
                    Message = "Emails are disabled."
                };
            }

            using (var mail = BuildMessageWith(GetRecipientId(fromPerson), GetRecipientId(toPerson), message.Subject, message.Message, cc))
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
                    return new SendStatus()
                    {
                        IsSuccess = true,
                        Message = "Successfully Sent!"
                    };
                }
                catch (Exception e)
                {
                    // Log the exception
                    Logger.Error("Failed to send email", e);
                    return new SendStatus()
                    {
                        IsSuccess = false,
                        Message = e.Message
                    };
                }
            };
        }

        public Task<SendStatus> BroadcastAsync(NotificationTopic topic, string subject, string message, List<EmailAttachment> attachments = null)
        {
            using (var mail = BuildMessageWith(null, GetRecipients(topic).Result, subject, message, ""))
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
                    return Task.FromResult(new SendStatus()
                    {
                        IsSuccess = true,
                        Message = "Successfully Sent!"
                    });
                }
                catch (Exception e)
                {
                    // Log the exception
                    Logger.Error("Failed to send email", e);
                    return Task.FromResult(new SendStatus()
                    {
                        IsSuccess = false,
                        Message = e.Message
                    });
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
            var smtpSettings = await _emailSettings.SmtpSettings.GetValueAsync();

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
        /// <param name="cc"></param>
        /// <returns></returns>
        private MailMessage BuildMessageWith(string fromAddress, string toAddress, string subject, string body, string cc = "")
        {
            var smtpSettings = _emailSettings.SmtpSettings.GetValue();
            var message = new MailMessage
            {
                Subject = (subject ?? "").Replace("\r", " ").Replace("\n", " ").RemoveDoubleSpaces(),
                Body = body.WrapAsHtmlDocument(),
                IsBodyHtml = true,
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
