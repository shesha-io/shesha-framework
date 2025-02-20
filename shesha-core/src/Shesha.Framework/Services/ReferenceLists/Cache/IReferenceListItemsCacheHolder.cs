using Shesha.Cache;
using Shesha.Services.ReferenceLists.Dto;
using System;
using System.Collections.Generic;

namespace Shesha.Services.ReferenceLists.Cache
{

    public interface IReferenceListItemsCacheHolder : ICacheHolder<Guid, List<ReferenceListItemDto>>
    {
    }
}
