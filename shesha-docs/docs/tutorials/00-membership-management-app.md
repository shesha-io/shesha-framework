# Membership Management App

For this introduction we will be building a membership management app which is designed for organisations that want to manage memberships such as political parties and schools. The tutorial is designed to teach you the basics of how building a Shesha based application works. Each step is designed to introduce you to some of the key concepts within Shesha.

NB: You will need to make sure that you have completed the [Quickstart Guide](https://shesha-docs.readthedocs.io/en/latest/guides/00-quickstart/) guide on how to get setup.

In this tutorial, you learn how to:

- Configure user roles
- Configure menus
- Configure, create and edit custom forms
- Creating and managing reference lists
- Adding a model class and database migrations
- Creating a API service
- Calling the API service from Postman
- Capturing data using our form from the admin portal
- Capturing data from a custom form the public portal
- Configuring and generating reports

At the end of this tutorial you will have a membership management app this will allow you to capture new membership details using your designed forms and saving them in your database.

## Getting Started

Run the "SheshaMMSampleAdminPortal" app that you set up in the [Quickstart Guide](https://shesha-docs.readthedocs.io/en/latest/guides/00-quickstart/) and then login. It shoulld be completely blank i.e. no menus or data in the content window.


![blank admin portal](https://github.com/Boxfusion/shesha-docs/blob/main/docs/assets/membership-management-app-1.png?raw=true)


## Configuring Your Role

Before you can get started designing your app you will need to give your self the adequate role required.

Because you have not configured any navigation you will need to go to the roles section using the direct link "/administration/roles/" so if your admin portal is running on "localhost:3050" then the link would be "localhost:3050/administration/roles/".


![roles administration](https://github.com/Boxfusion/shesha-docs/blob/main/docs/assets/membership-management-app-2.png?raw=true)


Because we will be configuring menus and changing system related configurations we will add our user "admin admin" to the "System Administrator" role. You can click on the magnifying glass icon in order to access the details view.


![system administrator role](https://github.com/Boxfusion/shesha-docs/blob/main/docs/assets/membership-management-app-3.png?raw=true)


In the "Members" pane click on the "Add" button. This will bring up a select user popup. You can double click the "System Administrator" user and this will assign the role of System Administrator to the current logged in user.

We currently only have one user in the system with the first name "Admin" and the last name "Admin". Their full name has been saved as "System Administrator" for the sake of this demo.


![select role for user](https://github.com/Boxfusion/shesha-docs/blob/main/docs/assets/membership-management-app-4.png?raw=true)



Congratulations you have now successfully assigned your user "Admin" the role required to start configuring the app


![user role list](https://github.com/Boxfusion/shesha-docs/blob/main/docs/assets/membership-management-app-5.png?raw=true)


You are now ready to move on to the next sectioin.

## Configuring the Menu

In this section we will be setting up some basic navigation menu items. Shesha already comes with a lot of built in functionality out of the box so we will be exposing some of these via the menus and also configuring some of our own custom pages and forms in the menu.

The first thing you should notice now is that since you configured the roles for your logged in user you now have access to an edit icon in the top right of the page. You will need to click this so you can start adding and editing some menu icons.

If you don't see this menu icon you will need to refresh the page.


![edit menu icon](https://github.com/Boxfusion/shesha-docs/blob/main/docs/assets/membership-management-app-6.png?raw=true)



You can click on this edit icon and it will open a pop up confirmation window asking you to "Launch Edit Mode?". You can click "Ok" from this window and this will now put the menu bar in edit mode as shown by the dashed box.


![editable menu](https://github.com/Boxfusion/shesha-docs/blob/main/docs/assets/membership-management-app-7.png?raw=true)


When you hover over the dashed box the dashes will changee from white to blue which indicate that it is selectable. You can click on the dashed box to bring up the menu customisation window.


![menu customisation](https://github.com/Boxfusion/shesha-docs/blob/main/docs/assets/membership-management-app-8.png?raw=true)


We will start of by adding the following menu items:

- Reports
- Members
- Areas
- Forms

By convention we add the "forms" navigation item in a group called "Configuration". Below are the steps for adding groups and adding items.

### Adding a Group

Click the "Add Group" button to start adding your group. This will add the group item to the menu and opens the "Properties" window on the right.

You can change the Title, Tooltip and Icon properties window with the information for the "Configuration" as shown below or to the values you prefer.


![configuration menu details](https://github.com/Boxfusion/shesha-docs/blob/main/docs/assets/membership-management-app-9.png?raw=true)


### Adding a New Item

To add your menu items click the "Add New Item" button. This will add a new menu item to the menu. You can keep the Item Type as Button but you will need to change the Title, Tooltip and Icon properties to your liking.

The only difference for these menu items is that you will need to add a button action and it's target Uri. Use the properties below to create your menus.

|               | Reports           | Members      | Areas         | Forms           |
|---------------|-------------------|--------------|---------------|-----------------|
| Item Type     | Button            | Button       | Button        | Button          |
| Title         | Reports           | Members      | Areas         | Forms           |
| Tooltips      | Reports           | Members      | Areas         | Forms           |
| Icon          | LineChartOutlined | UserOutlined | GlobeOutlined | FormOutlined    |
| Button Action | Navigate          | Navigate     | Navigate      | Navigate        |
| Target Uri    | /reports          | /members     | /areas        | /settings/forms |


![menu item details](https://github.com/Boxfusion/shesha-docs/blob/main/docs/assets/membership-management-app-10.png?raw=true)

## Editing and Ordering Menu Items

You can click on the gray handle bar of a group or menu item in order to open up its properties so you can edit them or click and drag using the gray handle bar in order to reorder or organise the menu items.

You can click the "Forms" menu item and drag it into the "Configuration" group.

Once you are done you can click "Ok" to save the menu changes. You will need to confirm the menu changes again closing the "Edit Mode" window. This will open the "Close Edit Mode" confirmation screen where you can cliick "Ok"


![completed menu](https://github.com/Boxfusion/shesha-docs/blob/main/docs/assets/membership-management-app-11.png?raw=true)

Congratulations you have successfully added your menus.