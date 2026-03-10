using System.ComponentModel.DataAnnotations;

namespace Shesha.Domain.Enums
{
    /// <summary>
    /// Specifies who can access the application setting value via the APIs.
    /// </summary>
    public enum RefListSettingAccessMode
    {
        /// <summary>
        /// Back-end only
        /// </summary>
        [Display(Name = "Back-end only", Description = "Only back-end code can access the settings at run-time (i.e. it is not exposed via the APIs) except to Developers, Configurators, and Admin through the Admin panels.")]
        BackEndOnly = 1,

        /// <summary>
        /// Authenticated
        /// </summary>
        [Display(Name = "Authenticated", Description = "Any authenticated user may access the value of the setting via the API.")]
        Authenticated = 2,

        /// <summary>
        /// Anonymous
        /// </summary>
        [Display(Name = "Anonymous", Description = "The setting value can be retrieved via API by anyone even anonymous users.")]
        Anonymous = 3,
    }
}
