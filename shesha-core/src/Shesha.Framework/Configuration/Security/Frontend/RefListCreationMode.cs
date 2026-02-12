using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using Shesha.Domain.Attributes;

namespace Shesha.Configuration.Security.Frontend
{
    [ReferenceList("Shesha.Framework", "CreationMode")]
    public enum RefListCreationMode
    {
        /// <summary>
        /// Will always create a new Person entity of the specified type on creation of a new User account.
        /// If a Person with the same username/email already exists an exception will be thrown.
        /// </summary>
        [Description("Always")]
        [Display(Name = "Always")]
        Always = 0,

        /// <summary>
        /// A Person entity with the same username must already exist before a user account will be created.
        /// This is useful in cases where the registering users must be ‘pre-registered’ in order to gain access to the system.
        /// </summary>
        [Description("Must already exist")]
        [Display(Name = "Must already exist")]
        MustAlreadyExist = 1,

        /// <summary>
        /// Will first search for an existing Person entity with the specified username.
        /// If one is found, the user account will be linked to it, otherwise a new one will be created.
        /// </summary>
        [Description("Create new but link if already exist")]
        [Display(Name = "Create new but link if already exist")]
        CreateNewButLinkIfExist = 2,
    }
}
