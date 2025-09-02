using Abp.Dependency;
using Shesha.ConfigurationItems;
using Shesha.Domain;
using System.Threading.Tasks;

namespace Shesha.Roles
{
    /// <summary>
    /// Role manager
    /// </summary>
    public class ShaRoleManager : ConfigurationItemManager<ShaRole, ShaRoleRevision>, IShaRoleManager, ITransientDependency
    {
        protected override Task CopyRevisionPropertiesAsync(ShaRoleRevision source, ShaRoleRevision destination)
        {
            throw new System.NotImplementedException();
        }
    }
}
