using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Shesha.Domain;
using Shesha.EntityReferences;

namespace Shesha.Configuration.Security.Frontend
{
    public class UserManagementSettings
    {
        /// <summary>
        /// 
        /// </summary>
        public bool AdditionalRegistrationInfo { get; set; }
        /// <summary>
        /// Additional Registration Info Form (stores only the form ID reference)
        /// </summary>
        public GenericEntityReference? AdditionalRegistrationInfoForm { get; set; }

        /// <summary>
        /// Allow self-registration
        /// </summary>
        [Display(Name = "Allow self-registration")]
        public bool AllowSelfRegistration { get; set; }

        /// <summary>
        /// Allowed email domains (comma-separated). If empty, all domains are allowed
        /// </summary>
        [Display(Name = "Allowed email domains")]
        public string? AllowedEmailDomains { get; set; } = string.Empty;

        /// <summary>
        /// Default role assigned to newly registered users
        /// </summary>
        [Display(Name = "Default role")]
        public List<Guid?> DefaultRoles { get; set; }

        /// <summary>
        /// Creation mode (Always, Must already exist, Create new but link if exist)
        /// </summary>
        [Display(Name = "Creation mode")]
        public RefListCreationMode? CreationMode { get; set; }

        /// <summary>
        /// The type of Person entity that will be created upon creation of the account
        /// </summary>
        public GenericEntityReference PersonEntityType { get; set; }
    }
}
