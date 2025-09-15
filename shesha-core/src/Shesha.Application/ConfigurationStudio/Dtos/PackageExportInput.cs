using System.ComponentModel.DataAnnotations;

namespace Shesha.ConfigurationStudio.Dtos
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
        /// If true, indicate that all dependencies should be exported as well
        /// </summary>
        public bool ExportDependencies { get; set; }
    }
}
