using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.UserManagements.Configurations
{
    public class UserManagementSettings
    {
        /// <summary>
        /// 
        /// </summary>
        public SupportedRegistrationMethods SupportedRegistrationMethods { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public bool RequireEmailVerification { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public string GoToUrlAfterRegistration { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public bool UserEmailAsUsername { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public bool AdditionalRegistrationInfo { get; set; }
        /// <summary>
        /// Form Module Name
        /// </summary>
        public string AdditionalRegistrationInfoFormModule { get; set; }
        /// <summary>
        /// Form Name
        /// </summary>
        public string AdditionalRegistrationInfoFormName { get; set; }

        /// <summary>
        /// Allows anonymous users to register an account.
        /// The built-in default is false. Null only appears on values saved before this property existed: self-registration
        /// is then treated as enabled when the saved registration method isn't <see cref="SupportedRegistrationMethods.None"/>.
        /// </summary>
        public bool? AllowSelfRegistration { get; set; }

        /// <summary>
        /// Whether registration creates a new Person or links to a pre-registered one.
        /// Null means <see cref="RefListSelfRegistrationCreationMode.AlwaysCreateNew"/>.
        /// </summary>
        public RefListSelfRegistrationCreationMode? CreationMode { get; set; }

        /// <summary>
        /// Email domains allowed to register, separated by commas, semicolons or spaces (e.g. "gov.za, example.com").
        /// Empty allows all domains.
        /// </summary>
        public string AllowedEmailDomains { get; set; }

        /// <summary>
        /// Names of Shesha roles (ShaRole) appointed to the new Person on registration.
        /// </summary>
        public List<string> DefaultRoles { get; set; }

        /// <summary>
        /// Full class name or alias of the Person entity type to create (Person or a sub-class). Empty creates a Person.
        /// </summary>
        public string PersonEntityType { get; set; }
    }
}
