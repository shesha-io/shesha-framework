using Abp.Notifications;
using Shouldly;
using Stubble.Core.Builders;
using System;
using System.Linq;
using System.Reflection;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Xunit;

namespace Shesha.Tests.Notifications
{
    /// <summary>
    /// Temp test for debug only, to be removed
    /// </summary>
    public class NotificationTemplateContext_Tests
    {
        [Fact]
        public async Task HelperVsStubblePlainTestAsync()
        {
            var template = @"Dear {{FirstName}} {{LastName}}. You have been invited to join {{Organisation}}. Follow this link {{RegistrationUrl}} to accept your invitation.";

            var data = GetTestData();
            var viaHelper = TemplateHelper.ReplacePlaceholders(template, data);
            var viaStubble = await GenerateContentAsync(template, data);

            viaStubble.ShouldBe(viaHelper);
        }

        [Fact]
        public async Task HelperVsStubbleComplexTestAsync()
        {
            var template = @"Dear {{FirstName}} {{LastName}}. You have been invited to join {{Organisation}}. Follow this link {{RegistrationUrl}} to accept your invitation. Message: {{Nested.Message}}";

            var data = GetTestData();
            var viaHelper = TemplateHelper.ReplacePlaceholders(template, data);
            var viaStubble = await GenerateContentAsync(template, data);

            // TemplateHelper doesn't support nested objects
            viaHelper.ShouldContain("{{");
            viaStubble.ShouldNotBeNull();
            viaStubble.ShouldNotContain("{{");
        }

        [Fact]
        public async Task HelperVsStubblePlainCamelCaseTestAsync()
        {
            var template = @"Dear {{firstName}} {{lastName}}. You have been invited to join {{organisation}}. Follow this link {{registrationUrl}} to accept your invitation.";

            var data = GetTestData();
            var viaHelper = TemplateHelper.ReplacePlaceholders(template, data);
            var viaStubble = await GenerateContentAsync(template, data);

            viaStubble.ShouldBe(viaHelper);
        }

        private TestNotificationData GetTestData() 
        {
            return new TestNotificationData
            {
                FirstName = "John",
                LastName = "Doe",
                Organisation = "Big corp",
                RegistrationUrl = "http://big.corp",
                Nested = new TestNotificationNestedData
                {
                    Message = "Hi, man!"
                }
            };
        }

        protected async Task<string?> GenerateContentAsync<TData>(string? template, TData data)
        {
            var stubbleRenderer = new StubbleBuilder().Configure(settings =>
            {
                settings.SetIgnoreCaseOnKeyLookup(true);
            }).Build();

            return !string.IsNullOrWhiteSpace(template)
                ? await stubbleRenderer.RenderAsync(template, data)
                : template;
        }

        public class TestNotificationNestedData 
        {
            public string Message { get; set; }
        }

        public class TestNotificationData: NotificationData
        { 
            public string FirstName { get; set; }
            public string LastName { get; set; }
            public string Organisation { get; set; }
            public string RegistrationUrl { get; set; }
            public TestNotificationNestedData Nested { get; set; }
        }

        public static class TemplateHelper
        {
            // TODO: review and this implementation
            public static string ReplacePlaceholders<TData>(string template, TData data)
            {
                if (data == null)
                    throw new ArgumentNullException(nameof(data));

                // Use regex to find placeholders in the form {{propertyName}}
                return Regex.Replace(template, @"\{\{(\w+)\}\}", match =>
                {
                    var propertyName = match.Groups[1].Value;

                    // Use the runtime type of the object for property lookup
                    var propertyInfo = data.GetType()
                        .GetProperties(BindingFlags.Public | BindingFlags.Instance)
                        .FirstOrDefault(prop => string.Equals(prop.Name, propertyName, StringComparison.OrdinalIgnoreCase));

                    return propertyInfo != null
                        ? propertyInfo.GetValue(data)?.ToString() ?? string.Empty
                        : string.Empty;
                });
            }
        }
    }
}
