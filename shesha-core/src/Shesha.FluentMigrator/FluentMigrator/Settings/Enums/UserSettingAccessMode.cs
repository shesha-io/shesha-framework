using System.ComponentModel.DataAnnotations;

namespace Shesha.FluentMigrator.Settings
{
    /// <summary>
    /// Indicate the accessibility of this user setting from client applications.
    /// (Copy of the enum from framework)
    /// </summary>
    public enum UserSettingAccessMode
    {
        [Display(Name = "Not Accessible", Description = "Client Applications cannot access the setting. It is only used for a backend purposes.")]
        NotAccessible = 1,

        [Display(Name = "Read-only", Description = "Client Applications can read the setting, but cannot update it.")]
        ReadOnly = 2,

        [Display(Name = "Full", Description = "Client Applications can both read and update the setting.")]
        Full = 3,
    }
}
