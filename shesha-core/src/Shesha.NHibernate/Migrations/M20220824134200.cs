using FluentMigrator;
using Shesha.FluentMigrator;
using System;
using System.Collections.Generic;
using System.Text;

namespace Shesha.Migrations
{
    [Migration(20220824134200)]
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