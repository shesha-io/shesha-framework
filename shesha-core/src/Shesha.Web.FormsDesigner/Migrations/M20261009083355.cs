using FluentMigrator;
using Shesha.FluentMigrator;
using System;
using System.Collections.Generic;
using System.Data;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace Shesha.Web.FormsDesigner.Migrations
{
    /// <summary>
    /// Copies the model type stored on the form configuration row into the form settings of the markup
    /// for forms that were created without a template and have an empty model type in the form settings
    /// </summary>
    [Migration(20261009083355)]
    public class M20261009083355 : OneWayMigration
    {
        private static readonly JsonSerializerOptions SerializerOptions = new JsonSerializerOptions
        {
            // keep the markup (embedded scripts, html etc.) as close to the original as possible
            Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
        };

        public override void Up()
        {
            IfDatabase("SqlServer").Execute.WithConnection((connection, transaction) =>
            {
                ExecuteMigration(connection, transaction, useSqlServerSyntax: true);
            });

            IfDatabase("PostgreSql").Execute.WithConnection((connection, transaction) =>
            {
                ExecuteMigration(connection, transaction, useSqlServerSyntax: false);
            });
        }

        private static void ExecuteMigration(IDbConnection connection, IDbTransaction transaction, bool useSqlServerSyntax)
        {
            var selectSql = useSqlServerSyntax
                ? @"select fc.Id, fc.ModelType, fc.Markup
from Frwk_FormConfigurations fc
inner join Frwk_ConfigurationItems ci on ci.Id = fc.Id and ci.IsDeleted = 0
where fc.TemplateId is null
	and fc.ModelType is not null and ltrim(rtrim(fc.ModelType)) <> ''
	and fc.Markup is not null"
                : @"select fc.""Id"", fc.""ModelType"", fc.""Markup""
from ""Frwk_FormConfigurations"" fc
inner join ""Frwk_ConfigurationItems"" ci on ci.""Id"" = fc.""Id"" and ci.""IsDeleted"" = false
where fc.""TemplateId"" is null
	and fc.""ModelType"" is not null and trim(fc.""ModelType"") <> ''
	and fc.""Markup"" is not null";

            var updates = new List<(Guid Id, string Markup)>();

            using (var selectCommand = connection.CreateCommand())
            {
                selectCommand.Transaction = transaction;
                selectCommand.CommandText = selectSql;

                using var reader = selectCommand.ExecuteReader();
                while (reader.Read())
                {
                    var id = reader.GetGuid(0);
                    var modelType = reader.GetString(1);
                    var markup = reader.GetString(2);

                    var newMarkup = CopyModelTypeToMarkup(markup, modelType);
                    if (newMarkup != null)
                        updates.Add((id, newMarkup));
                }
            }

            var updateSql = useSqlServerSyntax
                ? "update Frwk_FormConfigurations set Markup = @markup where Id = @id"
                : @"update ""Frwk_FormConfigurations"" set ""Markup"" = @markup where ""Id"" = @id";

            foreach (var update in updates)
            {
                using var updateCommand = connection.CreateCommand();
                updateCommand.Transaction = transaction;
                updateCommand.CommandText = updateSql;

                var markupParam = updateCommand.CreateParameter();
                markupParam.ParameterName = "@markup";
                markupParam.DbType = DbType.String;
                markupParam.Value = update.Markup;
                updateCommand.Parameters.Add(markupParam);

                var idParam = updateCommand.CreateParameter();
                idParam.ParameterName = "@id";
                idParam.DbType = DbType.Guid;
                idParam.Value = update.Id;
                updateCommand.Parameters.Add(idParam);

                updateCommand.ExecuteNonQuery();
            }
        }

        /// <summary>
        /// Returns updated markup, or null if the markup doesn't need to be updated
        /// </summary>
        private static string CopyModelTypeToMarkup(string markup, string modelType)
        {
            if (string.IsNullOrWhiteSpace(markup))
                return null;

            JsonNode root;
            try
            {
                root = JsonNode.Parse(markup);
            }
            catch (JsonException)
            {
                // skip invalid markup
                return null;
            }

            // legacy markup (array of components) has no form settings, skip it
            if (root is not JsonObject markupObject)
                return null;

            try
            {
                var formSettings = markupObject["formSettings"];
                if (formSettings == null)
                {
                    markupObject["formSettings"] = new JsonObject { ["modelType"] = modelType };
                }
                else if (formSettings is JsonObject formSettingsObject)
                {
                    var currentModelType = formSettingsObject["modelType"];
                    if (currentModelType != null && !(currentModelType is JsonValue value && value.TryGetValue<string>(out var currentValue) && string.IsNullOrWhiteSpace(currentValue)))
                        return null;

                    formSettingsObject["modelType"] = modelType;
                }
                else
                    return null;
            }
            catch (InvalidOperationException)
            {
                // skip markup with duplicate keys or unexpected structure
                return null;
            }
            catch (ArgumentException)
            {
                return null;
            }

            return markupObject.ToJsonString(SerializerOptions);
        }
    }
}
