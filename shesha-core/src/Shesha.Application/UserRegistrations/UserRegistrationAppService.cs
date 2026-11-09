using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shesha.Domain.Enums;
using Shesha.UserManagements.Configurations;
using Shesha.UserRegistrations.Dto;
using System.Threading.Tasks;

namespace Shesha.UserRegistrations
{
    /// <summary>
    /// Public (anonymous) user self-registration.
    /// Registration is refused unless the user management settings allow self-registration.
    /// Administrative user creation stays on <c>UserManagementAppService</c>, which requires User-Manage.
    /// </summary>
    public class UserRegistrationAppService : SheshaAppServiceBase, IUserRegistrationAppService
    {
        private readonly IUserManagementSettings _userManagementSettings;
        private readonly ISelfRegistrationManager _registrationManager;

        /// <summary>
        /// Creates the self-registration app service
        /// </summary>
        public UserRegistrationAppService(IUserManagementSettings userManagementSettings, ISelfRegistrationManager registrationManager)
        {
            _userManagementSettings = userManagementSettings;
            _registrationManager = registrationManager;
        }

        /// <summary>
        /// Registration settings, limited to values the login and registration forms need
        /// </summary>
        [AllowAnonymous]
        [HttpGet]
        public async Task<PublicRegistrationSettingsDto> GetSettingsAsync()
        {
            var s = await _userManagementSettings.UserManagementSettings.GetValueAsync();
            var isEnabled = SelfRegistrationManager.IsSelfRegistrationEnabled(s);

            return new PublicRegistrationSettingsDto
            {
                IsSelfRegistrationEnabled = isEnabled,
                SupportedRegistrationMethods = isEnabled ? s.SupportedRegistrationMethods : SupportedRegistrationMethods.None,
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
        /// Registers a new user account
        /// </summary>
        [AllowAnonymous]
        [HttpPost]
        public async Task<SelfRegistrationResult> RegisterAsync(SelfRegistrationInput input)
        {
            return await _registrationManager.RegisterAsync(input);
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
