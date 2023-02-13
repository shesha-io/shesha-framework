using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Abp.Dependency;
using Abp.Net.Mail.Smtp;
using Castle.Core.Logging;
using Shesha.Email.Dtos;
using Shesha.Utilities;

namespace Shesha.Email
{
    public class SheshaEmailSender: SmtpEmailSender, ISheshaEmailSender, ITransientDependency
    {
        public ILogger Logger { get; set; } = NullLogger.Instance;
        private readonly ISmtpSettings _smtpSettings;
        private readonly IEmailImagesHelper _imagesHelper;

        public SheshaEmailSender(ISmtpEmailSenderConfiguration configuration, ISmtpSettings smtpSettings, IEmailImagesHelper imagesHelper) : base(configuration)
        {
            _smtpSettings = smtpSettings;
            _imagesHelper = imagesHelper;
        }
        

        public bool SendMail(string fromAddress, string toAddress, string subject, string body, bool isBodyHtml, List<EmailAttachment> attachments = null,
            string cc = "", bool throwException = false)
        {
            using (var mail = BuildMessageWith(fromAddress, toAddress, subject, body, cc))
            {
                mail.IsBodyHtml = isBodyHtml;
                if (attachments != null)
                {
                    foreach (var attachment in attachments)
                    {
                        mail.Attachments.Add(new Attachment(attachment.Stream, attachment.FileName));
                    }
                }
                return SendMail(mail, throwException);
            }
        }

        /// <summary>
        /// Returns SmtpClient configured according to the current application settings
        /// </summary>
        public SmtpClient GetSmtpClient()
        {
            var client = new SmtpClient(_smtpSettings.Host, _smtpSettings.Port)
            {
                EnableSsl = _smtpSettings.EnableSsl,
                Credentials = string.IsNullOrWhiteSpace(_smtpSettings.Domain)
                    ? new NetworkCredential(_smtpSettings.UserName, _smtpSettings.Password)
                    : new NetworkCredential(_smtpSettings.UserName, _smtpSettings.Password, _smtpSettings.Domain)
            };

            return client;
        }

        protected override async Task SendEmailAsync(MailMessage mail)
        {
            if (!_smtpSettings.EmailsEnabled)
                return;

            // change recipient if the redirect is configured (is used for testing)
            if (!PrepareAndCheckMail(mail))
                return;

            using (var smtpClient = GetSmtpClient())
            {
                await smtpClient.SendMailAsync(mail);
            }
        }

        /// <summary>
        /// Prepare mail and return true if it should be sent, otherwise - false
        /// </summary>
        /// <param name="mail">Mail to prepare</param>
        /// <returns></returns>
        private bool PrepareAndCheckMail(MailMessage mail)
        {
            // check recipient before redirect
            if (!mail.To.Any() || mail.To[0].Address == "")
            {
                Logger.Error("Attempt to send email to empty address. Subject: " + mail.Subject);
                return false;
            }

            if (!string.IsNullOrWhiteSpace(_smtpSettings.RedirectAllMessagesTo))
            {
                mail.To.Clear();
                mail.To.Add(_smtpSettings.RedirectAllMessagesTo);
                mail.CC.Clear();
                mail.Bcc.Clear();
            }

            return true;
        }

        protected override void SendEmail(MailMessage mail)
        {
            if (!_smtpSettings.EmailsEnabled)
                return;

            // change recipient if the redirect is configured (is used for testing)
            if (!PrepareAndCheckMail(mail))
                return;

            using (var smtpClient = GetSmtpClient())
            {
                smtpClient.Send(mail);
            }
        }


        private bool SendMail(MailMessage mail, bool throwException = false)
        {
            try
            {
                if (!_smtpSettings.EmailsEnabled)
                {
                    Logger.Warn("Emails are disabled");
                    return false;
                }

                using var smtp = GetSmtpClient();

                // change recipient if the redirect is configured (is used for testing)
                if (!PrepareAndCheckMail(mail))
                    return false;

                smtp.Send(mail);
                return true;
            }
            catch (Exception e)
            {
                // Log the exception
                Logger.Error("Failed to send email", e);
                if (throwException)
                    throw;
                return false;
            }
        }

        private MailMessage BuildMessageWith(string fromAddress, string toAddress, string subject, string body, string cc = "")
        {
            var message = new MailMessage
            {
                Subject = (subject ?? "").Replace("\r", " ").Replace("\n", " ").RemoveDoubleSpaces(),
                Body = body,
                IsBodyHtml = Regex.IsMatch(body, @"\</html>") && Regex.IsMatch(body, @"\</body\>"),
            };
            if (!string.IsNullOrWhiteSpace(fromAddress))
                message.From = new MailAddress(fromAddress);

            NormalizeMail(message);

            _imagesHelper.PrepareImages(message);

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

        /// <summary>
        /// Normalizes given email.
        /// Fills <see cref="MailMessage.From"/> if it's not filled before.
        /// Sets encodings to UTF8 if they are not set before.
        /// </summary>
        /// <param name="mail">Mail to be normalized</param>
        protected override void NormalizeMail(MailMessage mail)
        {
            if (mail.From == null || string.IsNullOrWhiteSpace(mail.From.Address))
            {
                if (_smtpSettings.SupportSmtpRelay && !string.IsNullOrWhiteSpace(_smtpSettings.DefaultFromAddress))
                {
                    mail.From = new MailAddress(
                        _smtpSettings.DefaultFromAddress,
                        _smtpSettings.DefaultFromDisplayName,
                        Encoding.UTF8
                    );
                }
                else
                {
                    mail.From = new MailAddress(
                        _smtpSettings.UserName,
                        null,
                        Encoding.UTF8
                    );
                }
            }

            mail.HeadersEncoding ??= Encoding.UTF8;
            mail.SubjectEncoding ??= Encoding.UTF8;
            mail.BodyEncoding ??= Encoding.UTF8;
        }
    }
}
