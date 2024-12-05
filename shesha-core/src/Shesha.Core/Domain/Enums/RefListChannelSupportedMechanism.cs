using Shesha.Domain.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Domain.Enums
{
    [ReferenceList("Shesha.Core", "ChannelSupportedMechanism")]
    public enum RefListChannelSupportedMechanism : long
    {
        Direct = 1,
        BulkSend = 2,
        Broadcast = 3
        // Add other formats as needed
    }
}
