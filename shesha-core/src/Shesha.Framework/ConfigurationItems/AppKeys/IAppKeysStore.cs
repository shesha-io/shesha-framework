using System.Collections.Generic;

namespace Shesha.ConfigurationItems
{
    public interface IAppKeysStore
    {
        public List<string> AppKeys { get; }
    }    
}
