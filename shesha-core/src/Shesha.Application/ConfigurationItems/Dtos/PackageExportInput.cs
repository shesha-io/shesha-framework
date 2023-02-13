using System.ComponentModel.DataAnnotations;

namespace Shesha.ConfigurationItems.Dtos
{
    /// <summary>
    /// Arguments of the configuration items export
    /// </summary>
    public class PackageExportInput
    {
        /// <summary>
        /// Filter string in JsonLogic format. Is used to define a list of items to export
        /// </summary>
        [Required(AllowEmptyStrings = false)]
        public string Filter { get; set; }

        /// <summary>
        /// Mode of the version selection (live/ready/latest)
        /// </summary>
        public string VersionSelectionMode { get; set; }
    }
}
