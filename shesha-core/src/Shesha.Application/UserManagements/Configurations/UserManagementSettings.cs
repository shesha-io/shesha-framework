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
    }
}
