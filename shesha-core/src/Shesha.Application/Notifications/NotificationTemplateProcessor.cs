using Abp.Dependency;
using Abp.Domain.Entities;
using Abp.Notifications;
using Shesha.Configuration;
using Shesha.EntityReferences;
using Shesha.Extensions;
using Shesha.Reflection;
using Stubble.Core;
using Stubble.Core.Builders;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shesha.Notifications
{
    /// <summary>
    /// Notification template processor
    /// </summary>
    public class NotificationTemplateProcessor : INotificationTemplateProcessor, ISingletonDependency
    {
        private readonly IFrontendSettings _frontendSettings;
        private readonly StubbleVisitorRenderer _stubbleRenderer;

        public NotificationTemplateProcessor(IFrontendSettings frontendSettings)
        {
            _frontendSettings = frontendSettings;
            _stubbleRenderer = MakeStubbler();
        }

        private StubbleVisitorRenderer MakeStubbler() 
        { 
            return new StubbleBuilder().Configure(settings =>
            {
                settings.SetIgnoreCaseOnKeyLookup(true);
                settings.AddValueGetter(typeof(GenericEntityReference), (object value, string key, bool ignoreCase) =>
                {
                    if (value is GenericEntityReference entityRef)
                    {
                        var entity = (Entity<Guid>)entityRef;
                        if (entity == null)
                            return null;

                        var propAccessor = ReflectionHelper.GetPropertyValueAccessor(entity, key);
                        return propAccessor.IsValueAvailable
                            ? propAccessor.Value
                            : null;
                    }
                    else
                        return null;
                });
                settings.AddValueGetter(typeof(NotificationData), (object value, string key, bool ignoreCase) =>
                {
                    if (value is NotificationData notificationData)
                    {
                        // shortcuts
                        if (key == "frontEndApps")
                        {
                            return new FrontEndAppsTag(_frontendSettings);
                        }

                        return notificationData[key];
                    }
                    else
                        return null;
                });
                settings.AddValueGetter(typeof(IIndexer), (object value, string key, bool ignoreCase) =>
                {
                    return value is IIndexer indexer
                        ? indexer[key]
                        : null;
                });


            }).Build();
        }

        public async Task<string> GenerateAsync(string template, object model)
        {
            return await _stubbleRenderer.RenderAsync(template, model);
        }

        public interface IIndexer
        {
            object this[string key] { get; }
        }

        public class FrontEndAppTag
        {
            private readonly string _appKey;
            private readonly IFrontendSettings _frontendSettings;
            public FrontEndAppTag(IFrontendSettings frontendSettings, string appKey)
            {
                _frontendSettings = frontendSettings;
                _appKey = appKey;
            }

            public string? PublicUrl
            {
                get 
                {
                    var value = _frontendSettings.PublicUrl.GetValueOrNull(new Settings.SettingManagementContext { AppKey = _appKey });
                    return value;
                }
            }
        }

        public class FrontEndAppsTag : IIndexer
        {
            private readonly Dictionary<string, FrontEndAppTag> _apps = new();
            private readonly IFrontendSettings _frontendSettings;

            public FrontEndAppsTag(IFrontendSettings frontendSettings)
            {
                _frontendSettings = frontendSettings;
            }

            public object this[string key]
            {
                get
                {
                    return _apps.Get(key, k => new FrontEndAppTag(_frontendSettings, k));
                }
            }
        }
    }
}
