using Abp.Timing;
using System;

namespace Shesha.Tests.TestingUtils
{
    /// <summary>
    /// Static clock provider, is used for unit tests only
    /// It's a cope of the <see cref="UnspecifiedClockProvider"/> with just one change - after first call of <see cref="Now"/> the time stops
    /// </summary>
    public class StaticClockProvider : IClockProvider
    {
        private DateTime? _fixedTime = null;

        public DateTime Now => _fixedTime ?? (DateTime)(_fixedTime = DateTime.Now);

        public DateTimeKind Kind => DateTimeKind.Unspecified;

        public bool SupportsMultipleTimezone => false;

        public DateTime Normalize(DateTime dateTime)
        {
            return dateTime;
        }

        internal StaticClockProvider()
        {
        }
    }
}
