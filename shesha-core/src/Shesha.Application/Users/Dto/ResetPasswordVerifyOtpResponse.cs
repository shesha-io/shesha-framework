using Abp.AutoMapper;
using Shesha.Otp;
using Shesha.Otp.Dto;

namespace Shesha.Users.Dto
{
    [AutoMapFrom(typeof(VerifyPinResponse))]
    public class ResetPasswordVerifyOtpResponse: VerifyPinResponse
    {
        public string Token { get; set; }
        public string Username { get; set; }
    }
}
