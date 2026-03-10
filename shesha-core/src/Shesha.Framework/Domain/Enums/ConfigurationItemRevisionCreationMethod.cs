using Shesha.Domain.Attributes;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Domain.Enums
{
    /// <summary>
    /// Method of creating configuration item revision
    /// </summary>
    [ReferenceList("ConfigurationItemRevisionCreationMethod")]
    public enum ConfigurationItemRevisionCreationMethod
    {
        [Display(Name = "Manual")]
        Manual = 1,

        [Display(Name = "Manual import")]
        ManualImport = 2,

        [Display(Name = "Migration import")]
        MigrationImport = 3,
    }
}
