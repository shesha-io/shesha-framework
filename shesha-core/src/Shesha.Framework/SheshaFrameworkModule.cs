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
using Shesha.Configuration.Email;
using Shesha.Configuration.Security;
using Shesha.ConfigurationItems;
using Shesha.Domain;
using Shesha.DynamicEntities.Distribution;
using Shesha.Exceptions;
using Shesha.Extensions;
using Shesha.Locks;
using Shesha.Modules;
using Shesha.Services;
using Shesha.Services.ReferenceLists;
using Shesha.Services.ReferenceLists.Distribution;
using Shesha.Services.Settings;
using Shesha.Services.Settings.Distribution;
using Shesha.Services.StoredFiles;
using Shesha.Settings;
using Shesha.Settings.Ioc;
using Shesha.Validations;
using System.Reflection;

namespace Shesha
{
    [DependsOn(typeof(AbpAutoMapperModule))]
    public class SheshaFrameworkModule : SheshaModule
    {
        public const string ModuleName = "Shesha";
        public override SheshaModuleInfo ModuleInfo => new SheshaModuleInfo(ModuleName) { 
            FriendlyName = "Shesha Core",
            Publisher = "Shesha",
#if DisableEditModule
            IsEditable = false,
#endif
        };

        public SheshaFrameworkModule()
        {
        }

        public override void PreInitialize()
        {
            IocManager.Register<IPermissionManager, IShaPermissionManager, IPermissionDefinitionContext, ShaPermissionManager>();

            Configuration.ReplaceService(typeof(IExceptionFilter),
                () =>
                {
                    IocManager.Register<IExceptionFilter, SheshaExceptionFilter>(DependencyLifeStyle.Transient);
                });

            // register validator to check IValidatableObject from AbpValidationActionFilter
            Configuration.Validation.Validators.Add<ShaValidatableObjectValidator>();

            Configuration.Modules.AbpAutoMapper().Configurators.Add(config =>
            {
                // disable methods mapping to prevent exception like this: `GenericArguments[0], 'TId', on 'T MaxInteger[T](System.Collections.Generic.IEnumerable`1[T])' violates the constraint of type 'T'.`
                // https://github.com/AutoMapper/AutoMapper/issues/3988
                config.ShouldMapMethod = m => false;
            });
        }

        public override void Initialize()
        {
            var thisAssembly = Assembly.GetExecutingAssembly();

            Configuration.Modules.AbpAutoMapper().Configurators.Add(
                // Scan the assembly for classes which inherit from AutoMapper.Profile
                cfg => cfg.AddMaps(thisAssembly)
            );

            IocManager.Register<IShaPermissionChecker, ShaPermissionChecker>(DependencyLifeStyle.Transient);

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

            IocManager
                .RegisterConfigurableItemManager<ReferenceList, IReferenceListManager, ReferenceListManager>()
                .RegisterConfigurableItemExport<ReferenceList, IReferenceListExport, ReferenceListExport>()
                .RegisterConfigurableItemImport<ReferenceList, IReferenceListImport, ReferenceListImport>();

            IocManager
                .RegisterConfigurableItemExport<EntityConfig, IEntityConfigExport, EntityConfigExport>()
                .RegisterConfigurableItemImport<EntityConfig, IEntityConfigImport, EntityConfigImport>();

            IocManager
                .RegisterConfigurableItemExport<PermissionDefinition, IPermissionDefinitionExport, PermissionDefinitionExport>()
                .RegisterConfigurableItemImport<PermissionDefinition, PermissionDefinitionImport, PermissionDefinitionImport>();

            IocManager
                .RegisterConfigurableItemManager<SettingConfiguration, ISettingStore, SettingStore>()
                .RegisterConfigurableItemExport<SettingConfiguration, ISettingExport, SettingExport>()
                .RegisterConfigurableItemImport<SettingConfiguration, ISettingImport, SettingImport>();


            IocManager.IocContainer.Register(
                Component.For(typeof(ISettingAccessor<>)).ImplementedBy(typeof(SettingAccessor<>)).LifestyleTransient()
            );

            IocManager.RegisterAssemblyByConvention(thisAssembly);

            IocManager.RegisterSettingAccessor<ISecuritySettings>(s => {
                s.UserLockOutEnabled.WithDefaultValue(true);
                s.MaxFailedAccessAttemptsBeforeLockout.WithDefaultValue(5);
                s.DefaultAccountLockoutSeconds.WithDefaultValue(300 /* 5 minutes */);
                s.SecuritySettings.WithDefaultValue(new SecuritySettings
                {
                    AutoLogoffTimeout = 0,
                    UseResetPasswordViaEmailLink = true,
                    ResetPasswordEmailLinkLifetime = 60,
                    UseResetPasswordViaSmsOtp = true,
                    ResetPasswordSmsOtpLifetime = 60,
                    MobileLoginPinLifetime = 60,
                    UseResetPasswordViaSecurityQuestions = true,
                    ResetPasswordViaSecurityQuestionsNumQuestionsAllowed = 3,
                    DefaultEndpointAccess = Domain.Enums.RefListPermissionedAccess.AllowAnonymous
                });
            });

            IocManager.RegisterSettingAccessor<IPasswordComplexitySettings>(s => {
                s.RequiredLength.WithDefaultValue(3);
            });
            IocManager.RegisterSettingAccessor<ISheshaSettings>(s => {
                s.UploadFolder.WithDefaultValue("~/App_Data/Upload");
            });
            IocManager.RegisterSettingAccessor<IFrontendSettings>(s => {
                s.Theme.WithDefaultValue(ThemeSettings.Default);
                s.MainMenu.WithDefaultValue(MainMenuSettings.Default);
            });

            IocManager.RegisterSettingAccessor<IEmailSettings>(s => {
                s.SmtpSettings.WithDefaultValue(new SmtpSettings
                {
                    Port = 25,
                    UseSmtpRelay = false,
                    EnableSsl = false,
                });
            });
        }

        public override void PostInitialize()
        {
            IocManager.Resolve<ShaPermissionManager>().Initialize();
            //IocManager.Resolve<SheshaSettingDefinitionManager>().Initialize();

            var def = IocManager.Resolve<IPermissionDefinitionContext>();

            // register Shesha exception to error converter
            IocManager.Resolve<ErrorInfoBuilder>().AddExceptionConverter(IocManager.Resolve<ShaExceptionToErrorInfoConverter>());

            // Enabled by default for Background Jobs
            Configuration.EntityHistory.IsEnabledForAnonymousUsers = true;
        }
    }
}