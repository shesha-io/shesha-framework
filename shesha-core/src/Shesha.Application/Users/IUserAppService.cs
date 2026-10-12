using Abp.Application.Services;
using Shesha.SecurityQuestions.Dto;
using Shesha.Users.Dto;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shesha.Users
{
    public interface IUserAppService : IAsyncCrudAppService<UserDto, long, PagedUserResultRequestDto, CreateUserDto, UserDto>
    {
        Task<ResetPasswordSendOtpResponse> ResetPasswordSendOtpAsync(string mobileNo);

        Task<bool> SendSmsOtpAsync(string username);

        Task<List<SecurityQuestionDto>> GetSecurityQuestionsAsync(string username);

        Task<ResetPasswordVerifyOtpResponse> ValidateResetCodeAsync(ResetPasswordValidateCodeInput input);

        Task<ResetPasswordVerifyOtpResponse> ValidateSecurityQuestionsAsync(SecurityQuestionVerificationDto input);

        Task<bool> SendEmailLinkAsync(string username);

        Task<List<ResetPasswordOptionDto>> GetUserPasswordResetOptionsAsync(string username);

        Task<bool> ResetPasswordUsingTokenAsync(ResetPasswordUsingTokenInput input);
        Task<ResetPasswordVerifyOtpResponse> ResetPasswordVerifyOtpAsync(ResetPasswordVerifyOtpInput input);
    }
}
