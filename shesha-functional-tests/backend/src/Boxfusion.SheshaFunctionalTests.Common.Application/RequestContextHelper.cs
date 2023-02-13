using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Boxfusion.SheshaFunctionalTests.Common
{
    /// <summary>
    /// Helper class to easily retrieve information related to the request context.
    /// </summary>
    public class RequestContextHelper
    {
        private const string CONTEXT_FACILITY_ID_HEADER_NAME = "boxhis-facilityId";
        private readonly IHttpContextAccessor _httpContextAccessor;


        public static HttpContext HttpContext
        {
            get
            {
                return Abp.Dependency.IocManager.Instance.Resolve<IHttpContextAccessor>().HttpContext;
            }
        }

            
        /// <summary>
        /// Returns true if a  ContextFacilityId (i.e. the Facility from which the user is making requests for) has been provided.
        /// </summary>
        public static bool HasFacilityId
        {
            get
            {
                var stringContextFacilityId = HttpContext.Request.Headers[CONTEXT_FACILITY_ID_HEADER_NAME];
                return !string.IsNullOrEmpty(stringContextFacilityId);
            }
        }

        /// <summary>
        /// Returns the Id of the Context Facility (i.e. the Facility from which the user is making requests for)
        /// </summary>
        public static Guid FacilityId
        {
            get
            {

                var stringContextFacilityId = HttpContext.Request.Headers[CONTEXT_FACILITY_ID_HEADER_NAME];

                return Guid.Parse(stringContextFacilityId);
            }
        }
    }
}
