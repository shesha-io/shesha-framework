using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using MimeKit.Utils;
using NUglify;
using Shesha.Configuration;
using System;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using SmtpClient = MailKit.Net.Smtp.SmtpClient;

namespace Shesha.Email
{
    internal static class MailKitEmailHelper
    {
        public static MimeMessage ConvertToMimeMessage(MailMessage mail)
        {
            if (mail == null)
                throw new ArgumentNullException(nameof(mail));

            var message = new MimeMessage();

            if (mail.From != null)
                message.From.Add(CreateMailboxAddress(mail.From));

            foreach (var address in mail.To.Cast<MailAddress>())
            {
                message.To.Add(CreateMailboxAddress(address));
            }

            foreach (var address in mail.CC.Cast<MailAddress>())
            {
                message.Cc.Add(CreateMailboxAddress(address));
            }

            foreach (var address in mail.Bcc.Cast<MailAddress>())
            {
                message.Bcc.Add(CreateMailboxAddress(address));
            }

            message.Subject = mail.Subject ?? string.Empty;

            foreach (var headerKey in mail.Headers.AllKeys)
            {
                var value = mail.Headers[headerKey];
                if (!string.IsNullOrEmpty(headerKey) && !string.IsNullOrEmpty(value))
                {
                    message.Headers.Replace(headerKey, value);
                }
            }

            var builder = new BodyBuilder();

            var htmlView = mail.AlternateViews
                .Cast<AlternateView>()
                .FirstOrDefault(v => string.Equals(v.ContentType.MediaType.Split('/')[0], "text", StringComparison.OrdinalIgnoreCase)
                    && string.Equals(v.ContentType.MediaType.Split('/')[1], "html", StringComparison.OrdinalIgnoreCase));

            if (htmlView != null)
            {
                builder.HtmlBody = ReadAlternateView(htmlView);
                AddLinkedResources(builder, htmlView);
            }
            else if (mail.IsBodyHtml)
            {
                builder.HtmlBody = mail.Body;
            }
            else
            {
                builder.TextBody = mail.Body;
            }

            foreach (var alternateView in mail.AlternateViews.Cast<AlternateView>())
            {
                if (alternateView == htmlView)
                    continue;

                var alternateViewMediaType = alternateView.ContentType.MediaType;
                var mediaTypeMain = alternateViewMediaType.Split('/')[0];
                var mediaTypeSub = alternateViewMediaType.Split('/')[1];

                if (string.Equals(mediaTypeMain, "text", StringComparison.OrdinalIgnoreCase)
                    && string.Equals(mediaTypeSub, "plain", StringComparison.OrdinalIgnoreCase))
                {
                    builder.TextBody = ReadAlternateView(alternateView);
                }
            }

            foreach (var attachment in mail.Attachments.Cast<Attachment>())
            {
                builder.Attachments.Add(CreateAttachmentPart(attachment));
            }

            message.Body = builder.ToMessageBody();

            return message;
        }

        public static async Task SendAsync(MimeMessage message, SmtpSettings settings, CancellationToken cancellationToken = default)
        {
            if (settings == null)
                throw new ArgumentNullException(nameof(settings));

            using var smtpClient = new SmtpClient();
            await smtpClient.ConnectAsync(settings.Host, settings.Port, GetSecureSocketOption(settings), cancellationToken).ConfigureAwait(false);

            var credential = CreateCredential(settings);
            if (credential != null)
            {
                await smtpClient.AuthenticateAsync(credential, cancellationToken).ConfigureAwait(false);
            }

            await smtpClient.SendAsync(message, cancellationToken).ConfigureAwait(false);
            await smtpClient.DisconnectAsync(true, cancellationToken).ConfigureAwait(false);
        }

        public static void Send(MimeMessage message, SmtpSettings settings, CancellationToken cancellationToken = default)
        {
            if (settings == null)
                throw new ArgumentNullException(nameof(settings));

            using var smtpClient = new SmtpClient();
            smtpClient.Connect(settings.Host, settings.Port, GetSecureSocketOption(settings), cancellationToken);

            var credential = CreateCredential(settings);
            if (credential != null)
            {
                smtpClient.Authenticate(credential, cancellationToken);
            }

            smtpClient.Send(message, cancellationToken);
            smtpClient.Disconnect(true, cancellationToken);
        }

