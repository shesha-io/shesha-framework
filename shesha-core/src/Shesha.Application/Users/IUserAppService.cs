using System.Collections.Generic;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Shesha.Roles.Dto;
using Shesha.SecurityQuestions.Dto;
using Shesha.Users.Dto;

namespace Shesha.Users
{
    public interface IUserAppService : IAsyncCrudAppService<UserDto, long, PagedUserResultRequestDto, CreateUserDto, UpdateUserDto>
    {
        Task<ListResultDto<RoleDto>> GetRoles();

        Task ChangeLanguage(ChangeUserLanguageDto input);

        Task<ResetPasswordSendOtpResponse> ResetPasswordSendOtp(string mobileNo);

        Task<bool> SendSmsOtp(string username);

        Task<List<SecurityQuestionDto>> GetSecurityQuestions(string username);

        Task<ResetPasswordVerifyOtpResponse> ValidateResetCode(ResetPasswordValidateCodeInput input);

        Task<ResetPasswordVerifyOtpResponse> ValidateSecurityQuestions(SecurityQuestionVerificationDto input);

        Task<bool> SendEmailLink(string username);

        Task<List<ResetPasswordOptionDto>> GetUserPasswordResetOptions(string username);

        Task<bool> ResetPasswordUsingToken(ResetPasswordUsingTokenInput input);
        Task<ResetPasswordVerifyOtpResponse> ResetPasswordVerifyOtp(ResetPasswordVerifyOtpInput input);
    }
}
