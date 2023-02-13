using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities
{
    /// <summary>
    /// Declares common interface for DTOs those have form fields list. Is used for dynamic entities
    /// </summary>
    public interface IHasFormFieldsList
    {
        /// <summary>
        /// List of form fields. Is used for partial updates. Contains a list of entity properties that should be updated. Leave empty to update all available entity fields
        /// </summary>
        [Display(Name = "List of form fields", Description = "Is used for partial updates. Contains a list of entity properties that should be updated. Leave empty to update all available entity fields. Use dot notation for nested properties (e.g. `dynamicAddress.postCode`, `dynamicAddress.geo.lat`)")]
        [JsonIgnore]
        public List<string> _formFields { get; set; }
    }
}
