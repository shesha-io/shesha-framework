using System.ComponentModel.DataAnnotations;
using Abp.AutoMapper;
using Shesha.Otp;
using Shesha.Otp.Dto;

namespace Shesha.Users.Dto
{
    [AutoMapTo(typeof(VerifyPinInput))]
    public class ResetPasswordVerifyOtpInput: VerifyPinInput
    {
        [Required(AllowEmptyStrings = false)]
        public string MobileNo { get; set; }
    }
}
