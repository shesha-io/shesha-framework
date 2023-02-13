using System.ComponentModel.DataAnnotations;

namespace Shesha.Users.Dto
{
    public class ResetPasswordUsingTokenInput
    {
        [Required(AllowEmptyStrings = false)]
        public string Username { get; set; }

        [Required(AllowEmptyStrings = false)]
        public string Token { get; set; }

        [Required(AllowEmptyStrings = false)]
        public string NewPassword { get; set; }
    }
}