        private static void AddLinkedResources(BodyBuilder builder, AlternateView view)
        {
            foreach (var resource in view.LinkedResources.Cast<LinkedResource>())
            {
                builder.LinkedResources.Add(CreateLinkedResource(resource));
            }
        }

        private static MimePart CreateAttachmentPart(Attachment attachment)
        {
            var contentType = attachment.ContentType.MediaType;
            var mediaType = contentType.Split('/')[0] ?? "application";
            var mediaSubType = contentType.Split('/')[1] ?? "octet-stream";

            var mimePart = new MimePart(mediaType, mediaSubType)
            {
                Content = new MimeContent(attachment.ContentStream),
                ContentDisposition = new ContentDisposition(ContentDisposition.Attachment),
                ContentTransferEncoding = ContentEncoding.Base64,
                FileName = attachment.Name
            };

            // The created MemoryStream is now owned by MimeContent, which will dispose it when disposed.
            return mimePart;
        }

        private static MimeEntity CreateLinkedResource(LinkedResource resource)
        {
            var contentType = resource.ContentType.MediaType;
            var mediaType = contentType.Split('/')[0] ?? "application";
            var mediaSubType = contentType.Split('/')[1] ?? "octet-stream";
            using MemoryStream memoryStream = CopyToMemoryStream(resource.ContentStream);
            var mimePart = new MimePart(mediaType, mediaSubType)
            {
                Content = new MimeContent(memoryStream),
                ContentDisposition = new ContentDisposition(ContentDisposition.Inline),
                ContentTransferEncoding = ContentEncoding.Base64,
                ContentId = string.IsNullOrWhiteSpace(resource.ContentId) ? MimeUtils.GenerateMessageId() : resource.ContentId,
                FileName = resource.ContentId
            };

            // The created MemoryStream is now owned by MimeContent, which will dispose it when disposed.
            return mimePart;
        }

        private static MemoryStream CopyToMemoryStream(Stream stream)
        {
            var memoryStream = new MemoryStream();
            if (stream.CanSeek)
                stream.Position = 0;

            stream.CopyTo(memoryStream);
            memoryStream.Position = 0;
            return memoryStream;
        }

        private static MailboxAddress CreateMailboxAddress(MailAddress address)
        {
            return string.IsNullOrEmpty(address.DisplayName)
                ? MailboxAddress.Parse(address.Address)
                : new MailboxAddress(address.DisplayName, address.Address);
        }

        private static string ReadAlternateView(AlternateView view)
        {
            var encoding = !string.IsNullOrWhiteSpace(view.ContentType.CharSet)
                ? Encoding.GetEncoding(view.ContentType.CharSet)
                : Encoding.UTF8;

            if (view.ContentStream.CanSeek)
                view.ContentStream.Position = 0;

            using var reader = new StreamReader(view.ContentStream, encoding, detectEncodingFromByteOrderMarks: true, leaveOpen: true);
            var content = reader.ReadToEnd();
            if (view.ContentStream.CanSeek)
                view.ContentStream.Position = 0;

            return content;
        }

        private static NetworkCredential? CreateCredential(SmtpSettings settings)
        {
            if (string.IsNullOrWhiteSpace(settings.UserName))
                return null;

            return string.IsNullOrWhiteSpace(settings.Domain)
                ? new NetworkCredential(settings.UserName, settings.Password)
                : new NetworkCredential(settings.UserName, settings.Password, settings.Domain);
        }

        private static SecureSocketOptions GetSecureSocketOption(SmtpSettings settings)
        {
            if (!settings.EnableSsl)
                return SecureSocketOptions.None;

            return settings.Port == 465
                ? SecureSocketOptions.SslOnConnect
                : SecureSocketOptions.StartTls;
        }
    }
}
