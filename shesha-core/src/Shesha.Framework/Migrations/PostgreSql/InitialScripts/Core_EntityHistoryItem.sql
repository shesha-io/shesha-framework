CREATE TYPE public."Core_EntityHistoryItem" AS
(
	"ChangeType" smallint,
	"EntityId" character varying(48),
	"EntityTypeFullName" character varying(192),
	"PropertyName" character varying(96),
	"PropertyTypeFullName" character varying(256),
	"NewValue" character varying(512),
	"OldValue" character varying(512),
	"Description" character varying(512)
);
