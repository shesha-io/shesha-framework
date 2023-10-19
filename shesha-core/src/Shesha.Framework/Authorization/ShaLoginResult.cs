using Abp.Authorization.Users;
using Abp.MultiTenancy;
using System.Security.Claims;

namespace Shesha.Authorization
{
    public class ShaLoginResult<TUser>
        where TUser : AbpUserBase
    {
        public ShaLoginResultType Result { get; private set; }

        public int? TenantId { get; private set; }

        public TUser User { get; private set; }

        public ClaimsIdentity Identity { get; private set; }

        public ShaLoginResult(ShaLoginResultType result, AbpTenantBase tenant = null, TUser user = null)
        {
            Result = result;
            TenantId = tenant?.Id;
            User = user;
        }

        public ShaLoginResult(AbpTenantBase tenant, TUser user, ClaimsIdentity identity)
            : this(ShaLoginResultType.Success, tenant)
        {
            User = user;
            Identity = identity;
        }
    }
}
