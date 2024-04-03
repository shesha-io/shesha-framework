using FluentMigrator;
using System.Data;

namespace Shesha.FluentMigrator.ReferenceLists
{
    /// <summary>
    /// ReferenceList DB provider
    /// </summary>
    internal class ReferenceListDbHelper: DbHelperBase
    {
        private readonly IQuerySchema _querySchema;        

        public ReferenceListDbHelper(IDbConnection connection, IDbTransaction transaction, IQuerySchema querySchema) : base(connection, transaction)
        {
            _querySchema = querySchema;
        }

        #region list

        internal bool IsLegacyRefListStructure()
        {
            return _querySchema.ColumnExists(null, "Frwk_ReferenceLists", "Name") && _querySchema.ColumnExists(null, "Frwk_ReferenceLists", "Namespace");
        }

        internal Guid InsertReferenceList(string @namespace, string name, string? description)
        {
            var existingId = GetReferenceListId(@namespace, name);
            if (existingId.HasValue)
                return existingId.Value;

            var id = Guid.NewGuid();
            if (IsLegacyRefListStructure())
            {
                var sql = @"INSERT INTO ""Frwk_ReferenceLists""
           (""Id""
           ,""TenantId""
           ,""Description""
           ,""Name""
           ,""Namespace""
           ,""HardLinkToApplication"")
     VALUES
           (
		   @id
           ,@tenantId
           ,@description
           ,@name
           ,@namespace
           ,@hardLinkToApplication
		   )";

                ExecuteNonQuery(sql, command =>
                {
                    command.AddParameter("@id", id);
                    command.AddParameter("@tenantId", null);
                    command.AddParameter("@description", description);
                    command.AddParameter("@name", name);
                    command.AddParameter("@namespace", @namespace);
                    command.AddParameter("@hardLinkToApplication", 0);

                });
            }
            else 
            {
                ExecuteNonQuery(@"INSERT INTO ""Frwk_ConfigurationItems""
           (""Id""
           ,""Description""
           ,""Name""
           ,""VersionNo""
           ,""VersionStatusLkp""
           ,""ItemType""
           ,""IsLast""
           ,""OriginId""
           ,""Suppress""
		   )
     VALUES
           (@id
           ,@description
           ,@fullName
           ,1
           ,3 /*Live*/
           ,'reference-list'
           ,@isLast
           ,@id
           ,@suppress
           )", command =>
                {
                    command.AddParameter("@id", id);
                    command.AddParameter("@description", description);
                    command.AddParameter("@fullName", GetFullName(@namespace, name));
                    command.AddParameter("@isLast", true);
                    command.AddParameter("@suppress", false);
                });

                ExecuteNonQuery(@"INSERT INTO ""Frwk_ReferenceLists""
           (""Id""
           ,""HardLinkToApplication""
            )
     VALUES
           (@id
           ,@hardLinkToApplication
           )", command =>
                {
                    command.AddParameter("@id", id);
                    command.AddParameter("@hardLinkToApplication", false);
                });
            }

            return id;
        }

        internal void UpdateReferenceListDescription(Guid? id, string description)
        {
            if (IsLegacyRefListStructure())
            {
                ExecuteNonQuery("update \"Frwk_ReferenceLists\" set \"Description\" = @Description where \"Id\" = @Id", command => {
                    command.AddParameter("@Description", description);
                    command.AddParameter("@Id", id);
                });
            }
            else 
            {
                var sql = @"update 
	""Frwk_ConfigurationItems""
set
	""Description"" = @Description
where
	""Id"" = @Id
    and ""ItemType"" = 'reference-list'";
                ExecuteNonQuery(sql, command => {
                    command.AddParameter("@Description", description);
                    command.AddParameter("@Id", id);
                });
            }
        }

        internal void UpdateReferenceListNoSelectionValue(Guid? id, long? value)
        {
            ExecuteNonQuery("update \"Frwk_ReferenceLists\" set \"NoSelectionValue\" = @NoSelectionValue where \"Id\" = @Id", command =>
            {
                command.AddParameter("@NoSelectionValue", value);
                command.AddParameter("@Id", id);
            });
        }

        [Obsolete]
        internal Guid? GetReferenceListId(string @namespace, string name)
        {
            if (IsLegacyRefListStructure())
            {
                return ExecuteScalar<Guid?>(@"select ""Id"" from ""Frwk_ReferenceLists"" where ""Namespace"" = @Namespace and ""Name"" = @Name", command =>
                {
                    command.AddParameter("@namespace", @namespace);
                    command.AddParameter("@name", name);
                });
            }
            else {
                var sql = @"select 
	ci.""Id"" 
from 
	""Frwk_ReferenceLists"" rl
	inner join ""Frwk_ConfigurationItems"" ci on ci.""Id"" = rl.""Id""
where 
	ci.""Name"" = @FullName
	and ci.""IsLast"" = @isLast";

                return ExecuteScalar<Guid?>(sql, command =>
                {
                    command.AddParameter("@fullName", GetFullName(@namespace, name));
                    command.AddParameter("@isLast", true);                    
                });
            }            
        }

        private string GetFullName(string @namespace, string name) 
        {
            return !string.IsNullOrWhiteSpace(@namespace)
                ? $"{@namespace}.{name}"
                : name;
        }

