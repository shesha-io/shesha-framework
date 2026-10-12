using Abp.MultiTenancy;
using Shesha.Authorization.Users;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;

namespace Shesha.MultiTenancy
{
    [Entity(CrudActions = CrudActions.None, IsConfigurable = false)]
    public class Tenant : AbpTenant<User>
    {
        public Tenant()
        {            
        }

        public Tenant(string tenancyName, string name)
            : base(tenancyName, name)
        {
        }
    }
}
