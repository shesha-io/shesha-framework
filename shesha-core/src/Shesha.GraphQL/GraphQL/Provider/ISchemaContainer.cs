using GraphQL.Types;
using System.Threading.Tasks;

namespace Shesha.GraphQL.Provider
{
    /// <summary>
    /// Schema container
    /// </summary>
    public interface ISchemaContainer
    {
        /// <summary>
        /// Get schema
        /// </summary>
        /// <param name="schemaName"></param>
        /// <param name="defaultSchemaName"></param>
        /// <returns></returns>
        Task<ISchema> GetOrDefaultAsync(string schemaName, string defaultSchemaName = null);

        /// <summary>
        /// Register custom schema
        /// </summary>
        void RegisterCustomSchema(string name, ISchema schema);
    }
}
