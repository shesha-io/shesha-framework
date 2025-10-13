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

        public Task ProcessAsync()
        {
            _ioc.Resolve<IEntityConfigurationStore>().InitializeDynamic();
            _ioc.Resolve<ShaPermissionManager>().Initialize();

            // ToDo: AS - refresh WebApi

            return Task.CompletedTask;
        }
    }
}
