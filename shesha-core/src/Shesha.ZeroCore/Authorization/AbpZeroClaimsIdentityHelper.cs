using Abp.Runtime.Security;
using System;
using System.Security.Claims;

namespace Abp.Authorization;

internal static class AbpZeroClaimsIdentityHelper
{
    public static int? GetTenantId(ClaimsPrincipal principal)
    {
        var tenantIdOrNull = principal?.FindFirstValue(AbpClaimTypes.TenantId);
        if (tenantIdOrNull == null)
        {
            return null;
        }

        return Convert.ToInt32(tenantIdOrNull);
    }
}