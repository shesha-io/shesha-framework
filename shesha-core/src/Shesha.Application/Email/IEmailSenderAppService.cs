using System.Threading.Tasks;
using Abp.Application.Services;
using Shesha.Email.Dtos;

namespace Shesha.Email
{
    /// <summary>
    /// Email Sender Application Service
    /// </summary>
    public interface IEmailSenderAppService: IApplicationService
    {
        /// <summary>
        /// Updates current SMTP settings
        /// </summary>
        Task<bool> UpdateSmtpSettingsAsync(SmtpSettingsDto input);
        
        /// <summary>
        /// Returns current SMTP settings
        /// </summary>
        Task<SmtpSettingsDto> GetSmtpSettingsAsync();

        /// <summary>
        /// Sends email with a specified parameters
        /// </summary>
        Task<SendTestEmailDto> SendEmail(SendTestEmailInput input);
    }
}
