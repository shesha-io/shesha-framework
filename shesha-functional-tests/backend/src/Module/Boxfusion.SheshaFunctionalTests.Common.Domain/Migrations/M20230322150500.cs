﻿using FluentMigrator;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Migrations
{
    [Migration(20230322150500)]
    public class M20230322150500 : AutoReversingMigration
    {
        public override void Up()
        {
            Alter.Table("Core_Persons")
                .AddColumn("SheshaFunctionalTests_ProvinceLkp").AsInt64().Nullable()
                .AddColumn("SheshaFunctionalTests_ReligionLkp").AsInt64().Nullable()
                .AddColumn("SheshaFunctionalTests_EducationLevelLkp").AsInt64().Nullable()
                .AddColumn("SheshaFunctionalTests_MaritalStatusLkp").AsInt64().Nullable();
        }
    }
}
