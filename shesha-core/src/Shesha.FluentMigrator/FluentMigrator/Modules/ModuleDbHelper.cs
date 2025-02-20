using FluentMigrator;
using System.Data;

namespace Shesha.FluentMigrator.Modules
{
    internal class ModuleDbHelper : DbHelperBase
    {
        public ModuleDbHelper(DbmsType dbmsType, IDbConnection connection, IDbTransaction transaction, IQuerySchema querySchema) : base(dbmsType, connection, transaction, querySchema)
        {
        }

        public Guid EnsureModuleExists(string name) 
        { 
            return GetOrCreateModuleId(name);
        }
    }
}
