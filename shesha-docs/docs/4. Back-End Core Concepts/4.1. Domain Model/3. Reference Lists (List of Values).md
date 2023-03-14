# 3. Reference Lists (List of Values)

A Reference List (sometimes referred to elsewhere as Lookup values, or List of Values) refers to a standard list of values usually displayed to end-users as dropdown lists (e.g. **Titles**: Mr, Mrs, Miss, etc...; **Gender**: Male, Female; **Colour**: Red,Blue, etc...).

If an Entity's property is expected to only accept a standard list of values, a Reference List should be used. 

For efficiency and maintainability reasons, properties that store a selection from a Reference List, will store the selected item as an integer, rather than the text value of the items selected. That is why a Reference List Entity properties are usually either of type `enum` or `long`.

## When to use Code-based (enum) vs Data based (long) Reference Lists?

### Code-based (enum) Reference Lists
For reference lists that are not expected to change **ever**, for example, 'Days Of The Week' or 'Gender', an enum should be used.

#### Implementation Steps:

1. Add the `[ReferenceList]` attribute to the property you wish to use a reference list for
1. Create a new enum to define the list of possible values. For consistency the enum name should be prefixed with `RefList`
1. Make sure the Reference List property's type is the newly created enum
1.If the item is alphanumeric e.g "Stage 1" instead of pulling it as "Stage1" from the backend, the [Display(Name = "Stage 1")] attribute gives the user flexibility to write these items as readable text.
#### Example
```
public class Person
{
   ...
   [ReferenceList("MyModuleName", "Gender")]
   public RefListDaysOfTheWeek Gender { get; set; } 
   ...
}
```
where
```
[ReferenceList("MyModule", "Gender")]
public enum RefListGender: long
{
    [Description("This is for a dude")]
    [Display(Name = "This is for a dude")]
    Male = 1,

    [Description("This is for a lady")]
    [Display(Name = "This is for a lady")]
    Female = 2
}
```

**Important Note:** Shesha automatically looks for all enums with the `ReferenceList` attribute and creates the equivalent values in the database during the start-up process. For this reason, it is not necessary to create the values manually through DB Migrator classes. Additionally, if you attempt to update the list of values through the administration views or directly in the database, changes will get undone by Shesha through this automated synching process.

### Data-Based Reference List 
If the values of a Reference List are expected to change in the future perhaps to allow future customisation for clients or evolving needs, a Data-Driven reference list should be used.

#### Implementation Steps:

1. Add the `[ReferenceList]` attribute to the property you wish to use a reference list for
1. Ensure the property is of type `long?` (`int` and `short` will also usually do)
1. Add Database Migration script to load the list in the database

#### Example
```
public class Person
{
   ...
   [ReferenceList("MyModuleName", "Location")]
   public long? Location { get; set; } 
   ...
}
```
Because the list is data-driven to remain flexible, the list will be defined in the database (in the `Frwk_ReferenceLists` and `Frwk_RefrenceListItems` tables) instead of being hard-coded as an enum.

The add a reference list to the database create a Database migration class as follows:
```
    [Migration(20220317111700)]
    public class M20220317111700 : Migration
    {
        public override void Down()
        {
            throw new NotImplementedException();
        }

        public override void Up()
        {
            /* add reflist */
            this.Shesha().ReferenceListCreate("Shesha", "TestStatuses")
                .SetDescription("Lorem ipsum") // set desctiption
                .SetNoSelectionValue(1) // set noselection value
                .AddItem(1, "Status 1") // add item
                .AddItem(2, "Status 2", 2, "Status 2 description")
                .AddItem(3, "Status 3");

            // update reflist
            this.Shesha().ReferenceListUpdate("Shesha", "TestStatuses")
                .SetDescription("New reflist description")
                .SetNoSelectionValue(1)
                .DeleteItem(1) // delete item
                .UpdateItem(2, i => i.SetItemText("New item text").SetDescription("New item description").SetOrderIndex(100)) // update item
                .AddItem(5, "Status 5", 0, "Status 5 description"); // add new item

            this.Shesha().ReferenceListUpdate("Shesha", "TestStatuses")
                .DeleteAllItems(); // delete all items

            /* delete reflist */
            this.Shesha().ReferenceListDelete("Shesha", "TestStatuses");
        }
    }
```

# Multi-Value Reference Lists
A basic limitation of a regular Reference List property is that it can only store a single selection from the list at once. Sometimes, it is desirable to store more than one selected item at the same time. If the list of possible options has 64 items or less, it is possible to use **Multi-value Reference Lists** to support this requirement.
(if you are interested in understanding how multiple values can get stored as a single number <a href="https://www.alanzucconi.com/2015/07/26/enum-flags-and-bitwise-operators/" target="_blank">this article</a> may be helpful)

### Example

To implement a Multi-value reference list:

* Add the `MultiValueReferenceList` attribute to the entity property in question
* Make sure that the property is of type `long?` or a `enum` (depending whether you want the list of possible values to be flexible or fixed respectively
* Define your reference list items and ensure items are assigned values that are powers of two (e.g. 1, 2, 4, 8, 16, etc...)
* Ensure that there are **no more than 64 items** in the list
#### Example on Entity Class
```
[MultiValueReferenceList("MyApp","DaysOfTheWeek")]
property RefListDaysOfTheWeek DaysOpen { get; set; }
```
#### Example for enum based reference list
```
[RefrenceList("MyApp","DaysOfTheWeek")]
[Flags]  \\ For multi-value ref list enums ensure the [Flags] attribute is added 
public enum RefListDaysOfTheWeek
{
    None = 0,
    Monday = 1,
    Tuesday = 2,
    Wednesday = 4,
    Thursday = 8,
    Friday = 16,
    Saturday = 32,
    Sunday = 64,
}
```


## Useful functions for working with Multi-value reference lists
if you include the `Shesha.Extensions` namespace you will have access to a couple of useful extension functions useful for working with multi-value reference lists.

```
using Shesha.Extensions

....

// Returns a comma separated list of Reference List Item referenced by the property.
var res = myEntity.GetMultiValueReferenceListItemNames("MyMultiValProperty");


// Returns an string array listing all the items selected.
var res = myEntity.GetMultiValueReferenceListItemNamesAr
("MyMultiValProperty");
...
```


