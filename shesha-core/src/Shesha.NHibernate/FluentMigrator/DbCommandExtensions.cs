using System;
using System.Data;

namespace Shesha.FluentMigrator
{

    /// <summary>
    /// DB Command extensions
    /// </summary>
    public static class DbCommandExtensions
    {
        public static void AddParameter(this IDbCommand command, string name, object value)
        {
            var parameter = command.CreateParameter();
            parameter.ParameterName = name;
            parameter.Value = value != null
                ? value
                : DBNull.Value;
            command.Parameters.Add(parameter);
        }
    }
}
