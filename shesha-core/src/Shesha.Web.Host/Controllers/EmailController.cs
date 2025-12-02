using Microsoft.AspNetCore.Mvc;
using Shesha.Controllers;
using Shesha.Email;
using Shesha.Email.Dtos;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace Shesha.Web.Host.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmailController : SheshaControllerBase
    {

        private readonly ISheshaEmailSender _emailSender;

        public EmailController(ISheshaEmailSender emailSender)
        {
            _emailSender = emailSender;
        }


        [HttpPost("SendTestEmailWithAttachments")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult> TestEmailAsync([FromForm] EmailWithAttachmentsDto upload)
        {
            var isBodyHtml = false;
            var attachments = new List<EmailAttachment>();

            foreach (var attachment in upload.Attachments)
            {
                if (attachment.Length > 0)
                {
                    using var sourceStream = attachment.OpenReadStream();
                    var memoryStream = new MemoryStream();
                    sourceStream.CopyTo(memoryStream);
                    memoryStream.Position = 0; // Reset position for reading

                    attachments.Add(new EmailAttachment(attachment.FileName, memoryStream));
                }
            }

            _emailSender.SendMail(upload.From, upload.To, upload.Subject, upload.Body, isBodyHtml, attachments);

            return Content("Sent email: " + upload.Subject + ", to : " + upload.To);
        }

    }
}
