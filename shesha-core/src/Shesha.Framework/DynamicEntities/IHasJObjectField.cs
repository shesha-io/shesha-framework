using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.ComponentModel.DataAnnotations;

namespace Shesha.DynamicEntities
{
    /// <summary>
    /// Declares common interface for DTOs those have JSON request data as JObject. Is used for dynamic entities
    /// </summary>
    public interface IHasJObjectField
    {
        /// <summary>
        /// JSON request data as JObject
        /// </summary>
        [Display(Name = "JSON data", Description = "Is used for ")]
        [JsonIgnore]
        JObject? _jObject { get; set; }
    }
}
