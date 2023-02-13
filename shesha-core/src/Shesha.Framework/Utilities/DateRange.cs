using System;

namespace Shesha.Utilities
{
    public class DateRange
    {
        public DateTime From { get; }
        public DateTime To { get; }

        public DateRange(DateTime from, DateTime to)
        {
            From = from;
            To = to;
        }

        public override bool Equals(object obj)
        {
            var range = obj as DateRange;
            if (range == null)
                return false;

            return this.From == range.From && this.To == range.To;
        }

        public override int GetHashCode()
        {
            return $"{From.ToUnixTimestamp()}-{To.ToUnixTimestamp()}".GetHashCode();
        }

        public override string ToString()
        {
            return $"{From:dd/MM/yyyy hh:mm:ss} - {To:dd/MM/yyyy hh:mm:ss}";
        }
    }
}
