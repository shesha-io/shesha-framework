using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Moq;
using Shesha.Configuration;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.Otp;
using Shesha.Otp.Configuration;
using Shesha.Settings;
using Shouldly;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Xunit;

namespace Shesha.Tests.Otp
{
    [Trait("RunOnPipeline", "yes")]
    public class OtpLegacyTemplatesMigrator_Tests
    {
        private const string SeededTitle = "One-Time-Pin";
        private const string SeededPinBody = "Your One-Time-Pin is {{password}}";
        private const string SeededLinkBody = "<p>seeded link email {{token}}</p>";
        private const string PinConfig = "PinAction";
        private const string LinkConfig = "LinkAction";

        [Fact]
        public async Task CustomisedPinTemplate_IsMovedToPinNotifications_TestAsync()
        {
            var env = new Environment(settings => settings.DefaultBodyTemplate = "Code: {{password}}\nDon't share it & keep safe");

            await env.Migrator.MigrateAsync();

            // plain text stays as is, html templates get the encoded text
            env.Template(PinConfig, RefListNotificationMessageFormat.PlainText).BodyTemplate.ShouldBe("Code: {{password}}\nDon't share it & keep safe");
            env.Template(PinConfig, RefListNotificationMessageFormat.RichText).BodyTemplate.ShouldBe("Code: {{password}}<br>Don&#39;t share it &amp; keep safe");

            // not customised values are not touched
            env.Template(PinConfig, RefListNotificationMessageFormat.PlainText).TitleTemplate.ShouldBe(SeededTitle);
            env.Template(LinkConfig, RefListNotificationMessageFormat.RichText).BodyTemplate.ShouldBe(SeededLinkBody);
        }

        [Fact]
        public async Task CustomisedLinkTemplate_IsMovedToLinkNotifications_TestAsync()
        {
            const string body = "<a href='https://my.site/verify?token={{token}}'>verify</a>";
            var env = new Environment(settings =>
            {
                settings.DefaultEmailSubjectTemplate = "Confirm it";
                settings.DefaultEmailBodyTemplate = body;
            });

            await env.Migrator.MigrateAsync();

            var linkTemplate = env.Template(LinkConfig, RefListNotificationMessageFormat.RichText);
            linkTemplate.TitleTemplate.ShouldBe("Confirm it");
            linkTemplate.BodyTemplate.ShouldBe(body);

            // html is not written into plain text templates
            var plainLinkTemplate = env.Template(LinkConfig, RefListNotificationMessageFormat.PlainText);
            plainLinkTemplate.TitleTemplate.ShouldBe("Confirm it");
            plainLinkTemplate.BodyTemplate.ShouldBe(SeededLinkBody);

            env.Template(PinConfig, RefListNotificationMessageFormat.PlainText).BodyTemplate.ShouldBe(SeededPinBody);
        }

        [Fact]
        public async Task SiteAddressOfLinkTemplate_IsReplacedWithPublicUrlPlaceholder_TestAsync()
        {
            var env = new Environment(settings => settings.DefaultEmailBodyTemplate =
                "<a href=https://portal.my.site/no-auth/verify?token={{token}}>verify</a> or <a href=HTTPS://Admin.My.Site/help>help</a>");
            env.PublicUrls["public-portal"] = "https://portal.my.site/";
            env.PublicUrls["default-app"] = "https://admin.my.site";

            await env.Migrator.MigrateAsync();

            env.Template(LinkConfig, RefListNotificationMessageFormat.RichText).BodyTemplate
                .ShouldBe("<a href={{publicUrl}}/no-auth/verify?token={{token}}>verify</a> or <a href={{publicUrl}}/help>help</a>");
        }

        [Fact]
        public async Task UnknownSiteAddressOfLinkTemplate_IsKept_TestAsync()
        {
            // the public url setting was never filled in (default value): the hardcoded address is the only correct one
            const string body = "<a href=https://my.site.co.za/verify?token={{token}}>verify</a>";
            var env = new Environment(settings => settings.DefaultEmailBodyTemplate = body);
            env.PublicUrls["default-app"] = "https://my.site";

            await env.Migrator.MigrateAsync();

            env.Template(LinkConfig, RefListNotificationMessageFormat.RichText).BodyTemplate.ShouldBe(body);
        }

