using Shesha.Reflection;
using System;

namespace Shesha.Sms
{
    /// <summary>
    /// Common sms utils
    /// </summary>
    public static class SmsUtils
    {
        /// <summary>
        /// Get sms gateway alias by type
        /// </summary>
        /// <param name="gatewayType"></param>
        /// <returns></returns>
        public static string GetGatewayAlias(Type gatewayType)
        {
            return ReflectionHelper.GetDisplayName(gatewayType).Replace(" ", "");
        }
    }
}
