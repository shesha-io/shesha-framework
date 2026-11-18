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
        protected override async Task CopyItemPropertiesAsync(OtpConfig source, OtpConfig destination)
        {
            // label and description
            await base.CopyItemPropertiesAsync(source, destination);

            destination.NotificationType = source.NotificationType;
            destination.Lifetime = source.Lifetime;
            destination.PinType = source.PinType;
            destination.PinLength = source.PinLength;
            destination.Alphabet = source.Alphabet;
        }
    }
}
