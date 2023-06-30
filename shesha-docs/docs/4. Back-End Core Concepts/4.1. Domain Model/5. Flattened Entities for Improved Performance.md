# 5. Flattened Entities for Improved Performance

Performance issues can commonly occur on Table Views due to <a href="https://stackoverflow.com/questions/97197/what-is-the-n1-selects-problem-in-orm-object-relational-mapping" target="_blank">the 'N + 1' problem</a>.

The best way to address this is bind the Table that needs to be optimised to a 'flattened' version of the entity you wish to display in the table. Flattened entities map onto a database views that join in all the data you wish to display in the table at the database level so that all the required data can be retrieved using a single call to the database rather than a large number of calls from the application. 

The naming convention for 'flattened' entities is `Flattened{entity name}` e.g. `FlattenedCustomer`.

**Note:** Because Flattened entities map onto database views rather than tables, they should not be used for update or create operations. For those operations the original 'unflattened' version of the entity should be used.

# How to Implement

## Step 1 - Create a Database View

1. Create a database view that joins in the relevant tables to avoid the N+1 effect
  1. The normal naming convention to follow is as follows `vw_{Module DB Prefix}_Flattened{Entity name plural}` e.g. `vw_His_FlattenedAppointments`
1. Create the Migrator class to enable easy deployment of the DB view in all environments


#### Example
```
    [Migration(20220306151900)]
    public class M20220306151900 : Migration
    {
        /// <summary>
        /// 
        /// </summary>
        public override void Up()
        {
            Execute.Sql(@"
		CREATE OR ALTER VIEW [dbo].[vw_His_FlattenedAppointments]
			AS
				SELECT 
					  appointment.Id         /* HINT: Make sure you still return the Id of the main Entity */
					, appointment.RefNumber
					, appointment.[StartTime] 
					, appointment.[EndTime] 
					, appointment.StatusLkp
					, dbo.Frwk_GetRefListItem('Fhir', 'AppointmentStatuses', app.StatusLkp) [StatusText]  /* HINT: Use utility functions to translate Reference Lists items if necessary. Rename the column with `Text` suffix */
					, patient.Id PatientId  /* HINT: Make sure the Id for joined in entities is returned */
					, patient.[FullName] PatientFullName
					, patient.[IdentityNumber] PatientIdentityNumber
					, patient.[Fhir_PermitNumber] PatientPermitNumber
				FROM 
                                        Fhir_Appointments appointment
					LEFT JOIN Core_Persons patient ON patient.Id = appointment.PatientId  /* HINT: Join in all the tables required to reduce th N+1 effect */
				WHERE
					per.Frwk_Discriminator = 'His.HisPatient'
					AND patient.IsDeleted = 0         /* HINT: Remember to exclude any records marked as deleted */
                GO
            ");
        }

        /// <summary>
        /// 
        /// </summary>
        public override void Down()
        {
            throw new NotImplementedException();
        }

    }
```


## Step 2 - Create a new Entity Class

1. Create a new Entity class following the naming convention `Flattened{normal entity name}` e.g. an optimised version of the `Customer` entity should be called `FlattenedCustomer` to reflect the fact that all properties referenced by the entity have gotten 'flattened' into a single entity.
1. This class is part of the domain and should be placed in the same folder as other entity classes

#### Example
```
    [Table("vw_His_FlattenedAppointments")]
    [ImMutable]    // Indicates that the ORM should not attempt to update the database
    public class FlattenedAppointment: Entity<Guid>
    {
        public virtual string RefNumber { get; protected set; }     // Hint: Make the setters protected so not editable

        public virtual DateTime StartTime { get; protected set; }

        public virtual DateTime EndTime { get; protected set; }

        [ReferenceList("Booking", "AppointmentStatus")]
        public virtual long? Status { get; protected set; }

        public virtual string StatusText { get; protected set; }

        public virtual Guid PatientId { get; protected set; }

        public virtual string PatientFullName { get; protected set; }

        public virtual string PatientIdentityNumber { get; protected set; }

        public virtual string PatientPermitNumber { get; protected set; }
    }
```

## Step 3 - Consume the Flattened Entity
You should now be able to bind to the Entity from a Table view just like any other entity.
Note, that Flattened entities are read-only and cannot be used to edit values.
