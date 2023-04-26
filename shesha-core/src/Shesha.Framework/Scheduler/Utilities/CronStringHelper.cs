using Cronos;

namespace Shesha.Scheduler.Utilities
{
    /// <summary>
    /// CRON string helper
    /// </summary>
    public static class CronStringHelper
    {
        /// <summary>
        /// Returns true if the specified <paramref name="expression"/> is a valid CRON string
        /// </summary>
        /// <param name="expression"></param>
        /// <returns></returns>
        public static bool IsValidCronExpression(string expression)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(expression))
                    return false;

                var parsed = CronExpression.Parse(expression);
                return true;
            }
            catch (CronFormatException)
            {
                return false;
            }
        }
    }
}
