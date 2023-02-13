using System.ComponentModel.DataAnnotations;

namespace Shesha.Email
{
    public class SendTestEmailInput
    {
        [Required]
        public string To { get; set; }
        [Required]
        public string Subject { get; set; }
        [Required]
        public string Body { get; set; }
    }
}
