using System;

namespace Shesha.DynamicEntities.Enums
{
    [Flags]
    public enum EntityInitFlags
    {
        None = 0,
        DbActionRequired = 1,
        InitializationRequired = 2,

        DbActionFailed = 32,
        InitializationFailed = 64,
    }
}
