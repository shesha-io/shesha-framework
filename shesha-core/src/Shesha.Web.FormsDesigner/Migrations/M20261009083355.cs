using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Web.FormsDesigner.Migrations
{
    /// <summary>
    /// Copies the model type stored on the form configuration row into the form settings of the markup
    /// for forms that were created without a template and have an empty model type in the form settings
    /// </summary>
    [Migration(20261009083355)]
    public class M20261009083355 : OneWayMigration
    {
        /// <summary>
        /// Runs the migration on SQL Server
        /// </summary>
        public override void Up()
        {
            IfDatabase("SqlServer").Execute.Sql(@"
update Frwk_FormConfigurations
set Markup = json_modify(
		case
			when json_query(Markup, '$.formSettings') is null
			then json_modify(Markup, '$.formSettings', json_query('{}'))
			else Markup
		end,
		'$.formSettings.modelType',
		ModelType
	)
where
	TemplateId is null
	and isjson(Markup) = 1
	and left(ltrim(Markup), 1) = '{'
	and ModelType is not null
	and ltrim(rtrim(ModelType)) <> ''
	and (
		json_value(Markup, '$.formSettings.modelType') is null
		or ltrim(rtrim(json_value(Markup, '$.formSettings.modelType'))) = ''
	)");
        }
    }
}
