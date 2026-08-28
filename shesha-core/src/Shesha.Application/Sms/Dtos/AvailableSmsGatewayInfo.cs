using System;

namespace Shesha.Sms.Dtos
{
    /// <summary>
    /// Available SMS gateway registered in IoC and ready to use
    /// </summary>
    public class AvailableSmsGatewayInfo
    {
        public Type Type { get; init; }
        public string Uid { get; init; }
        public string Alias { get; init; }
        public string Name { get; init; }
        public string? Description { get; init; }
    }
}
