using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Web.FormsDesigner.Migrations
{
    [Migration(20240823111099)]
    public class M20240823111099 : OneWayMigration
    {
        public override void Up()
        {
            Execute.Sql(@"update
	""Frwk_FormConfigurations""
set
	""Markup"" = replace(""Markup"", '""onInitialized"":""    pageContext.setFieldValue(''modelType'', form.formSettings.modelType)""', '""onInitialized"":""""')
where
	""Markup"" like '%""onInitialized"":""    pageContext.setFieldValue(''modelType'', form.formSettings.modelType)""%'");

            Execute.Sql(@"update
	""Frwk_FormConfigurations""
set
	""Markup"" = replace(""Markup"", 'pageContext.setFieldValue(''modelType'', form.formSettings.modelType)', '')
where
	""Markup"" like '%pageContext.setFieldValue(''modelType'', form.formSettings.modelType)%'");
        }
    }
}
