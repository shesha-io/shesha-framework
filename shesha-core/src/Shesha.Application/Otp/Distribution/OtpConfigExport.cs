using Abp.Dependency;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
using Shesha.Otp.Distribution.Dto;
using System.Threading.Tasks;

namespace Shesha.Otp.Distribution
{
    /// <summary>
    /// OTP configuration export
    /// </summary>
    public class OtpConfigExport : ConfigurableItemExportBase<OtpConfig, DistributedOtpConfig>, IOtpConfigExport, ITransientDependency
    {
        public string ItemType => OtpConfig.ItemTypeName;

        protected override Task MapCustomPropsAsync(OtpConfig item, DistributedOtpConfig result)
        {
            result.NotificationTypeName = item.NotificationType?.Name;
            result.NotificationTypeModule = item.NotificationType?.Module?.Name;
            result.Lifetime = item.Lifetime;
            result.PinType = item.PinType;
            result.PinLength = item.PinLength;
            result.Alphabet = item.Alphabet;

            return Task.CompletedTask;
        }
    }
}
