using Abp.Dependency;
using Shesha.ConfigurationItems;
using Shesha.Domain;
using System.Threading.Tasks;

namespace Shesha.Otp
{
    /// <summary>
    /// OTP configuration manager
    /// </summary>
    public class OtpConfigManager : ConfigurationItemManager<OtpConfig>, IOtpConfigManager, ITransientDependency
    {
        protected override Task CopyItemPropertiesAsync(OtpConfig source, OtpConfig destination)
        {
            destination.NotificationType = source.NotificationType;
            destination.Lifetime = source.Lifetime;
            destination.PinType = source.PinType;
            destination.PinLength = source.PinLength;
            destination.Alphabet = source.Alphabet;
            destination.Disable = source.Disable;

            return Task.CompletedTask;
        }
    }
}
