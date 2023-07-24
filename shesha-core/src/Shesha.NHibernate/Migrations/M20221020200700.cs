using FluentMigrator;
using Shesha.FluentMigrator;
using System;
using System.Collections.Generic;
using System.Text;

namespace Shesha.Migrations.Framework
{
    [Migration(20221020200700), MsSqlOnly]
    public class M20221020200700 : Migration
    {
        public override void Up()
        {
            // Shesha.Domain.SecurityQuestion
            Create.Table("Core_SecurityQuestions")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithTenantIdAsNullable()
                .WithColumn("Question").AsString(2000).NotNullable();

            // Shesha.Domain.QuestionAssignment
            Create.Table("Core_QuestionAssignments")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithTenantIdAsNullable()
                .WithColumn("Answer").AsString(500).NotNullable()
                .WithForeignKeyColumn("SelectedQuestionId", "Core_SecurityQuestions")
                .WithForeignKeyColumnInt64("UserId", "AbpUsers");
        }

        public override void Down()
        {
            throw new NotImplementedException();
        }

    }
}