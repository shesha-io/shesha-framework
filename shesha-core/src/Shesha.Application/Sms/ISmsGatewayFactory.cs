using Shesha.Sms.Dtos;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shesha.Sms
{
    /// <summary>
    /// Factory that serves current <see cref="ISmsGateway"/>
    /// </summary>
    public interface ISmsGatewayFactory
    {
        /// <summary>
        /// Get current <see cref="ISmsGateway"/>
        /// </summary>
        /// <returns></returns>
        Task<ISmsGateway> GetSmsGatewayAsync();

        /// <summary>
        /// Get available SMS gateways
        /// </summary>
        /// <returns></returns>
        List<AvailableSmsGatewayInfo> GetSmsGatewayTypes();
    }
}
