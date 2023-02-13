using System;
using System.Globalization;

namespace Shesha.Utilities
{
    public enum Months : byte
    {
        Jan = 1,
        Feb = 2,
        Mar = 3,
        Apr = 4,
        May = 5,
        Jun = 6,
        Jul = 7,
        Aug = 8,
        Sep = 9,
        Oct = 10,
        Nov = 11,
        Dec = 12
    };

    /// <summary>
    /// Utility functions relating to dates.
    /// </summary>
    public static class DateHelper
    {
        /// <summary>
        /// The returns a date formatted to be more user friendly e.g. 'yesterday' or '2 days ago'.
        /// </summary>
        /// <param name="d"></param>
        public static string ToPrettyFormat(this DateTime d)
        {
            // Get time span elapsed since the date.


            if (d < DateTime.Now)
            {
                TimeSpan s = DateTime.Now.Subtract(d);
                return ToPrettyFormatInPast(d, s);
            }
            else
            {
                TimeSpan s = d.Subtract(DateTime.Now);
                return ToPrettyFormatInFuture(d, s);
            }
        }

        public static string ToPrettyFormatInPast(DateTime d, TimeSpan s)
        {
            int dayDiff = (int)s.TotalDays;

            if (dayDiff == 0)
            {
                // Handle same-day times.
                int secDiff = (int)s.TotalSeconds;
                if (secDiff < 60)
                {
                    return "just now";
                }
                else if (secDiff < 120)
                {
                    return "1 minute ago";
                }
                else if (secDiff < 3600)
                {
                    return $"{Math.Floor((double) secDiff / 60)} minutes ago";
                }
                else if (secDiff < 7200) // Less than 2 hours ago.
                {
                    return "1 hour ago";
                }
                else // Less than one day ago.
                {
                    return $"{Math.Floor((double) secDiff / 3600)} hours ago";
                }
            }
            else if (dayDiff == 1)
            {
                return "yesterday";
            }
            else if (dayDiff < 7)
            {
                return $"{dayDiff} days ago";
            }
            else if (dayDiff < 31)
            {
                return $"{Math.Ceiling((double) dayDiff / 7)} weeks ago";
            }
            else if (dayDiff < 40)
            {
                return "1 month ago";
            }
            else if (dayDiff < 340)
            {
                return $"{Math.Ceiling(dayDiff / 30.5)} months ago";
            }
            else if (dayDiff < 370)
            {
                return "1 year ago";
            }
            else
            {
                return "on " + d.ToString("d MMM yy");
            }
        }

        public static string ToPrettyFormatInFuture(DateTime d, TimeSpan s)
        {
            int dayDiff = (int)s.TotalDays;

            if (dayDiff == 0)
            {
                // Handle same-day times.
                int secDiff = (int)s.TotalSeconds;
                if (secDiff < 60)
                {
                    return "just now";
                }
                else if (secDiff < 120)
                {
                    return "in 1 minute";
                }
                else if (secDiff < 3600)
                {
                    return $"in {Math.Floor((double) secDiff / 60)} minutes";
                }
                else if (secDiff < 7200) // Less than 2 hours ago.
                {
                    return "in 1 hour";
                }
                else // Less than one day ago.
                {
                    return $"in {Math.Floor((double) secDiff / 3600)} hours";
                }
            }
            else if (dayDiff == 1)
            {
                return "tomorrow";
            }
            else if (dayDiff < 7)
            {
                return $"in {dayDiff} days";
            }
            else if (dayDiff < 31)
            {
                return $"in {Math.Ceiling((double) dayDiff / 7)} weeks";
            }
            else if (dayDiff < 40)
            {
                return "in 1 month";
            }
            else if (dayDiff < 340)
            {
                return $"in {Math.Ceiling(dayDiff / 30.5)} months";
            }
            else if (dayDiff < 370)
            {
                return "in a year";
            }
            else
            {
                return "on " + d.ToString("d MMM yy");
            }
        }

        public static string ToPrettyFormat(this DateTime? d)
        {
            if (d.HasValue)
                return d.Value.ToPrettyFormat();
            else
                return string.Empty;
        }

        public static DateTime StartOfTheMinute(this DateTime dt)
        {
            return new DateTime(dt.Year, dt.Month, dt.Day, dt.Hour, dt.Minute, 0, 0);
        }

        public static TimeSpan StartOfTheMinute(this TimeSpan ts)
        {
            return TimeSpan.FromMinutes((Int64)ts.TotalMinutes);
        }

