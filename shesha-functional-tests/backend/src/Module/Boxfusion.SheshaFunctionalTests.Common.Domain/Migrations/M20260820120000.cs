using FluentMigrator;
using Shesha.FluentMigrator;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Migrations
{
    /// <summary>
    /// Turns off "cascade delete unreferenced" on MembershipPayment.Member and Member.Bank.
    ///
    /// DeleteCascadeAsync walks these flags recursively, so deleting a MembershipPayment deleted the
    /// Member and then the Member's Bank. Member is soft-deleted (its row survives holding the Bank
    /// reference) while Bank is hard-deleted, so the flush failed with
    /// "deleted object would be re-saved by cascade".
    ///
    /// Neither cascade is wanted in the first place: a payment should not delete the member who made
    /// it, and banks are shared reference data.
    /// </summary>
    [Migration(20260820120000)]
    public class M20260820120000 : OneWayMigration
    {
        public override void Up()
        {
            IfDatabase("SqlServer").Execute.Sql(@"update
	ep
set
	cascade_delete_unreferenced = 0
from
	frwk.entity_properties ep
	inner join frwk.entity_configs ec on ec.id = ep.entity_config_id
where
	ec.namespace = 'Boxfusion.SheshaFunctionalTests.Common.Domain.Domain'
	and ep.cascade_delete_unreferenced = 1
	and (
		ec.class_name = 'MembershipPayment' and ep.name = 'Member'
		or
		ec.class_name = 'Member' and ep.name = 'Bank'
	)");

            IfDatabase("PostgreSql").Execute.Sql(@"UPDATE
	frwk.entity_properties ep
SET
	cascade_delete_unreferenced = false
FROM
	frwk.entity_configs ec
WHERE
	ec.id = ep.entity_config_id
	AND ec.namespace = 'Boxfusion.SheshaFunctionalTests.Common.Domain.Domain'
	AND ep.cascade_delete_unreferenced = true
	AND (
		ec.class_name = 'MembershipPayment' AND ep.name = 'Member'
		OR
		ec.class_name = 'Member' AND ep.name = 'Bank'
	)");
        }
    }
}
