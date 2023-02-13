using Shesha.Domain.ConfigurationItems;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Web.FormsDesigner.Dtos
{
    /// <summary>
    /// Update configuration status import
    /// </summary>
    public class UpdateConfigurationStatusInput
    {
        /// <summary>
        /// Filter string in JsonLogic format
        /// </summary>
        [Required]
        public string Filter { get; set; }

        /// <summary>
        /// New status
        /// </summary>
        [Required]
        public ConfigurationItemVersionStatus Status { get; set; }
    }
}
