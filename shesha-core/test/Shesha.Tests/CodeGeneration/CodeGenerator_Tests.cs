using System;
using System.Collections.Generic;
using System.Text;
using Shesha.CodeGeneration;
using Xunit;

namespace Shesha.Tests.CodeGeneration
{
    public class CodeGenerator_Tests
    {
        [Fact]
        public void Enum_Test()
        {
            var s = EnumsGenerator.GenerateEnumItems(@"Credit to Prepaid meter Retrofit
Disconnection - OHM
Disconnection - UGM
Hard disconnection at CDU (Single phase)
Hard disconnection at CDU (Three phase)
Hard disconnection at the pole (Single phase)
Hard disconnection at the pole (Three phase)
Hard reconnection at CDU (Single phase)
Hard reconnection at CDU (Three phase)
Hard reconnection at the pole (Single phase)
Hard reconnection at the pole (Three phase)
Keypad Replacemnt (PLC/SMART)
Keypad Replacemt (wired comms wires)
Meter Replacements (Single phase)
Meter Replacements (Three phase)
Normal Disconnection (Single or Three phase)
Normal Reconnection (Single or Three phase)
PLC Meter Changes
Reconnection - OHM
Reconnection - UGM
Remove Meter
Remove all Gear - RAG
Replacement of a fuse base and carrier with similar or circuit breaker.
Replacement of a split meter
Service Cable Removal - SCR
Site Call
Special hard Disconnection
Split meter conversion");
        }
    }
}
