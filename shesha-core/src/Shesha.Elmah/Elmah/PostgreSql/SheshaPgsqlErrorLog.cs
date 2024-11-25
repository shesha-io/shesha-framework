using ElmahCore;
using Microsoft.Extensions.Options;
using Npgsql;
using NpgsqlTypes;
using Shesha.Services;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;

namespace Shesha.Elmah.PostgreSql
{
    /// <summary>
    ///     An <see cref="ErrorLog" /> implementation that uses PostgreSQL
    ///     as its backing store.
    /// </summary>
    public class SheshaPgsqlErrorLog : ErrorLog
    {
        private const int MaxAppNameLength = 60;

        /// <summary>
        ///     Initializes a new instance of the <see cref="SheshaPgsqlErrorLog" /> class
        ///     using a dictionary of configured settings.
        /// </summary>
        public SheshaPgsqlErrorLog(IOptions<ElmahOptions> option) : this(option.Value.ConnectionString)
        {
        }

        /// <summary>
        ///     Initializes a new instance of the <see cref="SheshaPgsqlErrorLog" /> class
        ///     to use a specific connection string for connecting to the database.
        /// </summary>
        public SheshaPgsqlErrorLog(string connectionString)
        {
            if (string.IsNullOrEmpty(connectionString))
                throw new ArgumentNullException("connectionString");

            ConnectionString = connectionString;

            //PrepareDatabase();
        }

        /// <summary>
        ///     Gets the name of this error log implementation.
        /// </summary>
        public override string Name => "PostgreSQL Error Log";

        /// <summary>
        ///     Gets the connection string used by the log to connect to the database.
        /// </summary>
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
            if (error == null)
                throw new ArgumentNullException("error");

            var errorXml = ErrorXml.EncodeString(error);

            using (var connection = new NpgsqlConnection(ConnectionString))
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

        private void ExecuteCommand(NpgsqlConnection connection, NpgsqlCommand command)
        {
            command.Connection = connection;
            command.ExecuteNonQuery();
            command.Dispose();
        }

