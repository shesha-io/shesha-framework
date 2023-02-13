using Abp;
using Abp.BackgroundJobs;
using Abp.Collections.Extensions;
using Abp.Dependency;
using Abp.Domain.Entities;
using Abp.Domain.Uow;
using Abp.Extensions;
using Abp.Json;
using Abp.Notifications;
using Abp.Runtime.Session;
using Shesha.Notifications.Dto;
using Shesha.Notifications.Exceptions;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Transactions;

namespace Shesha.Notifications
{
    /// <summary>
    /// Implements <see cref="INotificationPublisher"/>.
    /// </summary>
    public class ShaNotificationPublisher : AbpServiceBase, INotificationPublisher, ITransientDependency
    {
        public const int MaxUserCountToDirectlyDistributeANotification = 5;

        private readonly IShaNotificationDistributer _notificationDistributer;

        /// <summary>
        /// Indicates all tenants.
        /// </summary>
        public static int[] AllTenants
        {
            get
            {
                return new[] { NotificationInfo.AllTenantIds.To<int>() };
            }
        }

        /// <summary>
        /// Reference to ABP session.
        /// </summary>
        public IAbpSession AbpSession { get; set; }

        private readonly INotificationStore _store;
        private readonly IBackgroundJobManager _backgroundJobManager;
        private readonly INotificationConfiguration _notificationConfiguration;
        private readonly IGuidGenerator _guidGenerator;
        private readonly IIocResolver _iocResolver;

        /// <summary>
        /// Initializes a new instance of the <see cref="NotificationPublisher"/> class.
        /// </summary>
        public ShaNotificationPublisher(
            INotificationStore store,
            IBackgroundJobManager backgroundJobManager,
            INotificationConfiguration notificationConfiguration,
            IGuidGenerator guidGenerator,
            IIocResolver iocResolver,
            IShaNotificationDistributer notificationDistributer)
        {
            _store = store;
            _backgroundJobManager = backgroundJobManager;
            _notificationConfiguration = notificationConfiguration;
            _guidGenerator = guidGenerator;
            _iocResolver = iocResolver;
            AbpSession = NullAbpSession.Instance;
            _notificationDistributer = notificationDistributer;
        }

        //Create EntityIdentifier includes entityType and entityId.
        [UnitOfWork]
        public virtual async Task PublishAsync(
            string notificationName,
            NotificationData data = null,
            EntityIdentifier entityIdentifier = null,
            NotificationSeverity severity = NotificationSeverity.Info,
            UserIdentifier[] userIds = null,
            UserIdentifier[] excludedUserIds = null,
            int?[] tenantIds = null)
        {
            Guid? notificationId = null;

            using (var uow = UnitOfWorkManager.Begin(TransactionScopeOption.RequiresNew)) 
            {
                if (notificationName.IsNullOrEmpty())
                {
                    throw new ArgumentException("NotificationName can not be null or whitespace!", "notificationName");
                }

                if (!tenantIds.IsNullOrEmpty() && !userIds.IsNullOrEmpty())
                {
                    throw new ArgumentException("tenantIds can be set only if userIds is not set!", "tenantIds");
                }

                if (tenantIds.IsNullOrEmpty() && userIds.IsNullOrEmpty())
                {
                    tenantIds = new[] { AbpSession.TenantId };
                }

                var notificationInfo = new NotificationInfo(_guidGenerator.Create())
                {
                    NotificationName = notificationName,
                    EntityTypeName = entityIdentifier == null ? null : entityIdentifier.Type.FullName,
                    EntityTypeAssemblyQualifiedName = entityIdentifier == null ? null : entityIdentifier.Type.AssemblyQualifiedName,
                    EntityId = entityIdentifier == null ? null : entityIdentifier.Id.ToJsonString(),
                    Severity = severity,
                    UserIds = userIds.IsNullOrEmpty() ? null : userIds.Select(uid => uid.ToUserIdentifierString()).JoinAsString(","),
                    ExcludedUserIds = excludedUserIds.IsNullOrEmpty() ? null : excludedUserIds.Select(uid => uid.ToUserIdentifierString()).JoinAsString(","),
                    TenantIds = tenantIds.IsNullOrEmpty() ? null : tenantIds.JoinAsString(","),
                    Data = data == null ? null : data.ToJsonString(),
                    DataTypeName = data == null ? null : data.GetType().AssemblyQualifiedName
                };

                await _store.InsertNotificationAsync(notificationInfo);
                
                await uow.CompleteAsync(); //To get Id of the notification
                
                notificationId = notificationInfo.Id;
            }

            if (notificationId == null)
                throw new ShaNotificationSaveFailedException(notificationName, data);

            var isShaNotification = data != null && data is ShaNotificationData;
            if (isShaNotification || userIds != null && userIds.Length <= MaxUserCountToDirectlyDistributeANotification)
            {
                await _notificationDistributer.DistributeAsync(notificationId.Value);
            }
            else
            {
                //We enqueue a background job since distributing may get a long time
                await _backgroundJobManager.EnqueueAsync<NotificationDistributionJob, NotificationDistributionJobArgs>(
                    new NotificationDistributionJobArgs(
                        notificationId.Value
                        )
                    );
            }
        }
    }
}