        internal void DeleteReferenceList(string @namespace, string name)
        {
            if (IsLegacyRefListStructure())
            {
                ExecuteNonQuery(@"delete from ""Frwk_ReferenceLists"" where ""Namespace"" = @Namespace and ""Name"" = @Name",
                    command =>
                    {
                        command.AddParameter("@namespace", @namespace);
                        command.AddParameter("@name", name);
                    }
                );
            }
            else 
            {
                // delete items if any
                ExecuteNonQuery(@"update 
	""Frwk_ReferenceListItems"" 
set
	""ParentId"" = null
where 
	""ReferenceListId"" in (
		select 
			rl.Id 
		from 
			""Frwk_ReferenceLists"" rl
			inner join ""Frwk_ConfigurationItems"" ci on ci.""Id"" = rl.""Id"" and ci.""Name"" = @FullName
	)",
                    command => {
                        command.AddParameter("@fullName", GetFullName(@namespace, name));
                    }
                );

                ExecuteNonQuery(@"delete from ""Frwk_ReferenceListItems"" where ""ReferenceListId"" in (
	select 
		rl.""Id"" 
	from 
		""Frwk_ReferenceLists"" rl
		inner join ""Frwk_ConfigurationItems"" ci on ci.""Id"" = rl.""Id"" and ci.""Name"" = @FullName
)",
                    command => {
                        command.AddParameter("@fullName", GetFullName(@namespace, name));
                    }
                );

                ExecuteNonQuery(@"delete 
from 
	""Frwk_ReferenceLists"" 
where 
	""Id"" in (
		select 
			rl.""Id"" 
		from 
			""Frwk_ReferenceLists"" rl
			inner join ""Frwk_ConfigurationItems"" ci on ci.""Id"" = rl.""Id"" and ci.""Name"" = @FullName
	)",
                    command => {
                        command.AddParameter("@fullName", GetFullName(@namespace, name));
                    }
                );

                ExecuteNonQuery(@"delete 
from 
	""Frwk_ConfigurationItems""
where 
	""Name"" = @FullName
	and ""ItemType"" = 'reference-list'",
                    command => {
                        command.AddParameter("@fullName", GetFullName(@namespace, name));
                    }
                );
            }
        }

        #endregion

        #region list items

        internal Guid InsertReferenceListItem(Guid refListId, ReferenceListItemDefinition item)
        {
            var id = Guid.NewGuid();
            var sql = @"INSERT INTO ""Frwk_ReferenceListItems""
           (""Id""
           ,""TenantId""
           ,""Description""
           ,""HardLinkToApplication""
           ,""Item""
           ,""ItemValue""
           ,""OrderIndex""
           ,""ParentId""
           ,""ReferenceListId"")
     VALUES
           (@Id
           ,@TenantId
           ,@Description
           ,@HardLinkToApplication
           ,@Item
           ,@ItemValue
           ,@OrderIndex
           ,@ParentId
           ,@ReferenceListId)";

            ExecuteNonQuery(sql, command => {
                command.AddParameter("@Id", id);
                command.AddParameter("@TenantId", null);
                command.AddParameter("@Description", item.Description);
                command.AddParameter("@HardLinkToApplication", false);
                command.AddParameter("@Item", item.Item);
                command.AddParameter("@ItemValue", item.ItemValue);
                command.AddParameter("@OrderIndex", item.OrderIndex ?? item.ItemValue);
                command.AddParameter("@ParentId", null);
                command.AddParameter("@ReferenceListId", refListId);
            });

            return id;
        }

        internal void DeleteReferenceListItems(string @namespace, string name)
        {
            var id = GetReferenceListId(@namespace, name);
            if (id == null)
                return;

            ExecuteNonQuery(@"delete from Frwk_ReferenceListItems where ReferenceListId = @ReferenceListId",
                command => {
                    command.AddParameter("@ReferenceListId", id);
                }
            );
        }

        internal void DeleteReferenceListItem(string @namespace, string name, Int64 itemValue)
        {
            var id = GetReferenceListId(@namespace, name);
            if (id == null)
                return;

            ExecuteNonQuery(@"delete from Frwk_ReferenceListItems where ReferenceListId = @ReferenceListId and ItemValue = @ItemValue",
                command => {
                    command.AddParameter("@ReferenceListId", id);
                    command.AddParameter("@ItemValue", itemValue);
                }
            );
        }

        internal Guid? GetReferenceListItemId(Guid listId, Int64 itemValue)
        {
            return ExecuteScalar<Guid?>(@"select Id from Frwk_ReferenceListItems where ReferenceListId = @Id and ItemValue = @ItemValue", command => {
                command.AddParameter("@Id", listId);
                command.AddParameter("@ItemValue", itemValue);
            });
        }

        internal void UpdateReferenceListItemText(Guid? id, string itemText)
        {
            ExecuteNonQuery("update Frwk_ReferenceListItems set Item = @Item where Id = @Id", command => {
                command.AddParameter("@Item", itemText);
                command.AddParameter("@Id", id);
            });
        }

        internal void UpdateReferenceListItemDescription(Guid? id, string description)
        {
            ExecuteNonQuery("update Frwk_ReferenceListItems set Description = @Description where Id = @Id", command => {
                command.AddParameter("@Description", description);
                command.AddParameter("@Id", id);
            });
        }

        internal void UpdateReferenceListItemOrderIndex(Guid? id, long orderIndex)
        {
            ExecuteNonQuery("update Frwk_ReferenceListItems set OrderIndex = @OrderIndex where Id = @Id", command => {
                command.AddParameter("@OrderIndex", orderIndex);
                command.AddParameter("@Id", id);
            });
        }

        #endregion
    }
}
