using System;
using System.Threading.Tasks;

namespace Shesha.Sms
{
    public interface IConfigurableSmsGateway<TSettings> : ISmsGateway where TSettings: class
    {
        Task<TSettings> GetTypedSettingsAsync();
        Task SetTypedSettingsAsync(TSettings settings);
    }
}
