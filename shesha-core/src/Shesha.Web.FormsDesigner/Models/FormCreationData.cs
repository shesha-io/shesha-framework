using Shesha.Domain;
using Shesha.Web.FormsDesigner.Models;

namespace Shesha.Web.FormsDesigner.Models
{
    /// <summary>
    /// Container for form-specific data needed during form creation
    /// </summary>
    public class FormCreationData
    {
        /// <summary>
        /// Form input data from the request
        /// </summary>
        public CreateFormInput FormInput { get; set; }
        
        /// <summary>
        /// Template to use for the form, if specified
        /// </summary>
        public FormConfigurationRevision? Template { get; set; }
    }
}
