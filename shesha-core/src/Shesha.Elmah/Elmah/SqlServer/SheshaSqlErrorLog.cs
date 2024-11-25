using ElmahCore;
using Microsoft.CodeAnalysis;
using Microsoft.Extensions.Options;
using Shesha.Services;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;

namespace Shesha.Elmah.SqlServer
{
    /// <summary>
    ///     An <see cref="ErrorLog" /> implementation that uses MSSQL
    ///     as its backing store.
    /// </summary>
    // ReSharper disable once UnusedType.Global
    public class SheshaSqlErrorLog : ErrorLog
    {
        private const int MaxAppNameLength = 60;

        /// <summary>
        ///     Initializes a new instance of the <see cref="SqlErrorLog" /> class
        ///     using a dictionary of configured settings.
        /// </summary>
        public SheshaSqlErrorLog(IOptions<ElmahOptions> option)
            : this(option.Value.ConnectionString)
        {
        }

        /// <summary>
        ///     Initializes a new instance of the <see cref="SqlErrorLog" /> class
        ///     to use a specific connection string for connecting to the database.
        /// </summary>
        public SheshaSqlErrorLog(string connectionString)
        {
            if (string.IsNullOrEmpty(connectionString))
                throw new ArgumentNullException(nameof(connectionString));

            ConnectionString = connectionString;

            //PrepareDatabase();
        }

        /// <summary>
        ///     Gets the name of this error log implementation.
        /// </summary>
        public override string Name => "MSSQL Error Log";

        /// <summary>
        ///     Gets the connection string used by the log to connect to the database.
        /// </summary>
        // ReSharper disable once MemberCanBeProtected.Global
        public virtual string ConnectionString { get; }

        public override string Log(Error error)
        {
            var id = error.Exception?.GetExceptionId();
            if (id.HasValue)
                return id.ToString();

            id = Guid.NewGuid();
            error.Exception?.SetExceptionId(id.Value);

            Log(id.Value, error);
                
            return id.ToString();
        }

        public override void Log(Guid id, Error error)
        {
            try
            {
                var errorXml = ErrorXml.EncodeString(error);

                using (var connection = new SqlConnection(ConnectionString)) 
                {
                    connection.Open();

                    var provider = StaticContext.IocManager.Resolve<ILoggingContextCollector>();
                    var exceptionDetails = provider.CurrentState?.AllExceptions?.FirstOrDefault(e => e.Exception == error.Exception);
                    var location = exceptionDetails?.Location;

                    ExecuteCommand(connection, Commands.LogError(id, ApplicationName, error.HostName, error.Type, error.Source, error.Message, error.User, error.StatusCode, error.Time, errorXml, location));

                    // gather refs and log them
                    if (error.Exception != null && provider.CurrentState != null)
                    {
                        var allRefs = provider.CurrentState.AllExceptions.Where(e => e.Exception == error.Exception).ToList();
                        if (allRefs.Any()) 
                        {
                            foreach (var item in allRefs)
                            {
                                ExecuteCommand(connection, Commands.LogErrorRef(id, item.ErrorReference.Type, item.ErrorReference.Id));
                            }
                        }
                    }
                }
            }
            catch
            {
                //guard: silently fail, this can't bubble up or it will create a stack overflow from errors attempting to log errors....
            }
        }

        private void ExecuteCommand(SqlConnection connection, SqlCommand command) 
        {
            command.Connection = connection;
            command.ExecuteNonQuery();
            command.Dispose();
        }

        public override ErrorLogEntry GetError(string id)
        {
            if (id == null) throw new ArgumentNullException(nameof(id));
            if (id.Length == 0) throw new ArgumentException(null, nameof(id));

            Guid errorGuid;

            try
            {
                errorGuid = new Guid(id);
            }
            catch (FormatException e)
            {
                throw new ArgumentException(e.Message, nameof(id), e);
            }

            string errorXml;

            using (var connection = new SqlConnection(ConnectionString))
            using (var command = Commands.GetErrorXml(ApplicationName, errorGuid))
            {
                command.Connection = connection;
                connection.Open();
                errorXml = (string)command.ExecuteScalar();
            }

            if (errorXml == null)
                return null;

            var error = ErrorXml.DecodeString(errorXml);
            return new ErrorLogEntry(this, id, error);
        }

