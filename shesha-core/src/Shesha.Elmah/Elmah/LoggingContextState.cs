using ConcurrentCollections;
using System;
using System.Collections.Generic;

namespace Shesha.Elmah
{
    /// <summary>
    /// Current state of the logging context
    /// </summary>
    public class LoggingContextState
    {
        public List<ExceptionDetails> AllExceptions { get; set; } = new List<ExceptionDetails>();
        public ConcurrentHashSet<ExceptionWatchDog> ActiveWatchDogs { get; set; } = new ConcurrentHashSet<ExceptionWatchDog>();
    }

    public class ExceptionDetails 
    { 
        public Exception Exception { get; set; }
        public ErrorReference ErrorReference { get; set; }
    }
}
