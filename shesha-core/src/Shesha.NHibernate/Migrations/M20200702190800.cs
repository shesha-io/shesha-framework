using System;
using FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20200702190800)]
    public class M20200702190800 : Migration
    {
        public override void Up()
        {
            Execute.Sql(@"
CREATE FUNCTION [dbo].[Core_DistanceTo]
(
	@lat1 float,
	@lon1 float,
	@lat2 float,
	@lon2 float
)
RETURNS float
AS
BEGIN
    declare @dist float;

    if ((@lat1 = @lat2) and (@lon1 = @lon2))
    begin
        select @dist = 0;
    end
    else
    begin
        declare @rlat1 float = PI() * @lat1 / 180;
        declare @rlat2 float = PI() * @lat2 / 180;
        declare @theta float = @lon1 - @lon2;
        declare @rtheta float = PI() * @theta / 180;
        select @dist = 
			(Acos(
				Sin(@rlat1) * Sin(@rlat2) + Cos(@rlat1) * Cos(@rlat2) * Cos(@rtheta)
			) * 180 / PI()) * 60 * 1.1515 * 1.609344;
	end

	return @dist

END
");
        }

        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
