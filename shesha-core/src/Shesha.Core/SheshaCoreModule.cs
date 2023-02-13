using Abp.Dependency;
using Abp.Modules;
using Abp.Reflection.Extensions;
using Abp.Timing;
using Abp.Zero;
using Abp.Zero.Configuration;
using Castle.MicroKernel.Registration;
using Shesha.Authorization;
using Shesha.Authorization.Roles;
using Shesha.Authorization.Users;
using Shesha.Domain;
using Shesha.Localization;
using Shesha.MultiTenancy;
using Shesha.Timing;

namespace Shesha
{
    [DependsOn(typeof(AbpZeroCoreModule),
        typeof(SheshaFrameworkModule))]
    public class SheshaCoreModule : AbpModule
    {
        public override void PreInitialize()
        {
            IocManager.IocContainer.Register(
                Component.For<ICustomPermissionChecker>().Forward<ShaPermissionChecker>().ImplementedBy<ShaPermissionChecker>().LifestyleTransient()
            );

            Configuration.Auditing.IsEnabledForAnonymousUsers = true;

            // Declare entity types
            Configuration.Modules.Zero().EntityTypes.Tenant = typeof(Tenant);
            Configuration.Modules.Zero().EntityTypes.Role = typeof(Role);
            Configuration.Modules.Zero().EntityTypes.User = typeof(User);

            SheshaLocalizationConfigurer.Configure(Configuration.Localization);

            // Enable this line to create a multi-tenant application.
            Configuration.MultiTenancy.IsEnabled = SheshaConsts.MultiTenancyEnabled;

            // Configure roles
            AppRoleConfig.Configure(Configuration.Modules.Zero().RoleManagement);
        }

        public override void Initialize()
        {
            IocManager.RegisterAssemblyByConvention(typeof(SheshaCoreModule).GetAssembly());
        }

        public override void PostInitialize()
        {
            IocManager.Resolve<AppTimes>().StartupTime = Clock.Now;

            //SeedHelper.SeedHostDb(IocManager);
        }
    }
}