        [Fact]
        public async Task MigratedTemplates_AreClearedInSettings_TestAsync()
        {
            var env = new Environment(settings => settings.DefaultBodyTemplate = "Code: {{password}}");

            await env.Migrator.MigrateAsync();

            var saved = env.SavedSettings.ShouldNotBeNull();
            saved.DefaultSubjectTemplate.ShouldBeNull();
            saved.DefaultBodyTemplate.ShouldBeNull();
            saved.DefaultEmailSubjectTemplate.ShouldBeNull();
            saved.DefaultEmailBodyTemplate.ShouldBeNull();

            // templates edited in the notification editor are not overwritten by the next start-up
            env.Template(PinConfig, RefListNotificationMessageFormat.PlainText).BodyTemplate = "edited in the notification editor";
            await env.Migrator.MigrateAsync();

            env.Template(PinConfig, RefListNotificationMessageFormat.PlainText).BodyTemplate.ShouldBe("edited in the notification editor");
        }

        [Fact]
        public async Task DefaultTemplates_AreNotMigrated_TestAsync()
        {
            // line endings and outer whitespaces don't make a template customised
            var env = new Environment(settings => settings.DefaultBodyTemplate = OtpDefaults.DefaultBodyTemplate + "\r\n");

            await env.Migrator.MigrateAsync();

            env.SavedSettings.ShouldBeNull();
            env.UpdatedTemplates.ShouldBeEmpty();
        }

        [Fact]
        public async Task EmptySettings_AreNotMigrated_TestAsync()
        {
            var env = new Environment(settings =>
            {
                settings.DefaultSubjectTemplate = null;
                settings.DefaultBodyTemplate = null;
                settings.DefaultEmailSubjectTemplate = null;
                settings.DefaultEmailBodyTemplate = null;
            });

            await env.Migrator.MigrateAsync();

            env.SavedSettings.ShouldBeNull();
            env.UpdatedTemplates.ShouldBeEmpty();
        }

        [Fact]
        public async Task TemplateWithoutDestination_IsKeptInSettings_TestAsync()
        {
            // html can't be written into a plain text template: the link body has nowhere to go
            const string body = "<a href=https://my.site/verify?token={{token}}>verify</a>";
            var env = new Environment(settings =>
            {
                settings.DefaultBodyTemplate = "Code: {{password}}";
                settings.DefaultEmailBodyTemplate = body;
            });
            env.RemoveTemplates(LinkConfig, RefListNotificationMessageFormat.RichText);

            await env.Migrator.MigrateAsync();

            // the pin template is moved and cleared, the link template stays: the settings are its only copy
            var saved = env.SavedSettings.ShouldNotBeNull();
            saved.DefaultBodyTemplate.ShouldBeNull();
            saved.DefaultEmailBodyTemplate.ShouldBe(body);
            env.Template(PinConfig, RefListNotificationMessageFormat.PlainText).BodyTemplate.ShouldBe("Code: {{password}}");
            env.Template(LinkConfig, RefListNotificationMessageFormat.PlainText).BodyTemplate.ShouldBe(SeededLinkBody);
        }

        [Fact]
        public async Task MissingConfigurations_KeepSettings_TestAsync()
        {
            // e.g. the seed package failed to import
            var env = new Environment(settings => settings.DefaultBodyTemplate = "Code: {{password}}");
            env.RemoveConfigs();

            await env.Migrator.MigrateAsync();

            env.SavedSettings.ShouldBeNull();
            env.UpdatedTemplates.ShouldBeEmpty();
        }

        [Fact]
        public async Task Failure_DoesNotBlockStartupAndKeepsSettings_TestAsync()
        {
            var env = new Environment(settings => settings.DefaultBodyTemplate = "Code: {{password}}", failOnUpdate: true);

            await env.Migrator.MigrateAsync();

            env.SavedSettings.ShouldBeNull();
        }

        private class Environment
        {
            private readonly List<NotificationTemplate> _templates = new();
            private readonly List<OtpConfig> _configs = new();

            public const string DefaultPublicUrl = "http://localhost:3000";

            /// <summary>
            /// Public urls by key of the front-end application
            /// </summary>
            public Dictionary<string, string> PublicUrls { get; } = new();
            public List<NotificationTemplate> UpdatedTemplates { get; } = new();
            public OtpSettings? SavedSettings { get; private set; }
            public OtpLegacyTemplatesMigrator Migrator { get; }

