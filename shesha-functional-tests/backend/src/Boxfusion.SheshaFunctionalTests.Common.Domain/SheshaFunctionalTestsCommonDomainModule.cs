using System.Reflection;
using Abp.AspNetCore.Configuration;
using Abp.AutoMapper;
using Abp.Modules;
using Castle.MicroKernel.Registration;
using Shesha;
using Shesha.Authorization;
using Shesha.Startup;

namespace Boxfusion.SheshaFunctionalTests.Common
{
    /// <summary>
    /// SheshaFunctionalTests Module
    /// </summary>
    [DependsOn(
        typeof(SheshaCoreModule)
    )]
    public class SheshaFunctionalTestsCommonDomainModule : AbpModule
    {
        /// inheritedDoc
        public override void Initialize()
        {
            var thisAssembly = Assembly.GetExecutingAssembly();
            IocManager.RegisterAssemblyByConvention(thisAssembly);

            Configuration.Modules.AbpAutoMapper().Configurators.Add(
                // Scan the assembly for classes which inherit from AutoMapper.Profile
                cfg => cfg.AddMaps(thisAssembly)
            );
        }

        /// inheritedDoc
        public override void PreInitialize()
        {
            base.PreInitialize();
        }

        /// inheritedDoc
        public override void PostInitialize()
        {
            // Exposing of AppServices and Apis should be within Application layer
        }
    }
}
