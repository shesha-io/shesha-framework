using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.Framework
{
    [Migration(20220909141899), MsSqlOnly]
    public class M20220909141899 : OneWayMigration
    {
        public override void Up()
        {
			Execute.Sql(@"delete from Frwk_FormConfigurations"); // tables should be empty before this delete, it used for debug only
			Execute.Sql(@"delete from Frwk_ConfigurationItems"); 

            Create.Table("tmp_ConfigurationItems")
                .WithColumn("id").AsGuid()
                .WithColumn("versionNo").AsInt32()
                .WithColumn("statusLkp").AsInt32()
                .WithColumn("path").AsString(300);

            Execute.Sql(
@"declare @path varchar(300);
declare pathsCursor cursor for
select 
	distinct path
from 
	Frwk_ConfigurableComponents
where
	Frwk_Discriminator = 'Shesha.Framework.Form'
	and IsDeleted = 0
	and path is not null

open pathsCursor;
fetch next from pathsCursor into @path

WHILE @@FETCH_STATUS = 0   
BEGIN   
	-- fetch last versions one by one to get the same result as in legacy version
	insert into 
		tmp_ConfigurationItems
		(id, versionNo, statusLkp, path) 
	select 
		id,
		-1,
		3 /*live*/,
		path
    from
        Frwk_ConfigurableComponents
    where
        IsDeleted = 0
        and Frwk_Discriminator='Shesha.Framework.Form' 
        and Path=@path
    ORDER BY
        CURRENT_TIMESTAMP OFFSET 0 ROWS FETCH FIRST 1 ROWS ONLY;

	fetch next from pathsCursor into @path
END   

close pathsCursor   
deallocate pathsCursor");

            Execute.Sql(
@"with data as (
	select 
		id,
		Path,
		ROW_NUMBER() over (partition by path order by CreationTime) as VersionNo
	from
		Frwk_ConfigurableComponents cc
	where
		Frwk_Discriminator = 'Shesha.Framework.Form'
		and IsDeleted = 0
		and path is not null
		and not exists (select 1 from tmp_ConfigurationItems where Id = cc.Id)
)
insert into 
	tmp_ConfigurationItems
	(id, versionNo, statusLkp, path) 
select 
	id,
	VersionNo,
	5 /*retired*/,
	path
from
	data;");

			Execute.Sql(
@"update 
	tmp_ConfigurationItems 
set 
	versionNo = coalesce((select max(VersionNo) from tmp_ConfigurationItems t where t.Path = tmp_ConfigurationItems.Path and t.Id <> tmp_ConfigurationItems.Id), 0) + 1
where
	versionNo = -1");
			
			Execute.Sql(
@"insert into 
	Frwk_ConfigurationItems
(
	Id
	,CreationTime
	,CreatorUserId
	,LastModificationTime
	,LastModifierUserId
	,IsDeleted
	,DeletionTime
	,DeleterUserId
	,TenantId
	,Description
	,Name
	,Label
	,VersionNo
	,VersionStatusLkp
	,BaseItemId
	,CreatedByImportId
	,ModuleId
	,ParentVersionId
	,ItemType
	,IsLast
)
select 
	cc.Id
	,CreationTime
	,CreatorUserId
	,LastModificationTime
	,LastModifierUserId
	,IsDeleted
	,DeletionTime
	,DeleterUserId
	,null
	,Description
	,cc.Path
	,Name
	,tmp.versionNo
	,tmp.statusLkp
	,null
	,null
	,null
	,null
	,'form'
	,1
from 
	Frwk_ConfigurableComponents cc
	inner join tmp_ConfigurationItems tmp on tmp.Id = cc.Id
where
	Frwk_Discriminator = 'Shesha.Framework.Form'");

			Execute.Sql(
@"insert into
	Frwk_FormConfigurations
(
	Id
	,Markup
	,ModelType
	,Type	
)
select
	cc.Id
	,cc.Settings
	,cc.ModelType
	,cc.Type
from 
	Frwk_ConfigurableComponents cc
	inner join tmp_ConfigurationItems tmp on tmp.Id = cc.Id
where
	Frwk_Discriminator = 'Shesha.Framework.Form'
	and not exists (
		select 1 from Frwk_FormConfigurations where Id = cc.Id
	)");

            Delete.Table("tmp_ConfigurationItems");
		}
	}
}
