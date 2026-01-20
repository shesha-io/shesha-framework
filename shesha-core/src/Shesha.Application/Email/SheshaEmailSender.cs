using Abp.Dependency;
using Abp.Net.Mail.Smtp;
using Castle.Core.Logging;
using Shesha.Configuration;
using Shesha.Configuration.Email;
using Shesha.Email.Dtos;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Email
{
    public class SheshaEmailSender: SmtpEmailSender, ISheshaEmailSender, ITransientDependency
    {
        public ILogger Logger { get; set; } = NullLogger.Instance;
        private readonly IEmailSettings _emailSettings;
        private readonly IEmailImagesHelper _imagesHelper;

        public SheshaEmailSender(ISmtpEmailSenderConfiguration configuration, IEmailSettings emailSettings, IEmailImagesHelper imagesHelper) : base(configuration)
        {
            _emailSettings = emailSettings;
            _imagesHelper = imagesHelper;
        }

        private bool EmailsEnabled() 
        {
            var enabled = _emailSettings.EmailSettings.GetValue().EmailsEnabled;
            if (!enabled)
                Logger.Warn("Emails are disabled");

            return enabled;
        }

        public bool SendMail(string fromAddress, string toAddress, string subject, string body, bool isBodyHtml, List<EmailAttachment>? attachments = null,
            string cc = "", bool throwException = false)
        {
            if (!EmailsEnabled())
                return false;

            using (var mail = BuildMessageWith(fromAddress, toAddress, subject, body, isBodyHtml, cc))
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
        }

        protected override async Task SendEmailAsync(MailMessage mail)
        {
            if (!EmailsEnabled())
                return;

            var smtpSettings = await _emailSettings.SmtpSettings.GetValueAsync();

            // change recipient if the redirect is configured (is used for testing)
            if (!PrepareAndCheckMail(mail, smtpSettings))
                return;

            using var mimeMessage = MailKitEmailHelper.ConvertToMimeMessage(mail);
            await MailKitEmailHelper.SendAsync(mimeMessage, smtpSettings);
        }

        protected override void SendEmail(MailMessage mail)
        {
            if (!EmailsEnabled())
                return;

            var smtpSettings = _emailSettings.SmtpSettings.GetValue();

            // change recipient if the redirect is configured (is used for testing)
            if (!PrepareAndCheckMail(mail, smtpSettings))
                return;

            using var mimeMessage = MailKitEmailHelper.ConvertToMimeMessage(mail);
            MailKitEmailHelper.Send(mimeMessage, smtpSettings);
        }

        #region private methods

        /// <summary>
        /// Prepare mail and return true if it should be sent, otherwise - false
        /// </summary>
        /// <param name="mail">Mail to prepare</param>
        /// <param name="smtpSettings">SMPT settings</param>
        /// <returns></returns>
        private bool PrepareAndCheckMail(MailMessage mail, SmtpSettings smtpSettings)
        {
            NormalizeMail(mail);
            NormalizeMailSender(mail, smtpSettings);

            if (mail.From == null || string.IsNullOrWhiteSpace(mail.From.Address)) 
            {
                Logger.Error("Attempt to send email using empty from address. Subject: " + mail.Subject);
                return false;

            }

            // check recipient before redirect
            if (!mail.To.Any() || mail.To[0].Address == "")
            {
                Logger.Error("Attempt to send email to empty address. Subject: " + mail.Subject);
                return false;
            }

            var redirectTo = _emailSettings.EmailSettings.GetValue().RedirectAllMessagesTo;
            if (!string.IsNullOrWhiteSpace(redirectTo))
            {
                mail.To.Clear();
                mail.To.Add(redirectTo);
                mail.CC.Clear();
                mail.Bcc.Clear();
            }

            return true;
        }

        private MailMessage BuildMessageWith(string fromAddress, string toAddress, string subject, string body, bool isBodyHtml, string cc)
        {
            var message = new MailMessage
            {
                Subject = (subject ?? "").Replace("\r", " ").Replace("\n", " ").RemoveDoubleSpaces(),
                Body = isBodyHtml ? body.WrapAsHtmlDocument() : body,
                IsBodyHtml = isBodyHtml,
            };
            if (!string.IsNullOrWhiteSpace(fromAddress))
                message.From = new MailAddress(fromAddress);

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

        private void NormalizeMailSender(MailMessage mail, SmtpSettings smtpSettings)
        {
            if (mail.From == null || string.IsNullOrWhiteSpace(mail.From.Address))
            {
                if (smtpSettings.UseSmtpRelay && !string.IsNullOrWhiteSpace(smtpSettings.DefaultFromAddress))
                {
                    mail.From = new MailAddress(
                        smtpSettings.DefaultFromAddress,
                        smtpSettings.DefaultFromDisplayName,
                        Encoding.UTF8
                    );
                }
                else
                {
                    if (!string.IsNullOrWhiteSpace(smtpSettings.UserName))
                        mail.From = new MailAddress(
                            smtpSettings.UserName,
                            null,
                            Encoding.UTF8
                        );
                }
            }
        }

        #endregion
    }
}
