using Shesha.Domain.Attributes;

namespace Shesha.Scheduler.Domain.Enums
{
    [ReferenceList("Shesha.Scheduler", "JobStatus")]
    public enum JobStatus
    {
        Active = 1,
        InActive = 2,
    }
}
