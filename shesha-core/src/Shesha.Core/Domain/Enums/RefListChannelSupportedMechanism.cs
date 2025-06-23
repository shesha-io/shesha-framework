using Shesha.Domain.Attributes;

namespace Shesha.Domain.Enums
{
    [ReferenceList("ChannelSupportedMechanism")]
    public enum RefListChannelSupportedMechanism : long
    {
        Direct = 1,
        BulkSend = 2,
        Broadcast = 4
    }
}
