using Abp.Dependency;

namespace Shesha.Domain
{
    /// <summary>
    /// DB seed helper
    /// </summary>
    public static class SeedHelper
    {
        public static void SeedHostDb(IIocResolver iocResolver) 
        {
            var roleAndUserBuilder = iocResolver.Resolve<IHostRoleAndUserBuilder>();
            roleAndUserBuilder?.Create();
        }
    }
}
