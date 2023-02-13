using Abp;
using Abp.AutoMapper;
using Abp.Configuration;
using Abp.Configuration.Startup;
using Abp.Dependency;
using Abp.Modules;
using Abp.Net.Mail;
using Abp.Net.Mail.Smtp;
using Abp.Notifications;
using Abp.Reflection;
using Castle.MicroKernel.Registration;
using Shesha.Authorization;
using Shesha.Configuration;
using Shesha.Email;
using Shesha.Notifications;
using Shesha.Otp.Configuration;
using Shesha.Push;
using Shesha.Push.Configuration;
using Shesha.Reflection;
using Shesha.Sms;
using Shesha.Sms.Configuration;
using Shesha.Startup;
using System.Linq;
using System.Reflection;
using Abp.Authorization;
using Shesha.GraphQL;
using Shesha.Validations;
using Shesha.GraphQL.Provider;
using Shesha.Api;
using System;

namespace Shesha
{
    [DependsOn(
        typeof(AbpKernelModule),
        typeof(SheshaCoreModule),
        typeof(SheshaGraphQLModule),
        typeof(AbpAutoMapperModule))]
    public class SheshaApplicationModule : AbpModule
    {
        public override void PreInitialize()
        {
            IocManager.Register<IShaApplicationModuleConfiguration, ShaApplicationModuleConfiguration>();

            Configuration.Settings.Providers.Add<SmsSettingProvider>();
            Configuration.Settings.Providers.Add<PushSettingProvider>();
            Configuration.Settings.Providers.Add<EmailSettingProvider>();
            Configuration.Notifications.Providers.Add<ShaNotificationProvider>();
            Configuration.Notifications.Notifiers.Add<EmailRealTimeNotifier>();
            Configuration.Notifications.Notifiers.Add<SmsRealTimeNotifier>();
            Configuration.Notifications.Notifiers.Add<PushRealTimeNotifier>();

            Configuration.Authorization.Providers.Add<SheshaAuthorizationProvider>();
            Configuration.Authorization.Providers.Add<DbAuthorizationProvider>();

            // replace email sender
            Configuration.ReplaceService<ISmtpEmailSenderConfiguration, SmtpEmailSenderSettings>(DependencyLifeStyle.Transient);

            Configuration.Settings.Providers.Add<OtpSettingProvider>();

            // ToDo: migrate Notification to ABP 6.6.2
            //Configuration.Notifications.Distributers.Clear();
            //Configuration.Notifications.Distributers.Add<ShaNotificationDistributer>();

            Configuration.ReplaceService<INotificationPublisher, ShaNotificationPublisher>(DependencyLifeStyle.Transient);

            IocManager.IocContainer.Register(
                Component.For<IEmailSender>().Forward<ISheshaEmailSender>().Forward<SheshaEmailSender>().ImplementedBy<SheshaEmailSender>().LifestyleTransient()
            );

            #region Push notifications

            IocManager.Register<NullPushNotifier, NullPushNotifier>(DependencyLifeStyle.Transient);
            IocManager.IocContainer.Register(
                Component.For<IPushNotifier>().UsingFactoryMethod(f =>
                {
                    var settings = f.Resolve<ISettingManager>();
                    var pushNotifier = settings.GetSettingValue(SheshaSettingNames.Push.PushNotifier);

                    var pushNotifierType = !string.IsNullOrWhiteSpace(pushNotifier)
                        ? f.Resolve<ITypeFinder>().Find(t => typeof(IPushNotifier).IsAssignableFrom(t) && t.GetClassUid() == pushNotifier).FirstOrDefault()
                        : null;

                    if (pushNotifierType == null)
                        pushNotifierType = typeof(NullPushNotifier);

                    return pushNotifierType != null
                        ? f.Resolve(pushNotifierType) as IPushNotifier
                        : null;
                }, managedExternally: true).LifestyleTransient()
            );

            #endregion

            #region SMS Gateways

            IocManager.Register<NullSmsGateway, NullSmsGateway>(DependencyLifeStyle.Transient);
            IocManager.IocContainer.Register(
                Component.For<ISmsGateway>().UsingFactoryMethod(f =>
                {
                    var settings = f.Resolve<ISettingManager>();
                    var gatewayUid = settings.GetSettingValue(SheshaSettingNames.Sms.SmsGateway);

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
        }

        public override void Initialize()
        {
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
