using Abp.Net.Mail.Smtp;
using Shesha.Email.Dtos;
using System.Collections.Generic;

namespace Shesha.Email
{
    /// <summary>
    /// Used to compose and send emails via SMTP
    /// </summary>
    public interface ISheshaEmailSender : ISmtpEmailSender
    {
        /// <summary>
        /// Compose and send email with attachments
        /// </summary>
        bool SendMail(string fromAddress, string toAddress, string subject, string body, bool isBodyHtml, List<EmailAttachment>? attachments = null, string cc = "", bool throwException = false);
    }
}
