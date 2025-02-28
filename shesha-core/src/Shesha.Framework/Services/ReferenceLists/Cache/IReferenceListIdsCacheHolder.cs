using Shesha.Cache;
using System;

namespace Shesha.Services.ReferenceLists.Cache
{

    public interface IReferenceListIdsCacheHolder : ICacheHolder<string, Guid>
    {
    }
}
