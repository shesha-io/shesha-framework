using System;
using FluentMigrator;

namespace Shesha.Migrations
{
	[Migration(20200306132400)]
    public class M20200306132400: Migration
    {
        public override void Up()
        {
            Execute.Sql(
@"create view vw_Core_AreasHierarchyItems
as
WITH x AS
(
    -- anchor:
    SELECT 
		ID, 
		name, 
		ParentAreaId, 
		[level] = 1,
		eu.AreaTypeLkp
    FROM 
		Core_Areas eu
	WHERE 
		eu.ParentAreaId IS NULL
		and eu.IsDeleted = 0
		and eu.Frwk_Discriminator='Core.Area'
    UNION ALL
    -- recursive:
    SELECT 
		eu.ID, 
		eu.name, 
		eu.ParentAreaId, 
		[level] = x.[level] + 1,
		eu.AreaTypeLkp
    FROM 
		x 
		INNER JOIN Core_Areas eu
    ON eu.ParentAreaId = x.ID and eu.IsDeleted = 0
), x2 as (
	SELECT 
		ID,
		Id as AncestorId, 
		name, 
		level,
		AreaTypeLkp
    FROM 
		x
	UNION ALL
	-- recursive:
	select 
		eu.Id, 
		x2.AncestorId, 
		eu.Name,
		x2.level,
		eu.AreaTypeLkp
	from 
		x2
		join x eu on eu.ParentAreaId = x2.id
), x3 as (
	select 
		* 
	from 
		x2 
	where
		(id <> AncestorId)
		or (exists (select 1 from Core_Areas where id = x2.id and ParentAreaId is null))
)
select 
	cast(Id as varchar(40)) + '_' + cast(AncestorId as varchar(40)) as Id,
	Id as AreaId, 
	AncestorId, 
	Name,
	level,
	AreaTypeLkp
from 
	x3");
        }

        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
