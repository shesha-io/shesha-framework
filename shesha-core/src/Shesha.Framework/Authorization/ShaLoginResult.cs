using System.Security.Claims;
using Abp.Authorization.Users;
using Abp.MultiTenancy;

namespace Shesha.Authorization
{
    public class ShaLoginResult<TTenant, TUser>
        where TTenant : AbpTenant<TUser>
        where TUser : AbpUserBase
    {
        public ShaLoginResultType Result { get; private set; }

        public TTenant Tenant { get; private set; }

        public TUser User { get; private set; }

        public ClaimsIdentity Identity { get; private set; }

        public ShaLoginResult(ShaLoginResultType result, TTenant tenant = null, TUser user = null)
        {
            Result = result;
            Tenant = tenant;
            User = user;
        }

        public ShaLoginResult(TTenant tenant, TUser user, ClaimsIdentity identity)
            : this(ShaLoginResultType.Success, tenant)
        {
            User = user;
            Identity = identity;
        }
    }
}
