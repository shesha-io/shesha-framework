using Shesha.Domain.Enums;
using Shesha.Settings;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Configuration.Security
{
    public class SecuritySettings
    {
        /// <summary>
        /// OTP lifetime
        /// </summary>
        public int MobileLoginPinLifetime { get; set; }

        /// <summary>
        /// Default endpoint access
        /// </summary>
        [Display(Name = "Default endpoint access", Description = "Used for 'Inherited' endpoint access")]
        public RefListPermissionedAccess DefaultEndpointAccess { get; set; }

    }
}
