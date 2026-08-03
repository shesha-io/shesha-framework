using ElmahCore;
using Microsoft.Extensions.Options;
using Npgsql;
using NpgsqlTypes;
using Shesha.Services;
using System;
using System.Collections.Generic;
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
            if (SheshaElmahSettings.IsLoggingDisabled)
                return;

            if (error == null)
                throw new ArgumentNullException("error");

            var errorXml = ErrorXml.EncodeString(error);

            using (var connection = new NpgsqlConnection(ConnectionString))
            {
                connection.Open();

                var provider = StaticContext.IocManager.Resolve<ILoggingContextCollector>();
                var exceptionDetails = provider.CurrentState?.AllExceptions?.FirstOrDefault(e => e.Exception == error.Exception);
                var location = exceptionDetails?.Location;

                ExecuteCommand(connection, () => Commands.LogError(id, ApplicationName, error.HostName, error.Type, error.Source, error.Message, error.User, error.StatusCode, error.Time, errorXml, location));

                // gather refs and log them
                if (error.Exception != null && provider.CurrentState != null)
                {
                    var allRefs = provider.CurrentState.AllExceptions.Where(e => e.Exception == error.Exception).ToList();
                    if (allRefs.Any())
                    {
                        foreach (var item in allRefs)
                        {
                            ExecuteCommand(connection, () => Commands.LogErrorRef(id, item.ErrorReference.Type, item.ErrorReference.Id));
                        }
                    }
                }
            }
        }

        private void ExecuteCommand(NpgsqlConnection connection, Func<NpgsqlCommand> commandFactory)
        {
            using var command = commandFactory();
            command.Connection = connection;
            command.ExecuteNonQuery();
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
            if (SheshaElmahSettings.IsFetchingDisabled)
                return 0;

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

        private static class Commands
        {

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