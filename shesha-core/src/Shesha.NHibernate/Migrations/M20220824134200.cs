using FluentMigrator;
using Shesha.FluentMigrator;
using System;

namespace Shesha.Migrations
{
    [Migration(20220824134200), MsSqlOnly]
    public class M20220824134200 : Migration
    {
        public override void Up()
        {
            this.Shesha().ReferenceListCreate("Shesha", "NoteType");
        }
        public override void Down()
        {
            throw new NotImplementedException();
        }

    }
}