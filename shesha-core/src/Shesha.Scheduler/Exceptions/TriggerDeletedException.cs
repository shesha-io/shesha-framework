using System;

namespace Shesha.Scheduler.Exceptions
{
    /// <summary>
    /// 
    /// </summary>
    public class TriggerDeletedException: Exception
    {
        public Guid TriggerId { get; private set; }

        public TriggerDeletedException(Guid triggerId) : base($"Trigger with Id = '{triggerId}' is deleted, execution skipped") 
        {
            TriggerId = triggerId;
        }
    }
}
