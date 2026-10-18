using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Castle.Core.Logging;
using Shesha.ConfigurationItems.Specifications;
using Shesha.Domain;
using Shesha.Otp.Configuration;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shesha.Otp
{
    /// <summary>
    /// Moves OTP message templates customised in the (obsolete) OTP settings into the notification templates of the OTP configurations,
    /// so sites that changed the wording keep it after OTPs moved to the notification subsystem
    /// </summary>
    public class OtpLegacyTemplatesMigrator : IOtpLegacyTemplatesMigrator, ITransientDependency
    {
        /// <summary>
        /// Notification types of the OTP configurations that send a pin (legacy: subject/body template)
        /// </summary>
        private static readonly string[] PinNotificationTypes = [
            OtpConfigNames.OtpLogin,
            OtpConfigNames.PasswordResetSms,
            OtpConfigNames.OtpSms,
            OtpConfigNames.OtpEmail,
        ];

        /// <summary>
        /// Notification types of the OTP configurations that send an email link (legacy: email subject/body template)
        /// </summary>
        private static readonly string[] LinkNotificationTypes = [
            OtpConfigNames.PasswordResetEmailLink,
            OtpConfigNames.EmailRegistrationLink,
            OtpConfigNames.OtpEmailLink,
        ];

        private readonly IOtpSettings _otpSettings;
        private readonly IRepository<NotificationTypeConfig, Guid> _notificationTypeRepository;
        private readonly IRepository<NotificationTemplate, Guid> _templateRepository;
        private readonly IUnitOfWorkManager _unitOfWorkManager;

        public ILogger Logger { get; set; } = NullLogger.Instance;

        public OtpLegacyTemplatesMigrator(
            IOtpSettings otpSettings,
            IRepository<NotificationTypeConfig, Guid> notificationTypeRepository,
            IRepository<NotificationTemplate, Guid> templateRepository,
            IUnitOfWorkManager unitOfWorkManager)
        {
            _otpSettings = otpSettings;
            _notificationTypeRepository = notificationTypeRepository;
            _templateRepository = templateRepository;
            _unitOfWorkManager = unitOfWorkManager;
        }

        /// inheritedDoc
        public async Task MigrateAsync()
        {
            try
            {
                using (var uow = _unitOfWorkManager.Begin())
                {
                    await MigrateInternalAsync();
                    await uow.CompleteAsync();
                }
            }
            catch (Exception e)
            {
                // never block the application start-up, the migration is retried on the next initialization
                Logger.Error("Failed to migrate customised OTP templates into the notification templates", e);
            }
        }

        private async Task MigrateInternalAsync()
        {
            var settings = await _otpSettings.OneTimePins.GetValueOrNullAsync();
            if (settings == null || settings.LegacyTemplatesMigrated)
                return;

            var pinSubject = GetCustomisedOrNull(settings.DefaultSubjectTemplate, OtpDefaults.DefaultSubjectTemplate);
            var pinBody = GetCustomisedOrNull(settings.DefaultBodyTemplate, OtpDefaults.DefaultBodyTemplate);
            var linkSubject = GetCustomisedOrNull(settings.DefaultEmailSubjectTemplate, OtpDefaults.DefaultEmailSubjectTemplate);
            var linkBody = GetCustomisedOrNull(settings.DefaultEmailBodyTemplate, OtpDefaults.DefaultEmailBodyTemplate);

            // nothing customised - keep the seeded templates and check again on the next initialization
            if (pinSubject == null && pinBody == null && linkSubject == null && linkBody == null)
                return;

            var updated = new List<string>();
            updated.AddRange(await UpdateTemplatesAsync(PinNotificationTypes, pinSubject, pinBody));
            updated.AddRange(await UpdateTemplatesAsync(LinkNotificationTypes, linkSubject, linkBody));

            settings.LegacyTemplatesMigrated = true;
            await _otpSettings.OneTimePins.SetValueAsync(settings);

            Logger.Warn($"Customised OTP templates migrated from the OTP settings into the notification templates: {string.Join(", ", updated)}");
        }

        private async Task<List<string>> UpdateTemplatesAsync(string[] notificationTypeNames, string? title, string? body)
        {
            var updated = new List<string>();
            if (title == null && body == null)
                return updated;

            foreach (var name in notificationTypeNames)
            {
                var type = await _notificationTypeRepository.FirstOrDefaultAsync(new ByNameAndModuleSpecification<NotificationTypeConfig>(name, OtpConfigNames.Module).ToExpression());
                if (type == null)
                {
                    Logger.Warn($"Notification type '{OtpConfigNames.Module}/{name}' not found, its OTP templates were not migrated");
                    continue;
                }

                var templates = await _templateRepository.GetAllListAsync(t => t.PartOf == type);
                foreach (var template in templates)
                {
                    if (title != null)
                        template.TitleTemplate = title;
                    if (body != null)
                        template.BodyTemplate = body;
                    await _templateRepository.UpdateAsync(template);
                }
                updated.Add($"{name} ({templates.Count})");
            }
            return updated;
        }

        /// <summary>
        /// Returns the template when it differs from the framework default, null otherwise
        /// </summary>
        private static string? GetCustomisedOrNull(string? value, string defaultValue)
        {
            if (string.IsNullOrWhiteSpace(value))
                return null;

            static string Normalize(string s) => s.Replace("\r\n", "\n").Trim();
            return Normalize(value) == Normalize(defaultValue) ? null : value;
        }
    }
}