        public override int GetErrors(int errorIndex, int pageSize, ICollection<ErrorLogEntry> errorEntryList)
        {
            if (errorIndex < 0) throw new ArgumentOutOfRangeException(nameof(errorIndex), errorIndex, null);
            if (pageSize < 0) throw new ArgumentOutOfRangeException(nameof(pageSize), pageSize, null);

            using (var connection = new SqlConnection(ConnectionString))
            {
                connection.Open();

                using (var command = Commands.GetErrorsXml(ApplicationName, errorIndex, pageSize))
                {
                    command.Connection = connection;

                    using (var reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            var id = reader.GetGuid(0);
                            var xml = reader.GetString(1);
                            var error = ErrorXml.DecodeString(xml);
                            errorEntryList.Add(new ErrorLogEntry(this, id.ToString(), error));
                        }
                    }
                }

                using (var command = Commands.GetErrorsXmlTotal(ApplicationName))
                {
                    command.Connection = connection;
                    return int.Parse(command.ExecuteScalar().ToString());
                }
            }
        }

        private void PrepareDatabase() 
        {
            using (var connection = new SqlConnection(ConnectionString))
            {
                connection.Open();

                if (!Commands.SchemaExists(connection, DBConstants.Schema))
                    Commands.CreateSchema(connection, DBConstants.Schema);

                if (!Commands.TableExists(connection, DBConstants.Schema, DBConstants.ErrorsTable))
                    Commands.CreateErrorsTable(connection);

                if (!Commands.TableExists(connection, DBConstants.Schema, DBConstants.ErrorRefsTable))
                    Commands.CreateErrorRefsTable(connection);
            }
        }

        private static class Commands
        {
            public static void ExecuteNonQuery(SqlConnection connection, string sql)
            {
                using (var command = new SqlCommand(sql)) 
                {
                    command.Connection = connection;
                    if (connection.State == ConnectionState.Closed)
                        connection.Open();
                    command.ExecuteNonQuery();
                }                    
            }

            public static object ExecuteScalar(SqlConnection connection, string sql) 
            {
                using (var command = new SqlCommand(sql))
                {
                    command.Connection = connection;
                    if (connection.State == ConnectionState.Closed)
                        connection.Open();
                    return command.ExecuteScalar();
                }
            }

            private static void ExecuteBatchNonQuery(SqlConnection conn, string sql)
            {
                var sqlBatch = string.Empty;
                using (var cmd = new SqlCommand(string.Empty, conn))
                {
                    sql += "\nGO"; // make sure last batch is executed.
                    foreach (var line in sql.Split(new[] { "\n", "\r" },
                        StringSplitOptions.RemoveEmptyEntries))
                        if (line.ToUpperInvariant().Trim() == "GO")
                        {
                            cmd.CommandText = sqlBatch;
                            cmd.ExecuteNonQuery();
                            sqlBatch = string.Empty;
                        }
                        else
                        {
                            sqlBatch += line + "\n";
                        }
                }
            }

