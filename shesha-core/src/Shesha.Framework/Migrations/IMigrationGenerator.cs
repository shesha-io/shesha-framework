using System;
using System.Collections.Generic;

namespace Shesha.Migrations
{
    /// <summary>
    /// Generates database migrations
    /// </summary>
    public interface IMigrationGenerator
    {
        string GenerateMigrations(List<Type> entityTypes);

        /// <summary>
        /// Groups list of types by prefix. Note: temporary method, to be removed
        /// </summary>
        /// <param name="entityTypes"></param>
        /// <returns></returns>
        Dictionary<string, List<Type>> GroupByPrefixes(List<Type> entityTypes);
    }
}
