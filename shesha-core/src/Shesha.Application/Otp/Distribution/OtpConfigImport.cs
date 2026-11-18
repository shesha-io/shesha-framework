using Abp.Dependency;
using Abp.Domain.Repositories;
using Castle.Core.Logging;
using Shesha.Domain;
using Shesha.Otp.Distribution.Dto;
using Shesha.Services.ConfigurationItems;
using System;
using System.Threading.Tasks;

namespace Shesha.Otp.Distribution
{
    /// <summary>
    /// OTP configuration import
    /// </summary>
    public class OtpConfigImport : ConfigurationItemImportBase<OtpConfig, DistributedOtpConfig>, IOtpConfigImport, ITransientDependency
    {
        private readonly IRepository<NotificationTypeConfig, Guid> _notificationTypeRepo;

        public ILogger Logger { get; set; } = NullLogger.Instance;

        public OtpConfigImport(
            IRepository<Module, Guid> moduleRepo,
            IRepository<FrontEndApp, Guid> frontEndAppRepo,
            IRepository<OtpConfig, Guid> repository,
            IRepository<NotificationTypeConfig, Guid> notificationTypeRepo
        ) : base(repository, moduleRepo, frontEndAppRepo)
        {
            _notificationTypeRepo = notificationTypeRepo;
        }

        public override string ItemType => OtpConfig.ItemTypeName;

        protected override Task<bool> CustomPropsAreEqualAsync(OtpConfig item, DistributedOtpConfig distributedItem)
        {
            var result = item.NotificationType?.Name == distributedItem.NotificationTypeName &&
                item.NotificationType?.Module?.Name == distributedItem.NotificationTypeModule &&
                item.Lifetime == distributedItem.Lifetime &&
                item.PinType == distributedItem.PinType &&
                item.PinLength == distributedItem.PinLength &&
                item.Alphabet == distributedItem.Alphabet;

            return Task.FromResult(result);
        }

        protected override async Task MapCustomPropsToItemAsync(OtpConfig item, DistributedOtpConfig distributedItem)
        {
            item.NotificationType = await GetNotificationTypeAsync(distributedItem.NotificationTypeModule, distributedItem.NotificationTypeName);
            item.Lifetime = distributedItem.Lifetime;
            item.PinType = distributedItem.PinType;
            item.PinLength = distributedItem.PinLength;
            item.Alphabet = distributedItem.Alphabet;
        }

        private async Task<NotificationTypeConfig?> GetNotificationTypeAsync(string? module, string? name)
        {
            if (string.IsNullOrWhiteSpace(name))
                return null;

            // Flush pending changes, the session doesn't flush automatically before queries (FlushMode.Commit),
            // so notification types imported earlier in the same package would not be found otherwise
            await UnitOfWorkManager.Current.SaveChangesAsync();

            var notificationType = await _notificationTypeRepo.FirstOrDefaultAsync(e => e.Name == name && (e.Module == null && module == null || e.Module != null && e.Module.Name == module));

            // The package importer processes item types in the order of their first appearance, a package may list the OTP configuration
            // before its notification type. Don't fail the whole package: the configuration is imported without the reference and is
            // linked by the next import of the package (the items are then not equal), until then the OTP manager reports a clear error
            if (notificationType == null)
                Logger.Warn($"Notification type '{module}/{name}' referenced by an OTP configuration was not found. The configuration is imported without it, import the notification type and then the OTP configuration again");

            return notificationType;
        }
    }
}
