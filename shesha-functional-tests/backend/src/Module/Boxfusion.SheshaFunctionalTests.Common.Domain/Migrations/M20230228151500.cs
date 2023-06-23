using FluentMigrator;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Migrations
{
    [Migration(20230228151500), MsSqlOnly]
    public class M20230228151500 : Migration
    {
        public override void Down()
        {
            throw new NotImplementedException();
        }

        public override void Up()
        {
            Alter.Table("SheshaFunctionalTests_TestClasses")
                .AddColumn("SomeGenericPropId").AsCustom("nvarchar(100)").Nullable()
                .AddColumn("SomeGenericPropDisplayName").AsCustom("nvarchar(1000)").Nullable()
                .AddColumn("SomeGenericPropClassName").AsCustom("nvarchar(1000)").Nullable()
                .AddColumn("SomeJsonAddressProp").AsCustom("nvarchar(max)").Nullable();
        }
    }
}
