using Shesha.Cache;
using static Shesha.Services.ReferenceListHelper;

namespace Shesha.Services.ReferenceLists.Cache
{

    public interface IReferenceListIdsCacheHolder : ICacheHolder<string, RefListRevisionIds>
    {
    }
}