        public static DateTime EndOfTheMinute(this DateTime dt)
        {
            return new DateTime(dt.Year, dt.Month, dt.Day, dt.Hour, dt.Minute, 59, 59);
        }

        public static TimeSpan EndOfTheMinute(this TimeSpan ts)
        {
            return ts.StartOfTheMinute().Add(TimeSpan.FromMinutes(1)).Add(-TimeSpan.FromMilliseconds(1));
        }

        public static DateTime StartOfTheMonth(this DateTime d)
        {
            return new DateTime(d.Year, d.Month, 1);
        }

        public static DateTime EndOfTheMonth(int year, int month)
        {
            return new DateTime(year, month, DateTime.DaysInMonth(year, month));
        }

        public static DateTime EndOfTheMonth(this DateTime d)
        {
            return new DateTime(d.Year, d.Month, DateTime.DaysInMonth(d.Year, d.Month));
        }

        public static DateTime StartOfTheWeek(this DateTime dt, DayOfWeek startOfWeek)
        {
            int diff = dt.DayOfWeek - startOfWeek;
            if (diff < 0)
            {
                diff += 7;
            }

            return dt.AddDays(-1 * diff).Date;
        }

        public static DateTime StartOfTheQuarter(this DateTime dt)
        {
            int currQuarter = (dt.Month - 1) / 3 + 1;
            return new DateTime(dt.Year, 3 * currQuarter - 2, 1);
        }

        public static DateTime EndOfTheDay(this DateTime dt)
        {
            return new DateTime(dt.Year, dt.Month, dt.Day, 23, 59, 59, 59);
        }

        public static DateTime StartOfTheDay(this DateTime dt)
        {
            return new DateTime(dt.Year, dt.Month, dt.Day, 0, 0, 0, 0);
        }

        public static int Quarter(this DateTime d)
        {
            return Convert.ToInt16((d.Month - 1) / 3) + 1;
        }

        public static DateTime StartOfTheYear(this DateTime date)
        {
            return StartOfTheYear(date.Year);
        }

        public static DateTime StartOfTheYear(int year)
        {
            return new DateTime(year, 1, 1);
        }

        public static DateTime EndOfTheYear(int year)
        {
            return new DateTime(year, 12, DateTime.DaysInMonth(year, 12)).EndOfTheDay();
        }

        public static DateTime EndOfTheYear(this DateTime date)
        {
            return EndOfTheYear(date.Year);
        }


        public static DateTime GetDateTimeFromUnixTimestamp(this double timestamp)
        {
            var origin = new DateTime(1970, 1, 1, 0, 0, 0, 0);
            return origin.AddSeconds(timestamp);
        }

        public static double ToUnixTimestamp(this DateTime date)
        {
            DateTime origin = new DateTime(1970, 1, 1, 0, 0, 0, 0);
            TimeSpan diff = date - origin;
            return Math.Floor(diff.TotalSeconds);
        }

        public static double? ToUnixTimestamp(this DateTime? date)
        {
            return date?.ToUnixTimestamp();
        }

        /// <summary>
        /// Returns numeric representation of the specified DateTime to pass to JavaScripts
        /// </summary>
        /// <param name="date"></param>
        /// <returns></returns>
        public static double ToUnixTimestampJs(this DateTime date)
        {
            return date.ToUniversalTime().ToUnixTimestamp() * 1000;
        }

        /// <summary>
        /// Converts Unix Timestamp passed rom JavaScript to DateTime
        /// </summary>
        /// <param name="value"></param>
        /// <returns></returns>
        public static DateTime? GetDateTimeFromUnixTimestampJs(this double value)
        {
            return GetDateTimeFromUnixTimestamp(value / 1000);
        }

        public static DateRange DatesIntersection(DateRange range1, DateRange range2)
        {
            if (range1.From == range1.To || range2.From == range2.To)
                return null;

            if (range1.From < range2.From && range2.From < range1.To && range1.To <= range2.To)
                return new DateRange(range2.From, range1.To);

            if (range2.From <= range1.From && range1.From < range2.To && range1.To > range2.To)
                return new DateRange(range1.From, range2.To);

            if (range2.From <= range1.From && range1.From <= range2.To && range2.From <= range1.To && range1.From <= range2.To)
                return new DateRange(range1.From, range1.To);

            if (range1.From < range2.From && range2.To < range1.To)
                return new DateRange(range2.From, range2.To);

            return null;
        }