            public static bool SchemaExists(SqlConnection connection, string schemaName)
            {
                var result = (int?)ExecuteScalar(connection, $@"
SELECT 1 
WHERE EXISTS (
   SELECT 1 FROM sys.schemas WHERE name = '{schemaName}'
   )
");
                return result == 1;
            }

            public static void CreateSchema(SqlConnection connection, string schemaName)
            {
                ExecuteNonQuery(connection, $@"create schema {schemaName}");
            }

            public static bool TableExists(SqlConnection connection, string schemaName, string tableName)
            {
                var result = (int?)ExecuteScalar(connection, $@"
SELECT 1 
WHERE EXISTS (
   SELECT 1
   FROM   INFORMATION_SCHEMA.TABLES 
   WHERE  TABLE_SCHEMA = '{schemaName}'
   AND    TABLE_NAME = '{tableName}'
   )
");
                return result == 1;
            }

            public static void CreateErrorsTable(SqlConnection connection) 
            {
                var schemaName = DBConstants.Schema;
                var tableName = DBConstants.ErrorsTable;

                ExecuteBatchNonQuery(connection, $@"
CREATE TABLE [{schemaName}].[{tableName}]
(
    [error_id]     UNIQUEIDENTIFIER NOT NULL,
    [application]  NVARCHAR(60)  NOT NULL,
    [host]         NVARCHAR(50)  NOT NULL,
    [type]         NVARCHAR(100) NOT NULL,
    [source]       NVARCHAR(60)  NOT NULL,
    [message]      NVARCHAR(MAX) NOT NULL,
    [user]         NVARCHAR(50)  NOT NULL,
    [status_code]  INT NOT NULL,
    [time_utc]     DATETIME NOT NULL,
    [sequence]     INT IDENTITY (1, 1) NOT NULL,
    [all_xml]      NVARCHAR(MAX) NOT NULL 
) 
GO

ALTER TABLE [{schemaName}].[{tableName}] WITH NOCHECK ADD 
    CONSTRAINT [pk_{tableName}] PRIMARY KEY NONCLUSTERED ([error_id]) ON [PRIMARY] 
GO

ALTER TABLE [{schemaName}].[{tableName}] ADD 
    CONSTRAINT [df_{tableName}_error_id] DEFAULT (NEWID()) FOR [error_id]
GO

CREATE NONCLUSTERED INDEX [ix_{tableName}_app_time_seq] ON [{schemaName}].[{tableName}] 
(
    [application]   ASC,
    [time_utc]      DESC,
    [sequence]      DESC
) 
ON [PRIMARY]");
            }


            public static void CreateErrorRefsTable(SqlConnection connection)
            {
                var schemaName = DBConstants.Schema;
                var tableName = DBConstants.ErrorRefsTable;

                ExecuteBatchNonQuery(connection, $@"
CREATE TABLE [{schemaName}].[{tableName}]
(
    [error_id]     UNIQUEIDENTIFIER NOT NULL,
    [ref_type]     NVARCHAR(100) NOT NULL,
    [ref_id]       NVARCHAR(40)  NOT NULL
) 
GO

CREATE NONCLUSTERED INDEX [ix_{tableName}_type_id] ON [{schemaName}].[{tableName}] 
(
    [ref_type],
    [ref_id]
) 
ON [PRIMARY]");
            }

            public static SqlCommand LogError(
                Guid id,
                string appName,
                string hostName,
                string typeName,
                string source,
                string message,
                string user,
                int statusCode,
                DateTime time,
                string xml,
                string location)
            {
                var command = new SqlCommand
                {
                    CommandText = $@"
/* elmah */
INSERT INTO [{DBConstants.Schema}].[{DBConstants.ErrorsTable}] (error_id, application, host, type, source, message, ""user"", status_code, time_utc, all_xml, location)
VALUES (@error_id, @application, @host, @type, @source, @message, @user, @status_code, @time_utc, @all_xml, @location)
"
                };
                command.Parameters.Add(new SqlParameter("error_id", id));
                command.Parameters.Add(new SqlParameter("application", appName));
                command.Parameters.Add(new SqlParameter("host", hostName));
                command.Parameters.Add(new SqlParameter("type", typeName));
                command.Parameters.Add(new SqlParameter("source", source));
                command.Parameters.Add(new SqlParameter("message", message));
                command.Parameters.Add(new SqlParameter("user", user));
                command.Parameters.Add(new SqlParameter("status_code", statusCode));
                command.Parameters.Add(new SqlParameter("time_utc", time.ToUniversalTime()));
                command.Parameters.Add(new SqlParameter("all_xml", xml));
                command.Parameters.Add(new SqlParameter("location", location ?? ""));

                return command;
            }

            public static SqlCommand LogErrorRef(
                Guid id,
                string refType,
                string refId)
            {
                var command = new SqlCommand
                {
                    CommandText = $@"INSERT INTO [{DBConstants.Schema}].[{DBConstants.ErrorRefsTable}] (error_id, ref_type, ref_id) VALUES (@error_id, @ref_type, @ref_id)"
                };
                command.Parameters.Add(new SqlParameter("error_id", id));
                command.Parameters.Add(new SqlParameter("ref_type", refType));
                command.Parameters.Add(new SqlParameter("ref_id", refId));

                return command;
            }

            public static SqlCommand GetErrorXml(
                string appName,
                Guid id)
            {
                var command = new SqlCommand
                {
                    CommandText = $@"
SELECT all_xml FROM [{DBConstants.Schema}].[{DBConstants.ErrorsTable}]
WHERE 
    application = @application 
    AND error_id = @error_id
"
                };


                command.Parameters.Add(new SqlParameter("application", appName));
                command.Parameters.Add(new SqlParameter("error_id", id));

                return command;
            }

            public static SqlCommand GetErrorsXml(
                string appName,
                int errorIndex,
                int pageSize)
            {
                var command = new SqlCommand
                {
                    CommandText = $@"
SELECT error_id, all_xml FROM [{DBConstants.Schema}].[{DBConstants.ErrorsTable}]
WHERE
    application = @application
ORDER BY [sequence] DESC
OFFSET     @offset ROWS
FETCH NEXT @limit ROWS ONLY;
"
                };


                command.Parameters.Add("@application", SqlDbType.NVarChar, MaxAppNameLength).Value = appName;
                command.Parameters.Add("@offset", SqlDbType.Int).Value = errorIndex;
                command.Parameters.Add("@limit", SqlDbType.Int).Value = pageSize;

                return command;
            }

            public static SqlCommand GetErrorsXmlTotal(string appName)
            {
                var command = new SqlCommand
                {
                    CommandText = $"SELECT COUNT(*) FROM [{DBConstants.Schema}].[{DBConstants.ErrorsTable}] WHERE application = @application"
                };
                command.Parameters.Add("@application", SqlDbType.NVarChar, MaxAppNameLength).Value = appName;
                return command;
            }
        }
    }
}
