using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using Abp;
using Abp.AspNetCore.Configuration;
using Abp.AutoMapper;
using Abp.Configuration.Startup;
using Abp.Dependency;
using Abp.Modules;
using Abp.Net.Mail;
using Abp.Net.Mail.Smtp;
using Abp.Reflection;
using Abp.Reflection.Extensions;
using Castle.MicroKernel.Registration;
using Shesha.Authorization;
using Shesha.Configuration.Security.Frontend;
using Shesha.ConfigurationItems;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.DynamicEntities;
using Shesha.Email;
using Shesha.GraphQL;
using Shesha.Modules;
using Shesha.Notifications;
using Shesha.Notifications.Configuration;
using Shesha.Notifications.Distribution.NotificationChannels;
using Shesha.Notifications.Distribution.NotificationTypes;
using Shesha.Notifications.SMS;
using Shesha.Otp.Configuration;
using Shesha.Reflection;
using Shesha.Settings.Ioc;
using Shesha.ShaRoleAppointedPersons;
using Shesha.Sms;
using Shesha.Sms.Configuration;
using Shesha.Startup;

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

            Configuration.Authorization.Providers.Add<SheshaAuthorizationProvider>();
            Configuration.Authorization.Providers.Add<DbAuthorizationProvider>();

            // replace email sender
            Configuration.ReplaceService<ISmtpEmailSenderConfiguration, SmtpEmailSenderSettings>(DependencyLifeStyle.Transient);

            IocManager.IocContainer.Register(
                Component.For<IEmailSender>().Forward<ISheshaEmailSender>().Forward<SheshaEmailSender>().ImplementedBy<SheshaEmailSender>().LifestyleTransient(),
                Component.For(typeof(IEntityReorderer<,,>)).ImplementedBy(typeof(EntityReorderer<,,>)).LifestyleTransient()
            );

            IocManager.RegisterSettingAccessor<INotificationSettings>(s =>
            {
                s.NotificationSettings.WithDefaultValue(new NotificationSettings
                {
                    Low = new (),
                    Medium = new(),
                    High = new(),
                });

            });

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
                    var smsSettings = settings.SmsSettings.GetValueOrNull();
                    if (smsSettings == null)
                        return new NullSmsGateway();

                    var gatewayUid = smsSettings.SmsGateway;

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
            IocManager.RegisterSettingAccessor<IUserManagementSettings>(s =>
            {
                //s.UserManagementSettings.WithDefaultValue(new UserManagementSettings
                //{
                //    AdditionalRegistrationInfo = false,
                //    AdditionalRegistrationInfoForm = null,
                //    AllowSelfRegistration = true,
                //    CreationMode = RefListCreationMode.Always,
                //});

                s.DefaultAuthentication.WithDefaultValue(new DefaultAuthenticationSettings
                {
                    // Account Creation
                    RequireOtpVerification = true,
                    UseDefaultRegistrationForm = true,
                    UserEmailAsUsername = true,
                    SupportedVerificationMethods = SupportedRegistrationMethods.MobileNumber,

                    // Password Complexity
                    RequireDigit = true,
                    RequiredLength = 3,
                    RequireLowercase = true,

                    // One-Time-Pins
                    Alphabet = OtpDefaults.DefaultAlphabet,
                    PasswordLength = OtpDefaults.DefaultPasswordLength,
                    DefaultSubjectTemplate = OtpDefaults.DefaultSubjectTemplate,
                    DefaultBodyTemplate = OtpDefaults.DefaultBodyTemplate,
                    DefaultEmailSubjectTemplate = OtpDefaults.DefaultEmailSubjectTemplate,
                    DefaultEmailBodyTemplate = OtpDefaults.DefaultEmailBodyTemplate,

                    // Password resets
                    UseResetPasswordViaEmailLink = true,
                    ResetPasswordEmailLinkLifetime = 300
                });
            });

            IocManager.Register<ISheshaAuthorizationHelper, ApiAuthorizationHelper>(DependencyLifeStyle.Transient);
            IocManager.Register<ISheshaAuthorizationHelper, EntityCrudAuthorizationHelper>(DependencyLifeStyle.Transient);
            IocManager.Register<IShaRoleAppointedPersonAppService, ShaRoleAppointedPersonActionsAppService>(DependencyLifeStyle.Transient);

            IocManager
                .RegisterConfigurableItemManager<NotificationTypeConfig, INotificationManager, NotificationManager>()
                .RegisterConfigurableItemExport<NotificationTypeConfig, INotificationTypeExport, NotificationTypeExport>()
                .RegisterConfigurableItemImport<NotificationTypeConfig, INotificationTypeImport, NotificationTypeImport>()

                .RegisterConfigurableItemExport<NotificationChannelConfig, INotificationChannelExport, NotificationChannelExport>()
                .RegisterConfigurableItemImport<NotificationChannelConfig, INotificationChannelImport, NotificationChannelImport>();


            IocManager.RegisterIfNot<INotificationChannelSender, EmailChannelSender>(DependencyLifeStyle.Transient);
            IocManager.RegisterIfNot<INotificationChannelSender, SmsChannelSender>(DependencyLifeStyle.Transient);

            var thisAssembly = Assembly.GetExecutingAssembly();
            IocManager.RegisterAssemblyByConvention(thisAssembly);

            Configuration.Modules.AbpAutoMapper().Configurators.Add(
                // Scan the assembly for classes which inherit from AutoMapper.Profile
                cfg => cfg.AddMaps(thisAssembly)
            );
        }
    }
}
