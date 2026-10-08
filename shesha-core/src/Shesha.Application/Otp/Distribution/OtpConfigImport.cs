using Abp.Dependency;
using Abp.Domain.Repositories;
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
                item.Alphabet == distributedItem.Alphabet &&
                item.Disable == distributedItem.Disable;

            return Task.FromResult(result);
        }

        protected override async Task MapCustomPropsToItemAsync(OtpConfig item, DistributedOtpConfig distributedItem)
        {
            item.NotificationType = await GetNotificationTypeAsync(distributedItem.NotificationTypeModule, distributedItem.NotificationTypeName);
            item.Lifetime = distributedItem.Lifetime;
            item.PinType = distributedItem.PinType;
            item.PinLength = distributedItem.PinLength;
            item.Alphabet = distributedItem.Alphabet;
            item.Disable = distributedItem.Disable;
        }

        private async Task<NotificationTypeConfig?> GetNotificationTypeAsync(string? module, string? name)
        {
            if (string.IsNullOrWhiteSpace(name))
                return null;

            // note: the notification type must be imported before the OTP configuration that references it.
            // Flush pending changes, the session doesn't flush automatically before queries (FlushMode.Commit),
            // so notification types imported earlier in the same package would not be found otherwise
            await UnitOfWorkManager.Current.SaveChangesAsync();

            var notificationType = await _notificationTypeRepo.FirstOrDefaultAsync(e => e.Name == name && (e.Module == null && module == null || e.Module != null && e.Module.Name == module));
            return notificationType ?? throw new InvalidOperationException($"Notification type '{module}/{name}' referenced by the OTP configuration was not found");
        }
    }
}
