using System;
using System.Collections.Generic;

namespace Shesha.Sessions.Dto
{
    public class GetCurrentLoginInfoOutput
    {
        public UserLoginInfoDto? User { get; set; }

        public TenantLoginInfoDto? Tenant { get; set; }

        public InitializationErrorsInfoDto? InitializationErrors { get; set; }
    }
}
