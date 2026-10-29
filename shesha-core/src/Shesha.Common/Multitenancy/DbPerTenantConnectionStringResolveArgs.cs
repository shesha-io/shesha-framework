using Abp.Domain.Uow;

namespace Shesha.MultiTenancy
{
    public class DbPerTenantConnectionStringResolveArgs : ConnectionStringResolveArgs
    {
        public int? TenantId { get; set; }

        public DbPerTenantConnectionStringResolveArgs(int? tenantId, MultiTenancySides? multiTenancySide = null)
            : base(Side2AbpSide(multiTenancySide))
        {
            TenantId = tenantId;
        }

        public DbPerTenantConnectionStringResolveArgs(int? tenantId, ConnectionStringResolveArgs baseArgs)
        {
            TenantId = tenantId;
            MultiTenancySide = baseArgs.MultiTenancySide;

            foreach (var kvPair in baseArgs)
            {
                Add(kvPair.Key, kvPair.Value);
            }
        }

        private static Abp.MultiTenancy.MultiTenancySides? Side2AbpSide(MultiTenancySides? side) 
        {
            return side switch
            {
                MultiTenancySides.Host => Abp.MultiTenancy.MultiTenancySides.Host,
                MultiTenancySides.Tenant => Abp.MultiTenancy.MultiTenancySides.Tenant,
                null => null,
                _ => null,
            };
        }
    }
}