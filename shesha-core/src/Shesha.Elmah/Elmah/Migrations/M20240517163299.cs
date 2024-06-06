using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Elmah.Migrations
{
    [Migration(20240517163299)]
    public class M20240517163299 : OneWayMigration
    {
        private const string schemaName = DBConstants.Schema;
        private const string errorsTable = DBConstants.ErrorsTable;
        private const string refsTable = DBConstants.ErrorRefsTable;

        public override void Up()
        {
            if (!Schema.Schema(schemaName).Exists()) 
                Execute.Sql($"create schema \"{schemaName}\"");

            if (!Schema.Schema(schemaName).Table(errorsTable).Exists()) 
            {
                IfDatabase("PostgreSql").Execute.Sql(GetPostgreSqlErrorsTableScript());
                IfDatabase("SqlServer").Execute.Sql(GetSqlServerErrorsTableScript());
            }

            if (!Schema.Schema(schemaName).Table(refsTable).Exists())
            {
                IfDatabase("PostgreSql").Execute.Sql(GetPostgreSqlErrorRefsTableScript());
                IfDatabase("SqlServer").Execute.Sql(GetSqlServerErrorRefsTableScript());
            }
        }

        #region PostgreSql

        private string GetPostgreSqlErrorsTableScript()
        {
            return $@"
CREATE SEQUENCE {schemaName}.{errorsTable}_sequence;
CREATE TABLE {schemaName}.{errorsTable}
(
    error_id	UUID NOT NULL,
    application	VARCHAR(60) NOT NULL,
    host 		VARCHAR(50) NOT NULL,
    type		VARCHAR(100) NOT NULL,
    source		VARCHAR(60)  NOT NULL,
    message		VARCHAR(500) NOT NULL,
    ""user""	VARCHAR(50)  NOT NULL,
    status_code	INT NOT NULL,
    time_utc	TIMESTAMP NOT NULL,
    sequence	INT NOT NULL DEFAULT NEXTVAL('{schemaName}.{errorsTable}_sequence'),
    all_xml		TEXT NOT NULL
);

ALTER TABLE {schemaName}.{errorsTable} ADD CONSTRAINT pk_{errorsTable} PRIMARY KEY (error_id);

CREATE INDEX ix_{errorsTable}_app_time_seq ON {schemaName}.{errorsTable} USING BTREE
(
    application   ASC,
    time_utc      DESC,
    sequence      DESC
);
";
        }

        private string GetPostgreSqlErrorRefsTableScript()
        {
            return $@"
CREATE TABLE {schemaName}.{refsTable}
(
    id	        UUID NOT NULL,
    error_id	UUID NOT NULL,
    ref_type    VARCHAR(100) NOT NULL,
    ref_id		VARCHAR(40) NOT NULL
);

CREATE INDEX ix_{refsTable}_type_id ON {schemaName}.{refsTable} USING BTREE
(
    ref_type,
    ref_id
);

ALTER TABLE {schemaName}.{refsTable} ADD CONSTRAINT pk_{refsTable} PRIMARY KEY (id);
";
        }

        #endregion

        #region Sql Server

        private string GetSqlServerErrorsTableScript()
        {
            return $@"
CREATE TABLE [{schemaName}].[{errorsTable}]
(
    [error_id]     UNIQUEIDENTIFIER NOT NULL,
    [application]  NVARCHAR(60)  NOT NULL,
    [host]         NVARCHAR(50)  NOT NULL,
    [type]         NVARCHAR(100) NOT NULL,
    [source]       NVARCHAR(60)  NOT NULL,
    [message]      NVARCHAR(MAX) NOT NULL,
    [user]         NVARCHAR(50)  NOT NULL,
    [status_code]  INT NOT NULL,
    [time_utc]     DATETIME NOT NULL,
    [sequence]     INT IDENTITY (1, 1) NOT NULL,
    [all_xml]      NVARCHAR(MAX) NOT NULL 
) 
GO

ALTER TABLE [{schemaName}].[{errorsTable}] WITH NOCHECK ADD 
    CONSTRAINT [pk_{errorsTable}] PRIMARY KEY NONCLUSTERED ([error_id]) ON [PRIMARY] 
GO

ALTER TABLE [{schemaName}].[{errorsTable}] ADD 
    CONSTRAINT [df_{errorsTable}_error_id] DEFAULT (NEWID()) FOR [error_id]
GO

CREATE NONCLUSTERED INDEX [ix_{errorsTable}_app_time_seq] ON [{schemaName}].[{errorsTable}] 
(
    [application]   ASC,
    [time_utc]      DESC,
    [sequence]      DESC
) 
ON [PRIMARY]";
        }


        private string GetSqlServerErrorRefsTableScript()
        {
            return $@"
CREATE TABLE [{schemaName}].[{refsTable}]
(
    [id]           UNIQUEIDENTIFIER NOT NULL,
    [error_id]     UNIQUEIDENTIFIER NOT NULL,
    [ref_type]     NVARCHAR(100) NOT NULL,
    [ref_id]       NVARCHAR(40)  NOT NULL
) 
GO

ALTER TABLE [{schemaName}].[{refsTable}] WITH NOCHECK ADD 
    CONSTRAINT [pk_{refsTable}] PRIMARY KEY NONCLUSTERED ([id]) ON [PRIMARY] 
GO

ALTER TABLE [{schemaName}].[{refsTable}] ADD 
    CONSTRAINT [df_{refsTable}_id] DEFAULT (NEWID()) FOR [id]
GO

CREATE NONCLUSTERED INDEX [ix_{refsTable}_type_id] ON [{schemaName}].[{refsTable}] 
(
    [ref_type],
    [ref_id]
) 
ON [PRIMARY]
GO
";
        }

        #endregion
    }
}
