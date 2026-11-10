using Shesha.Domain;
using Shesha.UserRegistrations.Dto;
using System.Threading.Tasks;

namespace Shesha.UserRegistrations
{
    /// <summary>
    /// Anonymous self-registration: creates the user account and Person, and completes registrations that need
    /// the additional registration information form.
    /// </summary>
    public interface ISelfRegistrationManager
    {
        /// <summary>
        /// Registers a new user from an anonymous request: verifies the one-time pin, creates or links the Person, creates the user,
        /// appoints the default roles, records the registration and raises <see cref="UserSelfRegisteredEventData"/>.
        /// Refused unless the user management settings allow self-registration.
        /// </summary>
        /// <param name="input">Registration details, including the one-time pin that proves the registrant controls their email address or mobile number</param>
        /// <returns>The new user and Person, and what the registrant must do next</returns>
        Task<SelfRegistrationResult> RegisterAsync(SelfRegistrationInput input);

        /// <summary>
        /// Issues a new single-use completion token for an incomplete registration, replacing any previous one.
        /// Only the token's hash is stored; the token itself is returned to the registrant.
        /// </summary>
        Task<string> IssueCompletionTokenAsync(ShaUserRegistration registration);

        /// <summary>
        /// Returns the incomplete registration of the specified user when <paramref name="token"/> is its current, unexpired
        /// completion token; otherwise throws. Projects can call this from their own anonymous endpoints to authorise
        /// saving the additional registration information for <paramref name="userId"/>.
        /// </summary>
        Task<ShaUserRegistration> GetRegistrationForCompletionAsync(long userId, string token);

        /// <summary>
        /// Marks the registration as complete (after the additional registration info form), invalidates the token and returns the URL to go to
        /// </summary>
        Task<string> CompleteRegistrationAsync(long userId, string token);
    }
}
