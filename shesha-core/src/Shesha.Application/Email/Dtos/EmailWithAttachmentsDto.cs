using Microsoft.AspNetCore.Http;
using System.Collections.Generic;

namespace Shesha.Email.Dtos
{
    public class EmailWithAttachmentsDto: SendTestEmailInput
    {
        public string From { get; set; }
        public List<IFormFile> Attachments { get; set; } = [];
    }
}