        /// <summary>
        /// Extension method to get the start of the financial year
        /// </summary>    
        public static DateTime GetFinancialYear(this DateTime date, int startMonthOfFinancialYear)
        {
            return GetFinancialYear(date, startMonthOfFinancialYear, false);
        }

        public static DateTime GetFinancialYear(this DateTime date, int startMonthOfFinancialYear, bool returnEndOfFinancialYear)
        {
            if (startMonthOfFinancialYear < 1 || startMonthOfFinancialYear > 12)
                throw new ArgumentException("Must be between 1 and 12", nameof(startMonthOfFinancialYear));

            DateTime rtn = new DateTime(date.Year, startMonthOfFinancialYear, 1);
            if (date.Month < startMonthOfFinancialYear)
            {
                // Current FY starts last year - e.g. given April to March FY then 1st Feb 2013 FY starts 1st April 20*12*
                rtn = rtn.AddYears(-1);
            }

            if (returnEndOfFinancialYear)
                return rtn.AddYears(1).AddDays(-1);

            return rtn;
        }

        /// <summary>
        /// Truncate datetime to the given interval of time
        /// </summary>
	    public static DateTime Truncate(this DateTime dateTime, TimeSpan timeSpan)
        {
            if (timeSpan == TimeSpan.Zero) return dateTime; // Or could throw an ArgumentException
            return dateTime.AddTicks(-(dateTime.Ticks % timeSpan.Ticks));
        }

        /// <summary>
        /// Truncate datetime to the given interval of time
        /// </summary>
        public static DateTime? Truncate(this DateTime? dateTime, TimeSpan timeSpan)
        {
            if (!dateTime.HasValue)
                return null;
            return Truncate(dateTime.Value, timeSpan);
        }

        /// <summary>
        /// Formats date with the default format
        /// </summary>
        /// <param name="date"></param>
        /// <returns></returns>
        public static string FormatDate(this DateTime date)
        {
            // todo: add UI settings
            return date.ToString("dd/MM/yyyy", CultureInfo.InvariantCulture);
        }

        /// <summary>
        /// Strip seconds from the <see cref="DateTime"/> value
        /// </summary>
        /// <param name="date"></param>
        /// <returns></returns>
        public static DateTime StripSeconds(this DateTime date)
        {
            return new DateTime(date.Year, date.Month, date.Day, date.Hour, date.Minute, 0);
        }

        /// <summary>
        /// Strip seconds from the <see cref="TimeSpan"/> value
        /// </summary>
        /// <param name="time"></param>
        /// <returns></returns>
        public static TimeSpan StripSeconds(this TimeSpan time)
        {
            return new TimeSpan(time.Days, time.Hours, time.Minutes, 0);
        }


        /*
        public static string FormatDateTime(this DateTime? date, bool isForEdit = false)
        {
            if (!date.HasValue)
                return string.Empty;
            return date.Value.ToString(UISettings.DefaultDateTimeFormat(isForEdit), CultureInfo.InvariantCulture);
        }

        public static string FormatDateTime(this DateTime date, bool isForEdit = false)
        {
            return date.ToString(UISettings.DefaultDateTimeFormat(isForEdit), CultureInfo.InvariantCulture);
        }

        public static string FormatDate(this DateTime? date, bool isForEdit = false)
        {
            if (!date.HasValue)
                return string.Empty;
            return date.Value.ToString(UISettings.DefaultDateFormat(isForEdit), CultureInfo.InvariantCulture);
        }

        public static DateTime? ParseDate(this string dateStr)
        {
            if (string.IsNullOrEmpty(dateStr))
                return null;
            return Parser.ParseDate(dateStr);
        }

        public static bool TryParseDateExact(string s, IFormatProvider provider, DateTimeStyles style, out DateTime result)
        {
            return DateTime.TryParseExact(s, UISettings.DefaultDateFormat(true), provider, style, out result);
        }
        public static bool TryParseDateExact(string s, out DateTime result)
        {
            return DateTime.TryParseExact(s, UISettings.DefaultDateFormat(true), CultureInfo.InvariantCulture, DateTimeStyles.None, out result);
        }

        public static DateTime ParseDateExact(string value)
        {
            return DateTime.ParseExact(value, UISettings.DefaultDateFormat(true), CultureInfo.InvariantCulture);
        }

        public static bool DatesOverlaped(DateRange range1, DateRange range2)
        {
            return DatesIntersection(range1, range2) != null;
        }
         
         *
         */
    }
}
