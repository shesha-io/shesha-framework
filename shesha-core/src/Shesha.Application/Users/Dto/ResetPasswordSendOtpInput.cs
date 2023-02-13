using System.ComponentModel.DataAnnotations;

namespace Shesha.Users.Dto
{
    public class ResetPasswordSendOtpInput
    {
        [Required(AllowEmptyStrings = false)]
        public string MobileNo { get; set; }
    }
}
