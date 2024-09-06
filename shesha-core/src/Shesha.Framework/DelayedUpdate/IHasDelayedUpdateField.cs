using Newtonsoft.Json;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Shesha.DelayedUpdate
{
    /// <summary>
    /// Declares common interface for DTOs those have list of delayed update objects
    /// </summary>
    public interface IHasDelayedUpdateField
    {
        /// <summary>
        /// List of delayed update objects.
        /// </summary>
        [Display(Name = "List of delayed update objects")]
        [JsonIgnore]
        public List<DelayedUpdateGroup> _delayedUpdate { get; set; }
    }
}
