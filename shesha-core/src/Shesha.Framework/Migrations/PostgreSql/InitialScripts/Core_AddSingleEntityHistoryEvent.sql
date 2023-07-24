CREATE OR REPLACE PROCEDURE public."Core_AddSingleEntityHistoryEvent"(
	IN "changeTime" timestamp without time zone,
	IN reason character varying,
	IN "tenantId" integer,
	IN "userId" integer,
	IN "changeType" smallint,
	IN "entityId" character varying,
	IN "entityTypeFullName" character varying,
	IN "propertyName" character varying,
	IN "propertyTypeFullName" character varying,
	IN "newValue" character varying,
	IN "oldValue" character varying,
	IN description character varying)
LANGUAGE 'plpgsql'
AS $BODY$
declare
	changes "Core_EntityHistoryItem";     -- Typed table we created.
begin 
	
    INSERT INTO "Core_EntityHistoryItems" ("ChangeType", "EntityId", "EntityTypeFullName", "PropertyName", "PropertyTypeFullName", "NewValue", "OldValue", "Description")
    values ("changeType", "entityId", "entityTypeFullName", "propertyName", "propertyTypeFullName", "newValue", "oldValue", "description");

	

	call "Core_AddEntityHistoryEvents" 
	(
		"changeTime", 
		"reason", 
		"tenantId", 
		"userId",
		array[row("changeType", "entityId", "entityTypeFullName", "propertyName", "propertyTypeFullName", "newValue", "oldValue", "description")]::"Core_EntityHistoryItem"[]
	);
	
	
end
$BODY$;
