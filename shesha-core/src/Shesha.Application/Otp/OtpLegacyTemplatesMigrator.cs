using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Castle.Core.Logging;
using Shesha.Configuration;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.Otp.Configuration;
using Shesha.Settings;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace Shesha.Otp
{
    /// <summary>
    /// Moves OTP message templates customised in the (obsolete) OTP settings into the notification templates of the OTP configurations,
    /// so sites that changed the wording keep it after OTPs moved to the notification subsystem
    /// </summary>
    public class OtpLegacyTemplatesMigrator : IOtpLegacyTemplatesMigrator, ITransientDependency
    {
        private readonly IOtpSettings _otpSettings;
        private readonly IRepository<OtpConfig, Guid> _otpConfigRepository;
        private readonly IRepository<NotificationTemplate, Guid> _templateRepository;
        private readonly IRepository<FrontEndApp, Guid> _frontEndAppRepository;
        private readonly IFrontendSettings _frontendSettings;
        private readonly IUnitOfWorkManager _unitOfWorkManager;

        /// <summary>
        /// Framework configurations that sent the legacy pin template (sms and email pins)
        /// </summary>
        private static readonly string[] PinConfigs = [OtpConfigNames.OtpLogin, OtpConfigNames.OtpPasswordResetSms, OtpConfigNames.OtpSms, OtpConfigNames.OtpEmail];

        /// <summary>
        /// Framework configurations that sent the legacy email link template
        /// </summary>
        private static readonly string[] LinkConfigs = [OtpConfigNames.OtpPasswordResetEmailLink, OtpConfigNames.OtpEmailRegistrationLink, OtpConfigNames.OtpEmailLink];

        public ILogger Logger { get; set; } = NullLogger.Instance;

        public OtpLegacyTemplatesMigrator(
            IOtpSettings otpSettings,
            IRepository<OtpConfig, Guid> otpConfigRepository,
            IRepository<NotificationTemplate, Guid> templateRepository,
            IRepository<FrontEndApp, Guid> frontEndAppRepository,
            IFrontendSettings frontendSettings,
            IUnitOfWorkManager unitOfWorkManager)
        {
            _otpSettings = otpSettings;
            _otpConfigRepository = otpConfigRepository;
            _templateRepository = templateRepository;
            _frontEndAppRepository = frontEndAppRepository;
            _frontendSettings = frontendSettings;
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
            if (settings == null)
                return;

            var pinSubject = GetCustomisedOrNull(settings.DefaultSubjectTemplate, OtpDefaults.DefaultSubjectTemplate);
            var pinBody = GetCustomisedOrNull(settings.DefaultBodyTemplate, OtpDefaults.DefaultBodyTemplate);
            var linkSubject = GetCustomisedOrNull(settings.DefaultEmailSubjectTemplate, OtpDefaults.DefaultEmailSubjectTemplate);
            var linkBody = GetCustomisedOrNull(settings.DefaultEmailBodyTemplate, OtpDefaults.DefaultEmailBodyTemplate);

            // nothing customised - keep the seeded templates
            if (pinSubject == null && pinBody == null && linkSubject == null && linkBody == null)
                return;

            if (linkBody != null)
                linkBody = await UsePublicUrlPlaceholderAsync(linkBody);

            // The legacy templates were used by the framework flows only. Their configurations are selected by name:
            // the pin type can be changed by an administrator and doesn't tell which message a configuration sends
            var configs = await _otpConfigRepository.GetAllListAsync(c => c.NotificationType != null && c.Module != null && c.Module.Name == OtpConfigNames.Module);

            // the pin templates were plain text (sms and email), the link templates were html
            var pin = await UpdateTemplatesAsync(configs, PinConfigs, pinSubject, pinBody, bodyIsHtml: false);
            var link = await UpdateTemplatesAsync(configs, LinkConfigs, linkSubject, linkBody, bodyIsHtml: true);

            // Clear the moved templates so the ones edited in the notification editor are not overwritten on the next start-up.
            // A customised template that found no destination (e.g. the seed package was not imported) stays in the settings:
            // they are the only copy of it, the move is retried on the next start-up
            var notMoved = new List<string>();
            settings.DefaultSubjectTemplate = ClearIfMoved(settings.DefaultSubjectTemplate, pinSubject, pin.TitleWritten, nameof(settings.DefaultSubjectTemplate), notMoved);
            settings.DefaultBodyTemplate = ClearIfMoved(settings.DefaultBodyTemplate, pinBody, pin.BodyWritten, nameof(settings.DefaultBodyTemplate), notMoved);
            settings.DefaultEmailSubjectTemplate = ClearIfMoved(settings.DefaultEmailSubjectTemplate, linkSubject, link.TitleWritten, nameof(settings.DefaultEmailSubjectTemplate), notMoved);
            settings.DefaultEmailBodyTemplate = ClearIfMoved(settings.DefaultEmailBodyTemplate, linkBody, link.BodyWritten, nameof(settings.DefaultEmailBodyTemplate), notMoved);

            var updated = pin.NotificationTypes.Concat(link.NotificationTypes).ToList();
            if (updated.Any())
            {
                await _otpSettings.OneTimePins.SetValueAsync(settings);
                Logger.Warn($"Customised OTP templates were moved from the OTP settings into the notification templates of: {string.Join(", ", updated)}");
            }

            if (notMoved.Any())
                Logger.Warn($"Customised OTP templates were kept in the OTP settings, no notification template can take them: {string.Join(", ", notMoved)}");
        }

        /// <summary>
        /// Value of a legacy template setting after the move: cleared when it was moved or was never customised, kept otherwise
        /// </summary>
        private static string? ClearIfMoved(string? currentValue, string? customisedValue, bool written, string settingName, List<string> notMoved)
        {
            if (customisedValue == null || written)
                return null;

            notMoved.Add(settingName);
            return currentValue;
        }

        /// <summary>
        /// Result of the move of a legacy title/body pair
        /// </summary>
        private sealed record TemplatesUpdate(bool TitleWritten, bool BodyWritten, List<string> NotificationTypes);

        private async Task<TemplatesUpdate> UpdateTemplatesAsync(List<OtpConfig> configs, string[] configNames, string? title, string? body, bool bodyIsHtml)
        {
            var updated = new List<string>();
            var titleWritten = false;
            var bodyWritten = false;
            if (title == null && body == null)
                return new TemplatesUpdate(titleWritten, bodyWritten, updated);

            var notificationTypes = configs
                .Where(c => configNames.Contains(c.Name))
                .Select(c => c.NotificationType)
                .OfType<NotificationTypeConfig>()
                .Distinct();

            foreach (var notificationType in notificationTypes)
            {
                var templates = await _templateRepository.GetAllListAsync(t => t.PartOf == notificationType);
                var typeUpdated = false;
                foreach (var template in templates)
                {
                    var templateBody = body != null ? ConvertBody(body, bodyIsHtml, template.MessageFormat) : null;
                    if (title == null && templateBody == null)
                        continue;

                    if (title != null)
                    {
                        template.TitleTemplate = title;
                        titleWritten = true;
                    }

                    if (templateBody != null)
                    {
                        template.BodyTemplate = templateBody;
                        bodyWritten = true;
                    }

                    await _templateRepository.UpdateAsync(template);
                    typeUpdated = true;
                }

                if (typeUpdated)
                    updated.Add(notificationType.Name);
            }
            return new TemplatesUpdate(titleWritten, bodyWritten, updated);
        }

        /// <summary>
        /// Replace the site address hardcoded in the links of a legacy template with the <c>{{publicUrl}}</c> placeholder.
        /// Only addresses equal to a configured public url of a front-end application are replaced, so the links keep working
        /// on sites where the public url setting was never filled in
        /// </summary>
        private async Task<string> UsePublicUrlPlaceholderAsync(string body)
        {
            var publicUrls = new List<string?> { await _frontendSettings.PublicUrl.GetValueOrNullAsync() };
            var apps = await _frontEndAppRepository.GetAllListAsync();
            foreach (var app in apps)
            {
                publicUrls.Add(await _frontendSettings.PublicUrl.GetValueOrNullAsync(new SettingManagementContext { AppKey = app.AppKey }));
            }

            var placeholder = "{{" + OtpNotificationData.PlaceholderNames.PublicUrl + "}}/";
            var siteAddresses = publicUrls
                .Where(url => !string.IsNullOrWhiteSpace(url))
                .Select(url => url!.Trim().TrimEnd('/') + "/")
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .OrderByDescending(url => url.Length);

            // the trailing slash is part of the match, it prevents replacement of a part of another host name
            foreach (var siteAddress in siteAddresses)
            {
                body = body.Replace(siteAddress, placeholder, StringComparison.OrdinalIgnoreCase);
            }
            return body;
        }

        /// <summary>
        /// Convert legacy body to the format of the notification template. Returns null when the body can't be used for the format
        /// </summary>
        private static string? ConvertBody(string body, bool bodyIsHtml, RefListNotificationMessageFormat format)
        {
            var templateIsHtml = format != RefListNotificationMessageFormat.PlainText;
            if (bodyIsHtml == templateIsHtml)
                return body;

            // html can't be sent over a plain text channel, keep the seeded template
            if (bodyIsHtml)
                return null;

            return WebUtility.HtmlEncode(body).Replace("\r\n", "\n").Replace("\n", "<br>");
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
