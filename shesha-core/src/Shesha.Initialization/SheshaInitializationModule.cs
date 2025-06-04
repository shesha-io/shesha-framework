using Abp.Authorization;
using Abp.Modules;
using Abp.Web.Models;
using Shesha.Authorization;
using Shesha.Configuration.Runtime;
using Shesha.Exceptions;
using Shesha.NHibernate;

namespace Shesha.Initialization
{
    [DependsOn(
        typeof(SheshaFrameworkModule),
        typeof(SheshaNHibernateModule)
    )]

    public class SheshaInitializationModule: AbpModule
    {
        public override void PostInitialize()
        {
            /*IocManager.Resolve<IEntityConfigurationStore>().InitializeDynamic();
            IocManager.Resolve<ShaPermissionManager>().Initialize();

            var def = IocManager.Resolve<IPermissionDefinitionContext>();

            // register Shesha exception to error converter
            IocManager.Resolve<ErrorInfoBuilder>().AddExceptionConverter(IocManager.Resolve<ShaExceptionToErrorInfoConverter>());

            // Enabled by default for Background Jobs
            Configuration.EntityHistory.IsEnabledForAnonymousUsers = true;*/
        }
    }
}