        public override ErrorLogEntry GetError(string id)
        {
            if (id == null) throw new ArgumentNullException("id");
            if (id.Length == 0) throw new ArgumentException(null, "id");

            Guid errorGuid;

            try
            {
                errorGuid = new Guid(id);
            }
            catch (FormatException e)
            {
                throw new ArgumentException(e.Message, "id", e);
            }

            string errorXml;

            using (var connection = new NpgsqlConnection(ConnectionString))
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
            if (errorIndex < 0) throw new ArgumentOutOfRangeException("errorIndex", errorIndex, null);
            if (pageSize < 0) throw new ArgumentOutOfRangeException("pageSize", pageSize, null);

            using (var connection = new NpgsqlConnection(ConnectionString))
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
                    return Convert.ToInt32(command.ExecuteScalar());
                }
            }
        }

        private void PrepareDatabase()
        {
            using (var connection = new NpgsqlConnection(ConnectionString))
            {
                connection.Open();

                Commands.CreateSchemaIfMissing(connection, DBConstants.Schema);

                if (!Commands.TableExists(connection, DBConstants.Schema, DBConstants.ErrorsTable))
                    Commands.CreateErrorsTable(connection, DBConstants.Schema, DBConstants.ErrorsTable);

                if (!Commands.TableExists(connection, DBConstants.Schema, DBConstants.ErrorRefsTable))
                    Commands.CreateErrorRefsTable(connection, DBConstants.Schema, DBConstants.ErrorRefsTable);
            }
        }


        private static class Commands
        {
            public static void ExecuteNonQuery(NpgsqlConnection connection, string sql)
            {
                using (var command = new NpgsqlCommand(sql))
                {
                    command.Connection = connection;
                    if (connection.State == ConnectionState.Closed)
                        connection.Open();
                    command.ExecuteNonQuery();
                }
            }

            public static object ExecuteScalar(NpgsqlConnection connection, string sql)
            {
                using (var command = new NpgsqlCommand(sql))
                {
                    command.Connection = connection;
                    if (connection.State == ConnectionState.Closed)
                        connection.Open();
                    return command.ExecuteScalar();
                }
            }

            public static void CreateSchemaIfMissing(NpgsqlConnection connection, string schemaName)
            {
                ExecuteNonQuery(connection, @$"create schema if not exists ""{schemaName}""");
            }

            public static void CreateSchema(NpgsqlConnection connection, string schemaName)
            {
                ExecuteNonQuery(connection, $@"create schema {schemaName}");
            }

            public static bool TableExists(NpgsqlConnection connection, string schemaName, string tableName)
            {
                var result = (bool?)ExecuteScalar(connection, $@"
SELECT EXISTS (
   SELECT 1
   FROM   information_schema.tables 
   WHERE  table_schema = '{schemaName}'
   AND    table_name = '{tableName}'
   )
");
                return result == true;
            }

            public static void CreateErrorsTable(NpgsqlConnection connection, string schemaName, string tableName)
            {
                ExecuteNonQuery(connection, $@"
CREATE SEQUENCE {schemaName}.{tableName}_sequence;
CREATE TABLE {schemaName}.{tableName}
(
    error_id	UUID NOT NULL,
    application	VARCHAR(60) NOT NULL,
    host 		VARCHAR(50) NOT NULL,
    type		VARCHAR(100) NOT NULL,
    source		VARCHAR(60)  NOT NULL,
    message		VARCHAR(500) NOT NULL,
    ""user""	VARCHAR(50)  NOT NULL,
    status_code	INT NOT NULL,
    time_utc	TIMESTAMP NOT NULL,
    sequence	INT NOT NULL DEFAULT NEXTVAL('{schemaName}.{tableName}_sequence'),
    all_xml		TEXT NOT NULL
);

ALTER TABLE {schemaName}.{tableName} ADD CONSTRAINT pk_{tableName} PRIMARY KEY (error_id);

CREATE INDEX ix_{tableName}_app_time_seq ON {schemaName}.{tableName} USING BTREE
(
    application   ASC,
    time_utc      DESC,
    sequence      DESC
);
");
            }

            public static void CreateErrorRefsTable(NpgsqlConnection connection, string schemaName, string tableName)
            {
                ExecuteNonQuery(connection, $@"
CREATE TABLE {schemaName}.{tableName}
(
    error_id	UUID NOT NULL,
    ref_type    VARCHAR(100) NOT NULL,
    ref_id		VARCHAR(40) NOT NULL
);

CREATE INDEX ix_{tableName}_type_id ON {schemaName}.{tableName} USING BTREE
(
    ref_type,
    ref_id
);
");
            }

            public static NpgsqlCommand LogError(
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
                var command = new NpgsqlCommand();
                command.CommandText =
                    $@"
/* elmah */
INSERT INTO {DBConstants.Schema}.{DBConstants.ErrorsTable} (error_id, application, host, type, source, message, ""user"", status_code, time_utc, all_xml, location)
VALUES (@error_id, @application, @host, @type, @source, @message, @user, @status_code, @time_utc, @all_xml, @location)
";
                command.Parameters.Add(new NpgsqlParameter("error_id", id));
                command.Parameters.Add(new NpgsqlParameter("application", appName));
                command.Parameters.Add(new NpgsqlParameter("host", hostName));
                command.Parameters.Add(new NpgsqlParameter("type", typeName));
                command.Parameters.Add(new NpgsqlParameter("source", source));
                command.Parameters.Add(new NpgsqlParameter("message", message));
                command.Parameters.Add(new NpgsqlParameter("user", user));
                command.Parameters.Add(new NpgsqlParameter("status_code", statusCode));
                command.Parameters.Add(new NpgsqlParameter("time_utc", time.ToUniversalTime()));
                command.Parameters.Add(new NpgsqlParameter("all_xml", xml));
                command.Parameters.Add(new NpgsqlParameter("location", location ?? ""));

                return command;
            }

            public static NpgsqlCommand LogErrorRef(
    Guid id,
    string refType,
    string refId)
            {
                var command = new NpgsqlCommand
                {
                    CommandText = $@"INSERT INTO {DBConstants.Schema}.{DBConstants.ErrorRefsTable} (error_id, ref_type, ref_id) VALUES (@error_id, @ref_type, @ref_id)"
                };
                command.Parameters.Add(new NpgsqlParameter("id", Guid.NewGuid()));
                command.Parameters.Add(new NpgsqlParameter("error_id", id));
                command.Parameters.Add(new NpgsqlParameter("ref_type", refType));
                command.Parameters.Add(new NpgsqlParameter("ref_id", refId));

                return command;
            }

            public static NpgsqlCommand GetErrorXml(string appName, Guid id)
            {
                var command = new NpgsqlCommand();

                command.CommandText =
                    $@"
SELECT all_xml FROM {DBConstants.Schema}.{DBConstants.ErrorsTable} 
WHERE 
    application = @application 
    AND error_id = @error_id
";

                command.Parameters.Add(new NpgsqlParameter("application", appName));
                command.Parameters.Add(new NpgsqlParameter("error_id", id));

                return command;
            }

            public static NpgsqlCommand GetErrorsXml(string appName, int errorIndex, int pageSize)
            {
                var command = new NpgsqlCommand();

                command.CommandText =
                    $@"
SELECT error_id, all_xml FROM {DBConstants.Schema}.{DBConstants.ErrorsTable}
WHERE
    application = @application
ORDER BY sequence DESC
OFFSET @offset
LIMIT @limit
";

                command.Parameters.Add("@application", NpgsqlDbType.Text, MaxAppNameLength).Value = appName;
                command.Parameters.Add("@offset", NpgsqlDbType.Integer).Value = errorIndex;
                command.Parameters.Add("@limit", NpgsqlDbType.Integer).Value = pageSize;

                return command;
            }

            public static NpgsqlCommand GetErrorsXmlTotal(string appName)
            {
                var command = new NpgsqlCommand();
                command.CommandText = $"SELECT COUNT(*) FROM {DBConstants.Schema}.{DBConstants.ErrorsTable} WHERE application = @application";
                command.Parameters.Add("@application", NpgsqlDbType.Text, MaxAppNameLength).Value = appName;
                return command;
            }
        }
    }
}
