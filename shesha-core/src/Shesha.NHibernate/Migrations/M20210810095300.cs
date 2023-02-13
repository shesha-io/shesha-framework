using FluentMigrator;
using Shesha.FluentMigrator;
using System;
using System.Collections.Generic;
using System.Text;

namespace Shesha.Migrations
{
    [Migration(20210810095300)]
    public class M20210810095300 : AutoReversingMigration
    {
        public override void Up()
        {
            Create.Table("Core_Persons_Languages")
                .WithForeignKeyColumn("PersonId", "Core_Persons").NotNullable()
                .WithForeignKeyColumnInt("LanguageId", "AbpLanguages").NotNullable();

            Create.PrimaryKey("PK_Core_Persons_Languages").OnTable("Core_Persons_Languages").Columns("PersonId", "LanguageId");
        }
    }
}
