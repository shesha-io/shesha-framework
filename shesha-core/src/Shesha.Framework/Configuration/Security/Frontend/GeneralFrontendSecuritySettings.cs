using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Configuration.Security.Frontend
{
    public class GeneralFrontendSecuritySettings
    {
        /// <summary>
        /// Auto logoff after period of inactivity
        /// </summary>
        public bool AutoLogoffAfterInactivity { get; set; }

        /// <summary>
        /// Auto logoff timeout
        /// </summary>
        public int AutoLogoffTimeout { get; set; }
    }
}
