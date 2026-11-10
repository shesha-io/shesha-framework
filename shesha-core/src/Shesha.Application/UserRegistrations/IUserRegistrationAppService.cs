using Abp.Application.Services;
using Shesha.UserRegistrations.Dto;
using System.Threading.Tasks;

namespace Shesha.UserRegistrations
{
    /// <summary>
    /// Public (anonymous) user self-registration
    /// </summary>
    public interface IUserRegistrationAppService : IApplicationService
    {
        /// <summary>
        /// Registration settings, limited to values the login and registration forms need
        /// </summary>
        Task<PublicRegistrationSettingsDto> GetSettingsAsync();

        /// <summary>
        /// Registers a new user account
        /// </summary>
        Task<SelfRegistrationResult> RegisterAsync(SelfRegistrationInput input);

        /// <summary>
        /// Marks a registration as complete using its single-use completion token and returns the URL to go to
        /// </summary>
        Task<string> CompleteRegistrationAsync(CompleteRegistrationInput input);
    }
}
