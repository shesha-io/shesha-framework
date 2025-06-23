using Shesha.Domain.Attributes;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Domain.Enums
{
    /// <summary>
    /// Indicate the accessibility of this user setting from client applications.
    /// </summary>
    [ReferenceList("UserSettingAccessMode")]
    public enum RefListUserSettingAccessMode
    {
        /// <summary>
        /// Not Accessible
        /// </summary>
        [Display(Name = "Not Accessible", Description = "Client Applications cannot access the setting. It is only used for a backend purposes.")]
        NotAccessible = 1,

        /// <summary>
        /// Read-only
        /// </summary>
        [Display(Name = "Read-only", Description = "Client Applications can read the setting, but cannot update it.")]
        ReadOnly = 2,

        /// <summary>
        /// Full
        /// </summary>
        [Display(Name = "Full", Description = "Client Applications can both read and update the setting.")]
        Full = 3,
    }
}
