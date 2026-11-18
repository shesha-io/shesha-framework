using Shesha.Domain.Attributes;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Domain.Enums
{
    /// <summary>
    /// Controls whether self-registration creates a new Person or links the new account to a pre-registered Person
    /// </summary>
    [ReferenceList("Shesha.Framework", "SelfRegistrationCreationMode")]
    public enum RefListSelfRegistrationCreationMode : long
    {
        /// <summary>
        /// Always create a new Person. Registration fails if a Person with the same email address or mobile number already exists.
        /// </summary>
        [Display(Name = "Always create a new person")]
        AlwaysCreateNew = 1,

        /// <summary>
        /// The Person must already exist (pre-registered) without a user account. The new account is linked to it.
        /// The registrant must prove ownership of the matching email address or mobile number with a one-time pin.
        /// </summary>
        [Display(Name = "Person must already exist")]
        MustAlreadyExist = 2,

        /// <summary>
        /// Link to an existing Person without a user account when one matches, otherwise create a new Person.
        /// Linking requires a one-time pin proving ownership of the matching email address or mobile number.
        /// </summary>
        [Display(Name = "Link to existing person, otherwise create new")]
        LinkIfExistsOtherwiseCreate = 3,
    }
}
