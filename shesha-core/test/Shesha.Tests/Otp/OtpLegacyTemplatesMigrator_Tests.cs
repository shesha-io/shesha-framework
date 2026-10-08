using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Moq;
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
        private const string SeededPinBody = "Your One-Time-Pin is {{password}}";
        private const string SeededLinkBody = "<p>seeded link email {{token}}</p>";

        [Fact]
        public async Task CustomisedPinTemplate_IsCopiedToPinNotifications_TestAsync()
        {
            var env = new Environment(settings => settings.DefaultBodyTemplate = "Code: {{password}}");

            await env.Migrator.MigrateAsync();

            foreach (var name in new[] { OtpConfigNames.OtpLogin, OtpConfigNames.PasswordResetSms, OtpConfigNames.OtpSms, OtpConfigNames.OtpEmail })
                env.Templates[name].ShouldAllBe(t => t.BodyTemplate == "Code: {{password}}");

            // link emails were not customised - seeded templates stay
            env.Templates[OtpConfigNames.PasswordResetEmailLink].ShouldAllBe(t => t.BodyTemplate == SeededLinkBody);
            env.SavedSettings.ShouldNotBeNull().LegacyTemplatesMigrated.ShouldBeTrue();
        }

        [Fact]
        public async Task CustomisedLinkTemplate_IsCopiedToLinkNotifications_TestAsync()
        {
            var env = new Environment(settings =>
            {
                settings.DefaultEmailSubjectTemplate = "Confirm it";
                settings.DefaultEmailBodyTemplate = "<a href='https://my.site/verify?token={{token}}'>verify</a>";
            });

            await env.Migrator.MigrateAsync();

            foreach (var name in new[] { OtpConfigNames.PasswordResetEmailLink, OtpConfigNames.EmailRegistrationLink, OtpConfigNames.OtpEmailLink })
                env.Templates[name].ShouldAllBe(t => t.TitleTemplate == "Confirm it" && t.BodyTemplate.Contains("https://my.site/verify"));

            env.Templates[OtpConfigNames.OtpSms].ShouldAllBe(t => t.BodyTemplate == SeededPinBody);
        }

        [Fact]
        public async Task DefaultTemplates_AreNotMigrated_TestAsync()
        {
            var env = new Environment(_ => { });

            await env.Migrator.MigrateAsync();

            env.Templates.Values.SelectMany(t => t).ShouldAllBe(t => t.BodyTemplate == SeededPinBody || t.BodyTemplate == SeededLinkBody);
            env.SavedSettings.ShouldBeNull();
        }

        [Fact]
        public async Task AlreadyMigrated_IsSkipped_TestAsync()
        {
            var env = new Environment(settings =>
            {
                settings.DefaultBodyTemplate = "Code: {{password}}";
                settings.LegacyTemplatesMigrated = true;
            });

            await env.Migrator.MigrateAsync();

            env.Templates[OtpConfigNames.OtpSms].ShouldAllBe(t => t.BodyTemplate == SeededPinBody);
            env.SavedSettings.ShouldBeNull();
        }

        [Fact]
        public async Task Failure_DoesNotThrow_TestAsync()
        {
            var env = new Environment(settings => settings.DefaultBodyTemplate = "Code: {{password}}", failOnUpdate: true);

            await Should.NotThrowAsync(async () => await env.Migrator.MigrateAsync());
            env.SavedSettings.ShouldBeNull();
        }

        private class Environment
        {
            public Dictionary<string, List<NotificationTemplate>> Templates { get; } = new();
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

                var types = new List<NotificationTypeConfig>();
                var module = new Module { Name = OtpConfigNames.Module };
                void AddType(string name, string body, params RefListNotificationMessageFormat[] formats)
                {
                    var type = new NotificationTypeConfig { Id = Guid.NewGuid(), Name = name, Module = module };
                    types.Add(type);
                    Templates[name] = formats.Select(f => new NotificationTemplate { PartOf = type, MessageFormat = f, TitleTemplate = "One-Time-Pin", BodyTemplate = body }).ToList();
                }
                foreach (var name in new[] { OtpConfigNames.OtpLogin, OtpConfigNames.PasswordResetSms, OtpConfigNames.OtpSms, OtpConfigNames.OtpEmail })
                    AddType(name, SeededPinBody, RefListNotificationMessageFormat.PlainText, RefListNotificationMessageFormat.RichText);
                foreach (var name in new[] { OtpConfigNames.PasswordResetEmailLink, OtpConfigNames.EmailRegistrationLink, OtpConfigNames.OtpEmailLink })
                    AddType(name, SeededLinkBody, RefListNotificationMessageFormat.RichText);

                var accessor = new Mock<ISettingAccessor<OtpSettings>>();
                accessor.Setup(a => a.GetValueOrNullAsync(It.IsAny<SettingManagementContext?>())).ReturnsAsync(settings);
                accessor.Setup(a => a.SetValueAsync(It.IsAny<OtpSettings?>())).Returns<OtpSettings?>(s => { SavedSettings = s; return Task.CompletedTask; });
                var otpSettings = new Mock<IOtpSettings>();
                otpSettings.SetupGet(s => s.OneTimePins).Returns(accessor.Object);

                var typeRepo = new Mock<IRepository<NotificationTypeConfig, Guid>>();
                typeRepo.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<NotificationTypeConfig, bool>>>()))
                    .Returns<Expression<Func<NotificationTypeConfig, bool>>>(p => Task.FromResult(types.AsQueryable().FirstOrDefault(p)!));

                var templateRepo = new Mock<IRepository<NotificationTemplate, Guid>>();
                templateRepo.Setup(r => r.GetAllListAsync(It.IsAny<Expression<Func<NotificationTemplate, bool>>>()))
                    .Returns<Expression<Func<NotificationTemplate, bool>>>(p => Task.FromResult(Templates.Values.SelectMany(t => t).AsQueryable().Where(p).ToList()));
                templateRepo.Setup(r => r.UpdateAsync(It.IsAny<NotificationTemplate>()))
                    .Returns<NotificationTemplate>(t => failOnUpdate ? throw new InvalidOperationException("db is down") : Task.FromResult(t));

                var uowManager = new Mock<IUnitOfWorkManager>();
                uowManager.Setup(m => m.Begin()).Returns(new Mock<IUnitOfWorkCompleteHandle>().Object);

                Migrator = new OtpLegacyTemplatesMigrator(otpSettings.Object, typeRepo.Object, templateRepo.Object, uowManager.Object);
            }
        }
    }
}
