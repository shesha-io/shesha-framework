using System;
using System.Diagnostics;
using System.Diagnostics.CodeAnalysis;

namespace Abp.Zero
{

    public static class NullableExtensions
    {
        [DebuggerStepThrough]
        public static T NotNull<T>([NotNull] this T? value, string message = "Value must not be null")
        {
            return value ?? throw new Exception(message);
        }
    }
}
