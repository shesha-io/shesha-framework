using Abp;
using Abp.AspNetCore;
using Abp.AutoMapper;
using Abp.Castle.Logging.Log4Net;
using Abp.Configuration;
using Abp.Configuration.Startup;
using Abp.Dependency;
using Abp.Domain.Uow;
using Abp.Modules;
using Abp.Net.Mail;
using Abp.TestBase;
using Abp.Zero.Configuration;
using Castle.Facilities.Logging;
using Castle.MicroKernel.Registration;
using Microsoft.AspNetCore.Mvc.ApplicationParts;
using Microsoft.Extensions.Configuration;
using Shesha.Configuration.Startup;
using Shesha.FluentMigrator;
using Shesha.NHibernate;
using Shesha.Services;
using Shesha.Tests.DependencyInjection;
using Shesha.Tests.Fixtures;
using Shesha.Web.FormsDesigner;
using System;
using System.Collections.Generic;
using System.Reflection;

namespace Shesha.Tests
{
    [DependsOn(
        
        typeof(AbpKernelModule),
        typeof(AbpTestBaseModule),
        typeof(AbpAspNetCoreModule),

        typeof(SheshaFormsDesignerModule),
        typeof(SheshaApplicationModule),
        typeof(SheshaFrameworkModule),
        typeof(SheshaNHibernateModule)        
        )]
    public class SheshaTestModule : AbpModule
    {
        public SheshaTestModule(SheshaNHibernateModule nhModule)
        {
            nhModule.SkipDbSeed = false;    // Set to false to apply DB Migration files on start up
        }

        public override void PreInitialize()
        {
            IocManager.MockWebHostEnvirtonment();

            var nhConfig = Configuration.Modules.ShaNHibernate();

            var dbFixture = IocManager.IsRegistered<IDatabaseFixture>()
                ? IocManager.Resolve<IDatabaseFixture>()
                : null;
            if (dbFixture != null /*&& false*/)
            {
                nhConfig.UseDbms(c => dbFixture.DbmsType, c => dbFixture.ConnectionString);
            }
            else
            {
                var config = new ConfigurationBuilder().AddJsonFile("appsettings.json").Build();
                nhConfig.UseDbms(c => config.GetDbmsType(), c => config.GetRequiredConnectionString("TestDB"));
            }

            Configuration.UnitOfWork.Timeout = TimeSpan.FromMinutes(30);
            Configuration.UnitOfWork.IsTransactional = false;

            // Disable static mapper usage since it breaks unit tests (see https://github.com/aspnetboilerplate/aspnetboilerplate/issues/2052)
            Configuration.Modules.AbpAutoMapper().UseStaticMapper = false;

            Configuration.BackgroundJobs.IsJobExecutionEnabled = false;

            // mock IWebHostEnvironment
            //var hostingEnvironment = Mock.Of<IWebHostEnvironment>(e => e.ApplicationName == "test");

            var inMemorySettings = new Dictionary<string, string?> {
                /* in memory settings:
                {"TopLevelKey", "TopLevelValue"},
                {"SectionName:SomeKey", "SectionValue"},
                */
            };

            var configuration = new ConfigurationBuilder()
                .AddInMemoryCollection(inMemorySettings)
                .Build();

            IocManager.IocContainer.Register(
                Component.For<IConfiguration>()
                    .Instance(configuration)
                    .LifestyleSingleton()
            );

            IocManager.MockApiExplorer();

            // Use database for language management
            Configuration.Modules.Zero().LanguageManagement.EnableDbLocalization();

            IocManager.RegisterFakeService<SheshaDbMigrator>();

            Configuration.ReplaceService<IDynamicRepository, Services.DynamicRepository>(DependencyLifeStyle.Transient);

            // replace email sender
            Configuration.ReplaceService<IEmailSender, NullEmailSender>(DependencyLifeStyle.Transient);

            // replace connection string resolver
            //Configuration.ReplaceService<IDbPerTenantConnectionStringResolver, TestConnectionStringResolver>(DependencyLifeStyle.Transient);

            Configuration.ReplaceService<ICurrentUnitOfWorkProvider, AsyncLocalCurrentUnitOfWorkProvider>(DependencyLifeStyle.Singleton);

            Configuration.EntityHistory.Selectors.Add("Settings", typeof(Setting));

            if (!IocManager.IsRegistered<ApplicationPartManager>())
                IocManager.IocContainer.Register(Component.For<ApplicationPartManager>().ImplementedBy<ApplicationPartManager>());
        }

        public override void Initialize()
        {
            var thisAssembly = Assembly.GetExecutingAssembly();
            IocManager.RegisterAssemblyByConvention(thisAssembly);

            IocManager.IocContainer.AddFacility<LoggingFacility>(f => f.UseAbpLog4Net().WithConfig("log4net.config"));

            ServiceCollectionRegistrar.Register(IocManager);
        }
    }
}