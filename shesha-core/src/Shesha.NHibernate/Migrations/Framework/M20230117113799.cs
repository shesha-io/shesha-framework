using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.Framework
{
    [Migration(20230117113799), MsSqlOnly]
    public class M20230117113799 : OneWayMigration
    {
        public override void Up()
        {
            Execute.Sql(@"create or alter view vw_Core_ReferenceListItemValues as 
select
    m.Name as Module,
    ci.Name,
    item.Item,
    item.ItemValue
from
    Frwk_ReferenceLists list
    inner join Frwk_ConfigurationItems ci on ci.Id = list.Id and ci.VersionStatusLkp = 3 /*Live*/
    left join Frwk_Modules m on m.Id = ci.ModuleId
    inner join Frwk_ReferenceListItems item on item.ReferenceListId = list.Id and item.IsDeleted = 0
where
    ci.IsDeleted = 0");


            Execute.Sql("drop view  if exists vw_Frwk_FlatReferenceListItems");

            Execute.Sql(
@"create or alter function Frwk_GetRefListItem
(
    @RefListNamespace               varchar(255),
    @RefListName                    varchar(255),                   -- The Id of the Reference List to use for the lookup
    @RefListItemValue               int                             -- The Value of the Item to whose name should be returned
)
RETURNS varchar(255)
AS
BEGIN
    DECLARE @RetVal                 varchar(255)
    IF (@RefListItemValue IS NULL)
        SET @RetVal = ''
    ELSE
    BEGIN
        SELECT
            @RetVal = Item
            FROM
                Frwk_ReferenceListItems item
                inner join Frwk_ReferenceLists list on list.Id = item.ReferenceListId
                inner join Frwk_ConfigurationItems ci on ci.Id = list.Id
            WHERE
                ItemValue = @RefListItemValue
                and ci.VersionStatusLkp = 3 /*Live*/
                and ci.Name = coalesce(@RefListNamespace + '.', '') + @RefListName
        IF (@RetVal IS NULL)
            SET @RetVal = 'INVALID';
    END
    RETURN @RetVal
END");
        }
    }
}
