using Abp.Dependency;
using Abp.Runtime;
using Shesha.NotificationMessages.Dto;
using System;
using System.Collections.Generic;

namespace Shesha.Notifications
{
    /// <summary>
    /// Notification publication context. Is used to pass parameters and collect statistics
    /// </summary>
    public class NotificationPublicationContext : INotificationPublicationContext, ITransientDependency
    {
        private const string ScopeKey = "sha-notification-publication";
        private readonly IAmbientScopeProvider<NotificationPublicationStatistics> _scopeProvider;

        public NotificationPublicationContext(IAmbientScopeProvider<NotificationPublicationStatistics> scopeProvider)
        {
            _scopeProvider = scopeProvider;
        }

        /// inheritedDoc
        public IDisposable BeginScope()
        {
            var state = new NotificationPublicationStatistics();
            
            return _scopeProvider.BeginScope(ScopeKey, state);
        }

        /// inheritedDoc
        public NotificationPublicationStatistics Statistics
        {
            get
            {
                return _scopeProvider.GetValue(ScopeKey);
            }
        }

        /// inheritedDoc
        public void NotificationMessageCreated(NotificationMessageDto notificationMessageDto) 
        {
            var statistics = Statistics;
            if (statistics != null)
                statistics.NotificationMessages.Add(notificationMessageDto);
        }
    }

    public class NotificationPublicationStatistics 
    {
        /// <summary>
        /// List of created notification messages
        /// </summary>
        public List<NotificationMessageDto> NotificationMessages { get; private set; } = new List<NotificationMessageDto>();
    }

    /// <summary>
    /// Notification publication context. Is used to pass parameters and collect statistics
    /// </summary>
    public interface INotificationPublicationContext 
    {
        /// <summary>
        /// Begin new scope. All statistics will be collected as part of this scope
        /// </summary>
        /// <returns></returns>
        IDisposable BeginScope();

        /// <summary>
        /// Statistics
        /// </summary>
        NotificationPublicationStatistics Statistics { get; }

        /// <summary>
        /// Register createtion of notification message
        /// </summary>
        /// <param name="notificationMessageDto"></param>
        void NotificationMessageCreated(NotificationMessageDto notificationMessageDto);
    }
}
