# 4. Calculated Properties

Sometimes a property needs to return the result of a calculation rather than the value of data stored in the database. To implement this type of property there are usually a couple of different approaches.

# Properties Calculated within the Entity

When calculations are fairly straightforward and can be done without having to retrieve lots of other data from the database, then adding the calculation within the property getter is the simplest approach.

#### Example
```
    public int Age { get; set; }

    /// <summary>
    /// Specifies the remaining capacity. Calculated column based on: Capacity less SUM of all Active appointments.
    /// </summary>
    [NotMapped]
    public bool IsUnderAge
    {
        get
        {
            return Age < 18;
        }
    }
```
Note the following:

1.  `[NotMapped]` attribute needs to be added to indicate that the property should not be mapped to the database
1.  The property setter should have the `protected` modifier

# Properties Calculated by the Database
The the calculation requires access to lots of data only available from the database, the calculation should be performed by the database through a calculated column, <a href="https://database.guide/create-a-computed-column-that-uses-data-from-another-table-in-sql-server/" target="_blank">see article on computed columns</a>.

Though more complex to implement, this approach will typically have some significant advantages:

* Performance will be significantly better than retrieving the required data in the application and performing the calculation at the application level
* Centralises the calculation logic in a single place
* Calculated column is also available to reports which typically query the database directly.

Some disadvantages that implementers should take note of:

* Since the value is calculated at database level the data may get stale i.e. it will not update immediately as changes are made to the state at application level. You may need to re-query the database to refresh the entities.
* It places additional logic at the database level which make more difficult in future to port to another database platform.

## How to Implement

### Step 1 - Make the property read-only

Add the property that needs be based on a calculated value as follows. In particluar:

   1. Add `[ReadonlyProperty]` attribute to the property
   1. Make the property getter protected so that users cannot inadvertently update the property e.g. `public virtual int? RemainingCapacity { get; protected set; }`

#### Example
```
        /// <summary>
        /// Specifies the remaining capacity. Calculated column based on: Capacity less SUM of all Active appointments.
        /// </summary>
        [ReadonlyProperty]
        public virtual int? RemainingCapacity { get; protected set; }
```

### Step 2 - Create the calculated column in the database

Add the new calculated column as you would any other database object, by creating a database migrator file.

The migrator file should:

1. Create a new function that performs the required calculation.
1. Add the calculated column to the required table.

#### Example

```
    [Migration(20220303180801)]
    public class M20220303180801 : Migration
    {
        /// <summary>
        /// 
        /// </summary>
        public override void Up()
        {
            Execute.Sql(@"CREATE FUNCTION [dbo].[fn_Book_GetNumValidAppointmentsForSlot] (@SlotId uniqueidentifier)  
                RETURNS int
                AS  
                BEGIN  
                    DECLARE @AppointmentCount int;

                    SELECT @AppointmentCount = COUNT(Id)
	                FROM Fhir_Appointments app 
	                WHERE app.SlotId = @SlotId 
		                AND app.StatusLkp NOT IN (6 /*cancelled*/, 8 /*enteredInerror*/)

                    RETURN @AppointmentCount;
                END;
                GO
				
                ALTER TABLE Fhir_Slots ADD RemainingCapacity AS Capacity - dbo.fn_Book_GetNumValidAppointmentsForSlot(Id);
                GO
            ");
        }

        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
```
