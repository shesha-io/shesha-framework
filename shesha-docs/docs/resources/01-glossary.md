# Glossary

## General

- **Host Application** - The host application is the application that gets deployed / published and which users interact with. It is made up of a number of modules.
- **Modules?? Or Package** - Modules are packaged as Nuget packages and provide certain capabilities/functionality that Host applications and other modules can build on.
- **Themes** -  The Theme is specified at the host application level and dictates the overall look & feel of the application i.e. control colours and styling.
- **Developer vs Configurator Roles** - We need to create a distinction between the Developer and Configurator roles whereby a Configurator will have a more limited capabilities than a developer.
Developers has full visibility of all configuration items / components within all the packages within the solution; a configurator has a more limited visibility based on what the developer has chosen to expose. This is to avoid exposing an overwhelming amount of detail to the configurators who may be less technically inclined. Or to hide items which may introduce security threats if used. For example, the Developer will have access / visibility of all Domain Entities and APIs from all packages imported into the Shesha solution. The Developer should be able to 'inactivate' entities and properties which he believes to be completely irrelevant (e.g. especially entities from lower level packages) so that when a configurator logs in he will only view a more relevant subset.
This would mean for most configuration items, there should be a IsVisibibleToConfigurator or Inactive property which can only be viewed and set by users with the developer role.

## User Interface

- **View** - A pre-defined UI element intended to be presented within the main active area within a Shesha application (i.e. the area enclosed by the standard header, footer and main menu).
- **Custom View** - A View created using traditional coding methods.
- **View Template** - The main types of View Templates included ‘out-of-the-box’ with Shesha are: Table View, Details View, Menu View
- **(Shesha) Package** -  Set of functionality designed to be extend the capability of a Shesha application. Packages may extend This may be at the UI (as pre, Business Logic or Domain layer.
- **Table View** - (old name Index view) A view whose primary purpose is to list objects in table format and enable searching/filtering to view details of a specific object.
- **Saved Filters** - 
- **Quickfilter** - 
- **Custom View** - 
- **Sub View** - 
- **Table Sub View** - 
- **List Sub View** - 
- **Details Sub View** - 
- **Details View** - 
- **Key Info Strip** - 
- **Quick View** - 
- **Quick Create View** - 
- **Master Details View** - 
- **Menu View** - 
- **Workflow Action View** - 
- **Workflow Initiation View** - ?? May not be useful to distinguish this from normal create view to which a workflow initiation action is triggered is attached to its 'OnCreate' event ??

## Business Logic

- **Domain** - 
- **Model** - Defines a set of entities, its attributes and relationship between entities for the purposes of storing data.
- **Database Backed Model** - A model whose data is saved in relational database and therefore which can be edited without the need for additional migrations at the DB level.
- **Dynamic Model** - A model whose data is saved in Json/document form (i.e. not in a database) and therefore which can be edited without the need for additional migrations at the DB level.
- **Entity** -
- **Property or Attribute (need to check standard language from DDD)** -
- **Entity vs Table vs Objects** -
- **Object vs Objects vs Entity record** -
- **Business Process** -
A configured instance of a Business Process Template.
Has the ability to define:
Configuration schema
Workflow state schema
A Business Process can be created from scratch or from a Business Process Template which defines 
- **Business Process Template ???** - Defines a ‘pre-packaged’ Business Process including:
Default workflow schema - The workflow (defined using BPMN notation) underlying the Business Process..
Workflow State Model - Model used to save the state of the workflow.
Business Process Settings Model - defines a schema for the BP Settings that should drive key elements the behaviour of the Business Process (these would be equivalent to workflow specific settings in SmartGov).
Business Process Settings View - the UI used to update the settings if the default auto-generated UI is not adequate
It’s not clear if we need this or we can simply define Business Process settings at a Business Process level and simply copy and paste i.e. duplicating the Business Process config, including the settings. 
- **Terminology Configuration** -
- **Configuration Panel** - View from which all configuration settings are made available.

Updated: 22 November 16:12





