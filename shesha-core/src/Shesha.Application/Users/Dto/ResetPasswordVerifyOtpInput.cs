using Abp.AutoMapper;
using Shesha.Otp.Dto;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Users.Dto
{
    [AutoMapTo(typeof(VerifyPinInput))]
    public class ResetPasswordVerifyOtpInput : VerifyPinInput
    {
        [Required(AllowEmptyStrings = false)]
        public string MobileNo { get; set; }
    }
}
