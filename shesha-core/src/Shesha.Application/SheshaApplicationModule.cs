using Abp;
using Abp.AspNetCore.Configuration;
using Abp.AutoMapper;
using Abp.Configuration.Startup;
using Abp.Dependency;
using Abp.Modules;
using Abp.Net.Mail;
using Abp.Net.Mail.Smtp;
using Abp.Notifications;
using Abp.Reflection;
using Abp.Reflection.Extensions;
using Castle.MicroKernel.Registration;
using Shesha.Authorization;
using Shesha.Domain.Enums;
using Shesha.DynamicEntities;
using Shesha.Email;
using Shesha.GraphQL;
using Shesha.Modules;
using Shesha.Notifications;
using Shesha.Otp;
using Shesha.Otp.Configuration;
using Shesha.Reflection;
using Shesha.Settings.Ioc;
using Shesha.Sms;
using Shesha.Sms.Configuration;
using Shesha.Startup;
using Shesha.UserManagements.Configurations;
using System;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace Shesha
{
    [DependsOn(
        typeof(AbpKernelModule),
        typeof(SheshaCoreModule),
        typeof(SheshaGraphQLModule),
        typeof(AbpAutoMapperModule))]
    public class SheshaApplicationModule : SheshaSubModule<SheshaFrameworkModule>
    {
        public override async Task<bool> InitializeConfigurationAsync()
        {
            return await ImportConfigurationAsync();
        }

        public override void PreInitialize()
        {
            // disable API audit by default
            Configuration.Auditing.IsEnabled = false;

            IocManager.Register<IShaApplicationModuleConfiguration, ShaApplicationModuleConfiguration>();

            Configuration.Notifications.Providers.Add<ShaNotificationProvider>();
            Configuration.Notifications.Notifiers.Add<EmailRealTimeNotifier>();
            Configuration.Notifications.Notifiers.Add<SmsRealTimeNotifier>();

            Configuration.Authorization.Providers.Add<SheshaAuthorizationProvider>();
            Configuration.Authorization.Providers.Add<DbAuthorizationProvider>();

            // replace email sender
            Configuration.ReplaceService<ISmtpEmailSenderConfiguration, SmtpEmailSenderSettings>(DependencyLifeStyle.Transient);

            // ToDo: migrate Notification to ABP 6.6.2
            //Configuration.Notifications.Distributers.Clear();
            //Configuration.Notifications.Distributers.Add<ShaNotificationDistributer>();

            Configuration.ReplaceService<INotificationPublisher, ShaNotificationPublisher>(DependencyLifeStyle.Transient);

            IocManager.IocContainer.Register(
                Component.For<IEmailSender>().Forward<ISheshaEmailSender>().Forward<SheshaEmailSender>().ImplementedBy<SheshaEmailSender>().LifestyleTransient(),
                Component.For(typeof(IEntityReorderer<,,>)).ImplementedBy(typeof(EntityReorderer<,,>)).LifestyleTransient()
            );

            #region SMS Gateways

            IocManager.RegisterSettingAccessor<ISmsSettings>(s => {
                s.SmsSettings.WithDefaultValue(new SmsSettings
                {
                    SmsGateway = NullSmsGateway.Uid
                });
            });

            IocManager.Register<NullSmsGateway, NullSmsGateway>(DependencyLifeStyle.Transient);

            IocManager.IocContainer.Register(
                Component.For<ISmsGateway>().UsingFactoryMethod(f =>
                {
                    var settings = f.Resolve<ISmsSettings>();
                    var gatewayUid = settings.SmsSettings.GetValue().SmsGateway;

                    var gatewayType = !string.IsNullOrWhiteSpace(gatewayUid)
                        ? f.Resolve<ITypeFinder>().Find(t => typeof(ISmsGateway).IsAssignableFrom(t) && t.GetClassUid() == gatewayUid).FirstOrDefault()
                        : null;

                    var gateway = gatewayType != null
                        ? f.Resolve(gatewayType) as ISmsGateway
                        : null;

                    return gateway ?? new NullSmsGateway();
                }, managedExternally: true).LifestyleTransient()
            );

            #endregion

            Configuration.Modules.AbpAspNetCore()
                 .CreateControllersForAppServices(
                     typeof(SheshaApplicationModule).GetAssembly()
                 );
        }

        public override void Initialize()
        {
            IocManager.RegisterSettingAccessor<IOtpSettings>(s => {
                s.OneTimePins.WithDefaultValue(new OtpSettings
                {
                    Alphabet = OtpDefaults.DefaultAlphabet,
                    PasswordLength = OtpDefaults.DefaultPasswordLength,
                    DefaultLifetime = OtpDefaults.DefaultLifetime,
                    DefaultSubjectTemplate = OtpDefaults.DefaultSubjectTemplate,
                    DefaultBodyTemplate = OtpDefaults.DefaultBodyTemplate,
                    DefaultEmailSubjectTemplate = OtpDefaults.DefaultEmailSubjectTemplate,
                    DefaultEmailBodyTemplate = OtpDefaults.DefaultEmailBodyTemplate
                });
            });

            IocManager.RegisterSettingAccessor<IUserManagementSettings>(s => {
                s.UserManagementSettings.WithDefaultValue(new UserManagementSettings
                {
                   SupportedRegistrationMethods = SupportedRegistrationMethods.MobileNumber,
                   GoToUrlAfterRegistration = "/",
                   UserEmailAsUsername = false,
                   AdditionalRegistrationInfo = false,
                   AdditionalRegistrationInfoFormModule = null,
                   AdditionalRegistrationInfoFormName = null
                });
            });

            IocManager.Register<ISheshaAuthorizationHelper, ApiAuthorizationHelper>(DependencyLifeStyle.Transient);
            IocManager.Register<ISheshaAuthorizationHelper, EntityCrudAuthorizationHelper>(DependencyLifeStyle.Transient);

            var thisAssembly = Assembly.GetExecutingAssembly();
            IocManager.RegisterAssemblyByConvention(thisAssembly);

            /* api not used now, this registration causes problems in the IoC. Need to solve IoC problem before uncommenting
            var schemaContainer = IocManager.Resolve<ISchemaContainer>();
            var serviceProvider = IocManager.Resolve<IServiceProvider>();
            schemaContainer.RegisterCustomSchema("api", new ApiSchema(serviceProvider));
            */

            Configuration.Modules.AbpAutoMapper().Configurators.Add(
                // Scan the assembly for classes which inherit from AutoMapper.Profile
                cfg => cfg.AddMaps(thisAssembly)
            );
        }
    }
}
