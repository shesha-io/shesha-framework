using Shesha.Domain.Attributes;

namespace Shesha.Scheduler.Domain.Enums
{
    [ReferenceList("Shesha.Scheduler", "StartUpMode")]
    public enum StartUpMode
    {
        Automatic = 1,
        Manual = 2,
    }
}
