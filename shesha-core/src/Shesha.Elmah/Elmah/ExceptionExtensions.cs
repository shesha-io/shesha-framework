using System;

namespace Shesha.Elmah
{
    /// <summary>
    /// Exception extensions
    /// </summary>
    public static class ExceptionExtensions
    {
        public const string ExceptionLoggedKey = "ExceptionLogged";

        /// <summary>
        /// Returns true if exception logged to Elmah
        /// </summary>
        /// <param name="ex"></param>
        /// <returns></returns>
        public static bool IsExceptionLogged(this Exception ex)
        {
            return ex.Data[ExceptionLoggedKey] != null && 
                (bool)ex.Data[ExceptionLoggedKey] == true;
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

    }
}
