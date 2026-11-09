using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shesha.Domain.Enums;
using Shesha.UserRegistrations.Dto;
using System.Threading.Tasks;

namespace Shesha.UserRegistrations
{
    /// <summary>
    /// Public (anonymous) user self-registration.
    /// Registration is refused unless the calling front-end's user management settings allow self-registration.
    /// Administrative user creation stays on <c>UserManagementAppService</c>, which requires User-Manage.
    /// </summary>
    public class UserRegistrationAppService : SheshaAppServiceBase, IUserRegistrationAppService
    {
        private readonly ISelfRegistrationSettingsProvider _settingsProvider;
        private readonly SelfRegistrationManager _registrationManager;

        public UserRegistrationAppService(ISelfRegistrationSettingsProvider settingsProvider, SelfRegistrationManager registrationManager)
        {
            _settingsProvider = settingsProvider;
            _registrationManager = registrationManager;
        }

        /// <summary>
        /// Registration settings of the calling front-end, limited to values the login and registration forms need
        /// </summary>
        [AllowAnonymous]
        [HttpGet]
        public async Task<PublicRegistrationSettingsDto> GetSettingsAsync()
        {
            var effective = await _settingsProvider.GetSettingsAsync();
            var s = effective.Settings;

            return new PublicRegistrationSettingsDto
            {
                IsSelfRegistrationEnabled = effective.IsSelfRegistrationEnabled,
                SupportedRegistrationMethods = effective.IsSelfRegistrationEnabled ? s.SupportedRegistrationMethods : SupportedRegistrationMethods.None,
                RequireEmailVerification = s.RequireEmailVerification,
                UserEmailAsUsername = s.UserEmailAsUsername,
                CreationMode = s.CreationMode ?? RefListSelfRegistrationCreationMode.AlwaysCreateNew,
                AdditionalRegistrationInfo = s.AdditionalRegistrationInfo,
                AdditionalRegistrationInfoFormModule = s.AdditionalRegistrationInfoFormModule,
                AdditionalRegistrationInfoFormName = s.AdditionalRegistrationInfoFormName,
                GoToUrlAfterRegistration = s.GoToUrlAfterRegistration,
            };
        }

        /// <summary>
        /// Registers a new user account from the calling front-end
        /// </summary>
        [AllowAnonymous]
        [HttpPost]
        public async Task<SelfRegistrationResult> RegisterAsync(SelfRegistrationInput input)
        {
            var effective = await _settingsProvider.GetSettingsAsync();
            return await _registrationManager.RegisterAsync(input, effective);
        }

        /// <summary>
        /// Marks a registration as complete after the additional registration information form, and returns the URL to go to.
        /// Anonymous because a user with an incomplete registration can't log in; the single-use completion token
        /// issued by Register (or by TokenAuth/Authenticate after a correct password) authorises the call.
        /// </summary>
        [AllowAnonymous]
        [HttpPost]
        public async Task<string> CompleteRegistrationAsync(CompleteRegistrationInput input)
        {
            return await _registrationManager.CompleteRegistrationAsync(input.UserId, input.Token);
        }
    }
}
