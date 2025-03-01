using System;

namespace Shesha.Elmah
{
    /// <summary>
    /// Exception extensions
    /// </summary>
    public static class ExceptionExtensions
    {
        public const string ExceptionIdKey = "ExceptionId";
        public const string ExceptionLoggedKey = "ExceptionLogged";

        /// <summary>
        /// Returns true if exception logged to Elmah
        /// </summary>
        /// <param name="ex"></param>
        /// <returns></returns>
        public static bool IsExceptionLogged(this Exception ex)
        {
            var loggedFlag = ex.Data[ExceptionLoggedKey];
            return loggedFlag != null && (bool)loggedFlag == true;
        }

        /// <summary>
        /// Mark exception as logged to Elmah
        /// </summary>
        /// <param name="ex"></param>
        /// <returns></returns>
        public static void MarkExceptionAsLogged(this Exception ex)
        {
            ex.Data[ExceptionLoggedKey] = true;
        }

        /// <summary>
        /// Set exception identifier
        /// </summary>
        public static void SetExceptionId(this Exception ex, Guid id)
        {
            ex.Data[ExceptionIdKey] = id;
        }

        public static Guid? GetExceptionId(this Exception ex)
        {
            var exceptionIdValue = ex.Data[ExceptionIdKey];
            return exceptionIdValue != null && exceptionIdValue is Guid
                ? (Guid)exceptionIdValue
                : (Guid?)null;
        }
    }
}
