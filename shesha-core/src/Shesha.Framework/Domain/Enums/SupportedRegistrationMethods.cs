using Shesha.Domain.Attributes;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Domain.Enums
{
    [ReferenceList("Shesha.Framework", "SupportedRegistrationMethods")]
    public enum SupportedRegistrationMethods: long
    {
        /// <summary>
        /// None - Hide register link on login
        /// </summary>
        [Display(Name = "None")]
        None = 1,
        /// <summary>
        /// Requires Email Verification
        /// </summary>
        [Display(Name = "Email Address")]
        EmailAddress = 2,
        /// <summary>
        /// Requires mobile verification - could be useful for public/citizen who don’t necessarily have email address.
        /// </summary>
        [Display(Name = "Mobile Number")]
        MobileNumber = 3,
        /// <summary>
        /// if so, must be able to specify which providers
        /// </summary>
        [Display(Name = "OAuth")]
        OAuth = 4,
    }
}