            public Environment(Action<OtpSettings> customise, bool failOnUpdate = false)
            {
                var settings = new OtpSettings
                {
                    DefaultSubjectTemplate = OtpDefaults.DefaultSubjectTemplate,
                    DefaultBodyTemplate = OtpDefaults.DefaultBodyTemplate,
                    DefaultEmailSubjectTemplate = OtpDefaults.DefaultEmailSubjectTemplate,
                    DefaultEmailBodyTemplate = OtpDefaults.DefaultEmailBodyTemplate,
                };
                customise(settings);

                AddConfig(PinConfig, RefListOtpPinType.Numeric, SeededPinBody);
                AddConfig(LinkConfig, RefListOtpPinType.Token, SeededLinkBody);
                // configuration without a notification type must not break the migration
                _configs.Add(new OtpConfig { Id = Guid.NewGuid(), Name = "Incomplete", PinType = RefListOtpPinType.Numeric });

                var accessor = new Mock<ISettingAccessor<OtpSettings>>();
                accessor.Setup(a => a.GetValueOrNullAsync(It.IsAny<SettingManagementContext?>())).ReturnsAsync(settings);
                accessor.Setup(a => a.SetValueAsync(It.IsAny<OtpSettings?>())).Returns<OtpSettings?>(s => { SavedSettings = s; return Task.CompletedTask; });
                var otpSettings = new Mock<IOtpSettings>();
                otpSettings.SetupGet(s => s.OneTimePins).Returns(accessor.Object);

                var configRepo = new Mock<IRepository<OtpConfig, Guid>>();
                configRepo.Setup(r => r.GetAllListAsync(It.IsAny<Expression<Func<OtpConfig, bool>>>()))
                    .Returns<Expression<Func<OtpConfig, bool>>>(p => Task.FromResult(_configs.AsQueryable().Where(p).ToList()));

                var templateRepo = new Mock<IRepository<NotificationTemplate, Guid>>();
                templateRepo.Setup(r => r.GetAllListAsync(It.IsAny<Expression<Func<NotificationTemplate, bool>>>()))
                    .Returns<Expression<Func<NotificationTemplate, bool>>>(p => Task.FromResult(_templates.AsQueryable().Where(p).ToList()));
                templateRepo.Setup(r => r.UpdateAsync(It.IsAny<NotificationTemplate>()))
                    .Returns<NotificationTemplate>(t =>
                    {
                        if (failOnUpdate)
                            throw new InvalidOperationException("db is down");
                        UpdatedTemplates.Add(t);
                        return Task.FromResult(t);
                    });

                var appRepo = new Mock<IRepository<FrontEndApp, Guid>>();
                appRepo.Setup(r => r.GetAllListAsync())
                    .Returns(() => Task.FromResult(PublicUrls.Keys.Select(key => new FrontEndApp { Id = Guid.NewGuid(), AppKey = key }).ToList()));

                var publicUrlAccessor = new Mock<ISettingAccessor<string>>();
                publicUrlAccessor.Setup(a => a.GetValueOrNullAsync(It.IsAny<SettingManagementContext?>()))
                    .Returns<SettingManagementContext?>(context => Task.FromResult<string?>(
                        context?.AppKey != null && PublicUrls.TryGetValue(context.AppKey, out var url) ? url : DefaultPublicUrl));
                var frontendSettings = new Mock<IFrontendSettings>();
                frontendSettings.SetupGet(s => s.PublicUrl).Returns(publicUrlAccessor.Object);

                var uowManager = new Mock<IUnitOfWorkManager>();
                uowManager.Setup(m => m.Begin()).Returns(new Mock<IUnitOfWorkCompleteHandle>().Object);

                Migrator = new OtpLegacyTemplatesMigrator(otpSettings.Object, configRepo.Object, templateRepo.Object, appRepo.Object, frontendSettings.Object, uowManager.Object);
            }

            public NotificationTemplate Template(string configName, RefListNotificationMessageFormat format)
            {
                var type = _configs.Single(c => c.Name == configName).NotificationType;
                return _templates.Single(t => t.PartOf == type && t.MessageFormat == format);
            }

            public void RemoveTemplates(string configName, RefListNotificationMessageFormat format)
            {
                var type = _configs.Single(c => c.Name == configName).NotificationType;
                _templates.RemoveAll(t => t.PartOf == type && t.MessageFormat == format);
            }

            public void RemoveConfigs()
            {
                _configs.Clear();
            }

            private void AddConfig(string name, RefListOtpPinType pinType, string body)
            {
                var type = new NotificationTypeConfig { Id = Guid.NewGuid(), Name = name };
                _configs.Add(new OtpConfig { Id = Guid.NewGuid(), Name = name, PinType = pinType, NotificationType = type });
                foreach (var format in new[] { RefListNotificationMessageFormat.PlainText, RefListNotificationMessageFormat.RichText })
                    _templates.Add(new NotificationTemplate { PartOf = type, MessageFormat = format, TitleTemplate = SeededTitle, BodyTemplate = body });
            }
        }
    }
}
