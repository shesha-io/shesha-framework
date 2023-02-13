using System;
using FluentMigrator;

namespace Shesha.NHibernate.Migrations
{
    [Migration(20200724124600)]
    public class M20200724124600: Migration
    {
        public override void Up()
        {
            Execute.Sql(
@"alter table Core_Addresses add FullAddress as 
	stuff(
		coalesce(', ' + AddressLine1, '') + 
		coalesce(', ' + AddressLine2, '') + 
		coalesce(', ' + AddressLine3, '') + 
		coalesce(', ' + Suburb, '') + 
		coalesce(', ' + Town, '') + 
		coalesce(', ' + POBox, '') + 
		coalesce(', ' + (case when coalesce(Longitude, 0) <> 0 and coalesce(Latitude, 0) <> 0 then '(' + format(Longitude, '#.#####') + ', ' + format(Latitude, '#.#####') +  ')' else null end), '')
	, 1, 2, '')");
        }

        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
