using Abp.Authorization;
using Abp.AutoMapper;
using Abp.Dependency;
using Abp.Modules;
using Abp.Web.Models;
using Castle.MicroKernel.Registration;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Configuration;
using Shesha.Authorization;
using Shesha.Configuration;
using Shesha.ConfigurationItems;
using Shesha.ConfigurationItems.Distribution;
using Shesha.DynamicEntities.Distribution;
using Shesha.Exceptions;
using Shesha.Extensions;
using Shesha.Locks;
using Shesha.Modules;
using Shesha.Services;
using Shesha.Services.ReferenceLists;
using Shesha.Services.ReferenceLists.Distribution;
using Shesha.Services.StoredFiles;
using System.Reflection;

namespace Shesha
{
    [DependsOn(typeof(AbpAutoMapperModule))]
    public class SheshaFrameworkModule : SheshaModule
    {
        public override SheshaModuleInfo ModuleInfo => new SheshaModuleInfo("Shesha") { 
            FriendlyName = "Shesha Core",
            Publisher = "Boxfusion" 
        };

        public SheshaFrameworkModule()
        {
        }

        public override void PreInitialize()
        {
            Configuration.Settings.Providers.Add<SheshaSettingProvider>();
            IocManager.Register<IPermissionManager, IShaPermissionManager, IPermissionDefinitionContext, ShaPermissionManager>();

            Configuration.ReplaceService(typeof(IExceptionFilter),
                () =>
                {
                    IocManager.Register<IExceptionFilter, SheshaExceptionFilter>(DependencyLifeStyle.Transient);
                });

            //Configuration.ReplaceService<ISettingDefinitionManager, SheshaSettingDefinitionManager>(DependencyLifeStyle.Singleton);
        }

        public override void Initialize()
        {
            var thisAssembly = Assembly.GetExecutingAssembly();

            Configuration.Modules.AbpAutoMapper().Configurators.Add(
                // Scan the assembly for classes which inherit from AutoMapper.Profile
                cfg => cfg.AddMaps(thisAssembly)
            );

            IocManager.Register<IShaPermissionChecker, PermissionChecker>(DependencyLifeStyle.Transient);

            IocManager.Register<ILockFactory, NamedLockFactory>(DependencyLifeStyle.Singleton);

            IocManager.Register<StoredFileService, StoredFileService>(DependencyLifeStyle.Transient);
            IocManager.Register<AzureStoredFileService, AzureStoredFileService>(DependencyLifeStyle.Transient);
            IocManager.IocContainer.Register(
                Component.For<IStoredFileService>().UsingFactoryMethod(f =>
                {
                    // IConfiguration configuration
                    var configuration = f.Resolve<IConfiguration>();
                    var isAzureEnvironment = configuration.GetValue<bool>("IsAzureEnvironment");

                    return isAzureEnvironment
                        ? f.Resolve<AzureStoredFileService>() as IStoredFileService
                        : f.Resolve<StoredFileService>() as IStoredFileService;
                })
            );

            IocManager.IocContainer.Register(
                Component.For<IConfigurableItemExport>().Forward<IEntityConfigExport>().ImplementedBy<EntityConfigExport>().LifestyleTransient()
            );
            IocManager.IocContainer.Register(
                Component.For<IConfigurableItemImport>().Forward<IEntityConfigImport>().ImplementedBy<EntityConfigImport>().LifestyleTransient()
            );

            IocManager.IocContainer.Register(
                Component.For<IConfigurableItemImport>().Forward<IReferenceListImport>().ImplementedBy<ReferenceListImport>().LifestyleTransient()
            );
            IocManager.IocContainer.Register(
                Component.For<IConfigurableItemExport>().Forward<IReferenceListExport>().ImplementedBy<ReferenceListExport>().LifestyleTransient()
            );

            IocManager.IocContainer.Register(
                Component.For<IConfigurationItemManager>().Forward<IReferenceListManager>().ImplementedBy<ReferenceListManager>().LifestyleTransient()
            );

            IocManager.RegisterAssemblyByConvention(thisAssembly);
        }

        public override void PostInitialize()
        {
            IocManager.Resolve<ShaPermissionManager>().Initialize();
            //IocManager.Resolve<SheshaSettingDefinitionManager>().Initialize();

            var def = IocManager.Resolve<IPermissionDefinitionContext>();

            // register Shesha exception to error converter
            IocManager.Resolve<ErrorInfoBuilder>().AddExceptionConverter(IocManager.Resolve<ShaExceptionToErrorInfoConverter>());
        }
    }
}