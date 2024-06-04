using System;

namespace Shesha.Elmah.Exceptions
{
    /// <summary>
    /// Indicates that application detected uncompleted <see cref="ExceptionWatchDog"/>
    /// </summary>
    public class WatchDogCleanupException: Exception
    {
        public WatchDogCleanupException(): base("Detected uncompleted exception watchdogs")
        {
            
        }
    }
}
