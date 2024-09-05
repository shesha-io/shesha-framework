using Newtonsoft.Json;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Shesha.DeferredUpdate
{
    /// <summary>
    /// Declares common interface for DTOs those have list of delayed update objects
    /// </summary>
    public interface IHasDeferredUpdateField
    {
        /// <summary>
        /// List of delayed update objects.
        /// </summary>
        [Display(Name = "List of delayed update objects")]
        [JsonIgnore]
        public List<DeferredUpdateGroup> _deferredUpdate { get; set; }
    }
}
