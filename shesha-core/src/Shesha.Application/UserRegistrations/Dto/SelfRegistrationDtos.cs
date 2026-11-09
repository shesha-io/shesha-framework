using Shesha.Domain.Enums;
using System;
using System.ComponentModel.DataAnnotations;

namespace Shesha.UserRegistrations.Dto
{
    /// <summary>
    /// Anonymous self-registration request
    /// </summary>
    public class SelfRegistrationInput
    {
        /// <summary>
        /// Username. Ignored when the front-end uses the email address as username.
        /// </summary>
        public string UserName { get; set; }

        [Required]
        public string Password { get; set; }

        [Required]
        public string PasswordConfirmation { get; set; }

        [Required(AllowEmptyStrings = false)]
        public string FirstName { get; set; }

        [Required(AllowEmptyStrings = false)]
        public string LastName { get; set; }

        [EmailAddress]
        public string EmailAddress { get; set; }

        public string MobileNumber { get; set; }

        /// <summary>
        /// Operation id of a one-time pin sent to <see cref="EmailAddress"/> or <see cref="MobileNumber"/>.
        /// Required to link the new account to a pre-registered Person.
        /// </summary>
        public Guid? OtpOperationId { get; set; }

        /// <summary>
        /// The one-time pin the registrant received
        /// </summary>
        public string OtpPin { get; set; }
    }

    /// <summary>
    /// Result of a successful self-registration
    /// </summary>
    public class SelfRegistrationResult
    {
        public long UserId { get; set; }

        public Guid PersonId { get; set; }

        /// <summary>
        /// True when the account was linked to a pre-registered Person rather than a new one being created
        /// </summary>
        public bool LinkedToExistingPerson { get; set; }

        public string GoToUrlAfterRegistration { get; set; }

        /// <summary>
        /// True when the user must complete the additional registration form before using the application
        /// </summary>
        public bool RequiresAdditionalRegistrationInfo { get; set; }

        public string AdditionalRegistrationInfoFormModule { get; set; }

        public string AdditionalRegistrationInfoFormName { get; set; }

        /// <summary>
        /// Single-use token for <c>UserRegistration/CompleteRegistration</c>, set when <see cref="RequiresAdditionalRegistrationInfo"/> is true.
        /// The registrant can't log in until the registration is complete, so this token is what authorises that step.
        /// </summary>
        public string CompletionToken { get; set; }
    }

    /// <summary>
    /// Completes a self-registration after the additional registration information form
    /// </summary>
    public class CompleteRegistrationInput
    {
        public long UserId { get; set; }

        /// <summary>
        /// Completion token returned by <c>UserRegistration/Register</c>, or by <c>TokenAuth/Authenticate</c> when an incomplete registration logs in
        /// </summary>
        [Required(AllowEmptyStrings = false)]
        public string Token { get; set; }
    }

    /// <summary>
    /// Registration settings that are safe to expose to anonymous users of a front-end
    /// </summary>
    public class PublicRegistrationSettingsDto
    {
        /// <summary>
        /// True when the Register link should be shown and anonymous registration is accepted
        /// </summary>
        public bool IsSelfRegistrationEnabled { get; set; }

        public SupportedRegistrationMethods SupportedRegistrationMethods { get; set; }

        public bool RequireEmailVerification { get; set; }

        public bool UserEmailAsUsername { get; set; }

        public RefListSelfRegistrationCreationMode CreationMode { get; set; }

        public bool AdditionalRegistrationInfo { get; set; }

        public string AdditionalRegistrationInfoFormModule { get; set; }

        public string AdditionalRegistrationInfoFormName { get; set; }

        public string GoToUrlAfterRegistration { get; set; }
    }
}
