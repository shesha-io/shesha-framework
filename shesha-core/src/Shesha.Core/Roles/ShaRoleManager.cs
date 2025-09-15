using Abp.Dependency;
using Shesha.ConfigurationItems;
using Shesha.Domain;

namespace Shesha.Roles
{
    /// <summary>
    /// Role manager
    /// </summary>
    public class ShaRoleManager : ConfigurationItemManager<ShaRole>, IShaRoleManager, ITransientDependency
    {
    }
}
