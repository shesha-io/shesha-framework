using System;
using FluentMigrator;

namespace Shesha.NHibernate.Migrations
{
    [Migration(20201023151400)]
    public class M20201023151400: Migration
    {
        public override void Up()
        {
            if (!Schema.Table("Core_Persons").Column("isContractor").Exists())
                Alter.Table("Core_Persons").AddColumn("IsContractor").AsBoolean().Nullable();
        }

        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
