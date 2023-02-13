using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities
{
    // ToDo AS: Don't use. Is not completed!
    [Obsolete("Don't use. Is not completed!")]
    public interface IDynamicDtoInputProxy
    {
        public void ResetState();
        public bool IsChanged { get; }

        public Dictionary<string, object> Changes { get; }
    }
}
