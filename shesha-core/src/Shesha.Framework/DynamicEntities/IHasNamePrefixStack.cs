using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities
{
    /// <summary>
    /// Declares common interface of service that has a prefix stack. Is used for recursive operations
    /// </summary>
    public interface IHasNamePrefixStack
    {
        /// <summary>
        /// Open name prefix context and returns disposable action that automaticaly closes it. Is used in the recursive operations
        /// </summary>
        /// <param name="prefix">New prefix value</param>
        /// <returns></returns>
        IDisposable OpenNamePrefix(string prefix);

        /// <summary>
        /// Current prefix in dot notation (e.g. 'prefix1.prefix2')
        /// </summary>
        string CurrentPrefix { get; }
    }
}
