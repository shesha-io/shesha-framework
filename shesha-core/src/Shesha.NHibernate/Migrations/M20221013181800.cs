using FluentMigrator;
using Shesha.FluentMigrator;
using System;
using System.Collections.Generic;
using System.Text;

namespace Shesha.Migrations.Framework
{
    [Migration(20221013181800), MsSqlOnly]
    public class M20221013181800 : Migration
    {
        public override void Up()
        {
            if (!Schema.Table("AbpUsers").Column("SecurityQuestionStatusLkp").Exists())
            {
                Alter.Table("AbpUsers")
                .AddColumn("SecurityQuestionStatusLkp").AsInt64().Nullable();
            }

            if (!Schema.Table("AbpUsers").Column("ChangePasswordOnNextLogin").Exists())
            {
                Alter.Table("AbpUsers")
                .AddColumn("ChangePasswordOnNextLogin").AsBoolean().Nullable();
            }

            if (!Schema.Table("AbpUsers").Column("PasswordResetTokenExpiryTime").Exists())
            {
                Alter.Table("AbpUsers")
                .AddColumn("PasswordResetTokenExpiryTime").AsDateTime().Nullable();
            }

            if (!Schema.Table("AbpUsers").Column("SupportedPasswordResetMethodsLkp").Exists())
            {
                Alter.Table("AbpUsers")
                .AddColumn("SupportedPasswordResetMethodsLkp").AsInt64().Nullable();
            }
        }

        public override void Down()
        {
            throw new NotImplementedException();
        }

    }
}