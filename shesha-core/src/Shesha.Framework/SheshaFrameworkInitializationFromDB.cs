using Abp.Dependency;
using Shesha.Attributes;
using Shesha.Authorization;
using Shesha.Bootstrappers;
using Shesha.Configuration.Runtime;
using System.Threading.Tasks;

namespace Shesha
{
    [DependsOnTypes(typeof(GenerateDynamicEntitiesDb))]
    public class SheshaFrameworkInitializationFromDB : IInitializatorFromDb, ITransientDependency
    {
        public readonly IIocManager _ioc;
        public SheshaFrameworkInitializationFromDB(IIocManager ioc) 
        {
            _ioc = ioc;
        }

        public async Task ProcessAsync()
        {
            _ioc.Resolve<ShaPermissionManager>().Initialize();
            await _ioc.Resolve<IEntityTypeConfigurationStore>().InitializeDynamicAsync();

            // ToDo: AS - refresh WebApi
        }
    }
}
