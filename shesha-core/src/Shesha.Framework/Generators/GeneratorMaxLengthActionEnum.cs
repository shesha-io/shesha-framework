using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Generators
{
    public enum GeneratorMaxLengthActionEnum
    {
        // nothing
        Nothing = 0,
        // Throw error if exceeds the maximum length
        ThrowError = 1,
        // Trim result string right to match the max length
        TrimRight = 2,
        // Trim each parts right to match the max length
        TrimParts = 3,
        // Trim words right to match the max length
        TrimWords = 4,
    }
}
