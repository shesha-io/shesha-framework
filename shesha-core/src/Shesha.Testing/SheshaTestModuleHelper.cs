using Abp.AspNetCore;
using Abp.AspNetCore.Configuration;
using Abp.AutoMapper;
using Abp.Configuration.Startup;
using Abp.Dependency;
using Abp.Domain.Uow;
using Abp.Modules;
using Abp.Net.Mail;
using Abp.Zero.Configuration;
using Castle.MicroKernel.Registration;
using Microsoft.AspNetCore.Mvc.ApplicationParts;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Moq;
using Shesha.Configuration.Startup;
using Shesha.FluentMigrator;
using Shesha.NHibernate;
using Shesha.Services;
using Shesha.Testing.DependencyInjection;
using Shesha.Testing.Fixtures;
using System;

namespace Shesha.Testing
{
    /// <summary>
    /// Extension methods for configuring Shesha test modules with common boilerplate.
    /// </summary>
    public static class SheshaTestModuleHelper
    {
        /// <summary>
        /// Configures common test module settings. Call this from your test module's <c>PreInitialize()</c>.
        /// Registers mocks, configures NHibernate, disables background services, and sets up
        /// standard service replacements needed by all Shesha integration test modules.
        /// </summary>
        /// <param name="module">The ABP module being configured.</param>
        /// <param name="iocManager">The IoC manager to register services with.</param>
        /// <param name="configFileName">The name of the appsettings JSON file (default: "appsettings.Test.json").</param>
        public static void ConfigureForTesting(this AbpModule module, IIocManager iocManager, string configFileName = "appsettings.Test.json")
        {
            var configuration = iocManager.Resolve<IAbpStartupConfiguration>();

            // --- Register service mocks ---
            iocManager.MockWebHostEnvironment();

            if (!iocManager.IsRegistered<IAbpAspNetCoreConfiguration>())
            {
                iocManager.IocContainer.Register(
                    Component.For<IAbpAspNetCoreConfiguration>()
                        .ImplementedBy<AbpAspNetCoreConfiguration>()
                        .LifestyleSingleton()
                );
            }

            if (!iocManager.IsRegistered<IHostApplicationLifetime>())
            {
                var appLifetimeMock = new Mock<IHostApplicationLifetime>();
                iocManager.IocContainer.Register(
                    Component.For<IHostApplicationLifetime>()
                        .Instance(appLifetimeMock.Object)
                        .LifestyleSingleton()
                );
            }

            // Register IConfiguration from appsettings file
            var testConfiguration = new ConfigurationBuilder().AddJsonFile(configFileName).Build();
            if (!iocManager.IsRegistered<IConfiguration>())
            {
                iocManager.IocContainer.Register(
                    Component.For<IConfiguration>()
                        .Instance(testConfiguration)
                        .Named("test-configuration")
                        .IsDefault()
                        .LifestyleSingleton()
                );
            }

            iocManager.MockApiExplorer();

            // --- Configure NHibernate ---
            var nhConfig = configuration.Modules.ShaNHibernate();

            var dbFixture = iocManager.IsRegistered<IDatabaseFixture>()
                ? iocManager.Resolve<IDatabaseFixture>()
                : null;
            if (dbFixture != null)
            {
                nhConfig.UseDbms(c => dbFixture.DbmsType, c => dbFixture.ConnectionString);
            }
            else
            {
                nhConfig.UseDbms(c => testConfiguration.GetDbmsType(), c => testConfiguration.GetRequiredConnectionString("TestDB"));
            }

            // --- Unit of Work ---
            configuration.UnitOfWork.Timeout = TimeSpan.FromMinutes(30);
            configuration.UnitOfWork.IsTransactional = false;

            // --- Disable features that interfere with testing ---
            configuration.Modules.AbpAutoMapper().UseStaticMapper = false;
            configuration.BackgroundJobs.IsJobExecutionEnabled = false;
            configuration.EntityHistory.IsEnabled = false;

            // --- DB localization ---
            configuration.Modules.Zero().LanguageManagement.EnableDbLocalization();

            // --- Service replacements ---
            iocManager.RegisterFakeService<SheshaDbMigrator>();
            configuration.ReplaceService<IDynamicRepository, DynamicRepository>(DependencyLifeStyle.Transient);
            configuration.ReplaceService<IEmailSender, NullEmailSender>(DependencyLifeStyle.Transient);
            configuration.ReplaceService<ICurrentUnitOfWorkProvider, AsyncLocalCurrentUnitOfWorkProvider>(DependencyLifeStyle.Singleton);

            if (!iocManager.IsRegistered<ApplicationPartManager>())
                iocManager.IocContainer.Register(Component.For<ApplicationPartManager>().ImplementedBy<ApplicationPartManager>());

            // --- Identity services ---
            ServiceCollectionRegistrar.Register(iocManager);
        }
    }
}
