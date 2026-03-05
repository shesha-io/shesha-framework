using FluentMigrator;
using System.Data;

namespace Shesha.FluentMigrator
{
    /// <summary>
    /// DB helper base
    /// </summary>
    internal class DbHelperBase
    {
        protected IDbConnection Connection { get; private set; }
        protected IDbTransaction Transaction { get; private set; }
        protected DbmsType DbmsType { get; private set; }
        protected IQuerySchema QuerySchema { get; private set; }

        public DbHelperBase(DbmsType dbmsType, IDbConnection connection, IDbTransaction transaction, IQuerySchema querySchema)
        {
            DbmsType = dbmsType;
            Connection = connection;
            Transaction = transaction;
            QuerySchema = querySchema;
        }

        protected void ExecuteNonQuery(string sql, Action<IDbCommand>? prepareAction = null)
        {
            ExecuteCommand(sql, command => {
                prepareAction?.Invoke(command);
                command.ExecuteNonQuery();
            });
        }

        protected T? ExecuteScalar<T>(string sql, Action<IDbCommand>? prepareAction = null)
        {
            T? result = default;
            ExecuteCommand(sql, command => {
                prepareAction?.Invoke(command);
                result = (T?)command.ExecuteScalar();
            });
            return result;
        }

        protected void ExecuteCommand(string sql, Action<IDbCommand> action)
        {
            using (var command = Connection.CreateCommand())
            {
                command.Transaction = Transaction;
                command.CommandText = sql;

                action.Invoke(command);
            }
        }

        #region modules

        /// <summary>
        /// Get module Id by name
        /// </summary>
        /// <param name="name">Module name</param>
        /// <returns></returns>
        protected Guid? GetModuleId(string name) 
        {
            var sql = QuerySchema.TableExists("", "Frwk_Modules")
                ? @"select ""Id"" from ""Frwk_Modules"" where ""Name"" = @name"
                : QuerySchema.TableExists("frwk", "modules")
                    ? @"select id from frwk.modules where name = @name" 
                    : throw new NotSupportedException("Modules table not found");
            return ExecuteScalar<Guid?>(sql, command => {
                command.AddParameter("@name", name);
            });
        }

        /// <summary>
        /// Get module Id. When module is missing - create a new one.
        /// </summary>
        /// <param name="name"></param>
        /// <returns></returns>
        protected Guid GetOrCreateModuleId(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException($"{nameof(name)} must not be null");

            var id = GetModuleId(name);
            if (id.HasValue)
                return id.Value;

            var newId = Guid.NewGuid();
            var sql = QuerySchema.TableExists("", "Frwk_Modules")
                ? $@"insert into ""Frwk_Modules"" (""Id"", ""CreationTime"", ""IsDeleted"", ""IsEnabled"", ""IsEditable"", ""IsRootModule"", ""Name"") values (@id, @createDate, {BitOrBool(false)}, {BitOrBool(true)}, {BitOrBool(true)}, {BitOrBool(true)}, @name)"
                : QuerySchema.TableExists("frwk", "modules")
                    ? $@"insert into frwk.modules (id, creation_time, is_deleted, is_enabled, is_editable, is_root_module, Name) values (@id, @createDate, {BitOrBool(false)}, {BitOrBool(true)}, {BitOrBool(true)}, {BitOrBool(true)}, @name)"
                    : throw new NotSupportedException("Modules table not found");
            ExecuteNonQuery(sql,
                command => {
                    command.AddParameter("@id", newId);
                    command.AddParameter("@createDate", DateTime.Now);
                    command.AddParameter("@name", name);
                });
            return newId;
        }

        #endregion

        #region Applications

        /// <summary>
        /// Get front-end application Id by appKey
        /// </summary>
        public Guid? GetFrontEndAppId(string appKey)
        {
            return ExecuteScalar<Guid?>(@"select ""Id"" from ""Frwk_FrontEndApps"" where ""AppKey"" = @appKey", command => {
                command.AddParameter("@appKey", appKey);
            });
        }

        #endregion

        protected object BitOrBool(bool value)
        {
            return DbmsType == DbmsType.PostgreSQL
                ? value
                : value ? 1 : 0;
        }
    }
}
