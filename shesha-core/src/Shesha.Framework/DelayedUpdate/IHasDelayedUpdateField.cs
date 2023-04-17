using Newtonsoft.Json;
using Shesha.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
