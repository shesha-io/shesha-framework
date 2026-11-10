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
        /// Username. Ignored when the email address is used as the username.
        /// </summary>
        public string UserName { get; set; }

        /// <summary>
        /// Password for the new account
        /// </summary>
        [Required]
        public string Password { get; set; }

        /// <summary>
        /// Must match <see cref="Password"/>
        /// </summary>
        [Required]
        public string PasswordConfirmation { get; set; }

        /// <summary>
        /// First name of the registrant
        /// </summary>
        [Required(AllowEmptyStrings = false)]
        public string FirstName { get; set; }

        /// <summary>
        /// Last name of the registrant
        /// </summary>
        [Required(AllowEmptyStrings = false)]
        public string LastName { get; set; }

        /// <summary>
        /// Email address of the registrant. Saved only when it's the contact the one-time pin verified.
        /// </summary>
        [EmailAddress]
        public string EmailAddress { get; set; }

        /// <summary>
        /// Mobile number of the registrant. Saved only when it's the contact the one-time pin verified.
        /// </summary>
        public string MobileNumber { get; set; }

        /// <summary>
        /// Operation id of a verified one-time pin (or email link) sent to <see cref="EmailAddress"/> or <see cref="MobileNumber"/>.
        /// Required: it proves the registrant controls the contact they register with (the email address or mobile number,
        /// depending on the configured registration method) and, when linking, the pre-registered Person's contact.
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
        /// <summary>
        /// Id of the user
        /// </summary>
        public long UserId { get; set; }

        /// <summary>
        /// Id of the new or linked Person
        /// </summary>
        public Guid PersonId { get; set; }

        /// <summary>
        /// True when the account was linked to a pre-registered Person rather than a new one being created
        /// </summary>
        public bool LinkedToExistingPerson { get; set; }

        /// <summary>
        /// URL to go to once the registration is complete
        /// </summary>
        public string GoToUrlAfterRegistration { get; set; }

        /// <summary>
        /// True when the user must complete the additional registration form before using the application
        /// </summary>
        public bool RequiresAdditionalRegistrationInfo { get; set; }

        /// <summary>
        /// Module of the additional registration information form
        /// </summary>
        public string AdditionalRegistrationInfoFormModule { get; set; }

        /// <summary>
        /// Name of the additional registration information form
        /// </summary>
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
        /// <summary>
        /// Id of the user whose registration to complete
        /// </summary>
        public long UserId { get; set; }

        /// <summary>
        /// Completion token returned by <c>UserRegistration/Register</c>, or by <c>TokenAuth/Authenticate</c> when an incomplete registration logs in
        /// </summary>
        [Required(AllowEmptyStrings = false)]
        public string Token { get; set; }
    }

    /// <summary>
    /// Registration settings that are safe to expose to anonymous users
    /// </summary>
    public class PublicRegistrationSettingsDto
    {
        /// <summary>
        /// True when the Register link should be shown and anonymous registration is accepted
        /// </summary>
        public bool IsSelfRegistrationEnabled { get; set; }

        /// <summary>
        /// Contact the registrant verifies: email address, mobile number, or either
        /// </summary>
        public SupportedRegistrationMethods SupportedRegistrationMethods { get; set; }

        /// <summary>
        /// True when the registration form asks the registrant to verify their email address. The server always requires a verified one-time pin.
        /// </summary>
        public bool RequireEmailVerification { get; set; }

        /// <summary>
        /// True when the email address is used as the username
        /// </summary>
        public bool UserEmailAsUsername { get; set; }

        /// <summary>
        /// Whether registration creates a new Person, links to a pre-registered one, or either
        /// </summary>
        public RefListSelfRegistrationCreationMode CreationMode { get; set; }

        /// <summary>
        /// True when registrants must complete an additional registration information form
        /// </summary>
        public bool AdditionalRegistrationInfo { get; set; }

        /// <summary>
        /// Module of the additional registration information form
        /// </summary>
        public string AdditionalRegistrationInfoFormModule { get; set; }

        /// <summary>
        /// Name of the additional registration information form
        /// </summary>
        public string AdditionalRegistrationInfoFormName { get; set; }

        /// <summary>
        /// URL to go to once the registration is complete
        /// </summary>
        public string GoToUrlAfterRegistration { get; set; }
    }
}
