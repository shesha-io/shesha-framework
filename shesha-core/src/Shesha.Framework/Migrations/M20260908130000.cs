using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    /// <summary>
    /// `User.NormalizedEmailAddress` inherited `[Required]` from `AbpUserBase`, so
    /// `HardcodeMetadataProvider` seeded the property config with `Required = true` and
    /// `EntityPropertyValidator` rejected every save that did not supply a value. Nothing supplies
    /// one - `User.SetNormalizedNames` is only called by ABP's `UserManager`, never by dynamic CRUD -
    /// so saving a person through the User Details form always failed. The attribute is now dropped
    /// by overriding the property, but `EntityConfigsBootstrapper` merges the hardcoded flag with
    /// `Required = src.Required || dst.Required`, which never clears an existing `true`. Databases
    /// seeded while the attribute was still visible therefore keep the stale flag on every restart
    /// and need it reset here. The column itself is nullable (M20200707000400), so no data is at risk.
    /// Scoped by property name plus `class_name = 'User'` rather than by namespace, so it also reaches
    /// user entities subclassed in consuming applications.
    /// </summary>
    [Migration(20260908130000)]
    public class M20260908130000 : OneWayMigration
    {
        public override void Up()
        {
            IfDatabase("SqlServer").Execute.Sql(@"update frwk.entity_properties
set required = 0
where lower(name) = 'normalizedemailaddress'
	and entity_config_id in (
		select id from frwk.entity_configs
		where class_name = 'User')");

            IfDatabase("PostgreSql").Execute.Sql(@"update frwk.entity_properties
set required = false
where lower(name) = 'normalizedemailaddress'
	and entity_config_id in (
		select id from frwk.entity_configs
		where class_name = 'User')");
        }
    }
}
