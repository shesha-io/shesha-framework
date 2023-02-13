# Quickstart Guide

This quickstart guide will help you get setup with Shesha. The starter projects are the best way to get your self started building Shesha apps.

## Requirements

Before you can get started you will need to make sure that you have the following development tools installed on your machine.

- **Database:** Microsoft SQL Server Management Studio v18.10, Microsoft SQL Server 2019
- **Backend:** Microsoft Visual Studio, .NET Core
- **Admin and Public Portals:** Visual Studio Code, NodeJS, Python, Sass

## Downloading The Artifacts

This step will show you how you can download all the repositories you'll need to get Shesha up and running. You can click the following link in order to download the required artifacts.

[Download SheshaArtifacts.zip](https://github.com/Boxfusion/shesha-docs/blob/e9e08dffa636792399f740c141b402c60c11b839/docs/assets/SheshaArtifacts.zip)

![download link](https://github.com/Boxfusion/shesha-docs/blob/main/docs/assets/shesha-artifacts-download-link.png?raw=true)

The link should include the following files or folders:

- Shesha.bak (Database)
- SheshaMMSampleAdminPortal (Admin Portal)
- SheshaMMSampleBackend (Backend)
- SheshaMMSamplePublicPortal (Public Portall)

## Setting Up The Database

Once you have downloaded the artifacts you can start by restoring the provided database that your portal apps can connect to. In this instance we are going to be using Microsoft SQL Server Management Studio v18.10.

This guide will not be showing you how to install Microsoft SQL Server Management Studio v18.10 or how to create a server instance that you can connect to as it is beyond the scope of this tutorial.

- Open up Microsoft SQL Server Management Studio and Connect to a Server 

![step 1: setting up the database](https://github.com/Boxfusion/shesha-docs/blob/main/docs/assets/setting-up-the-database-1.png?raw=true)

- Right click the "Databases" node and select "Restore Database" 

![step 2: setting up the database](https://github.com/Boxfusion/shesha-docs/blob/main/docs/assets/setting-up-the-database-2.png?raw=true)

- Select "Device" from your source tabe and locate the "Shesha.bak" file by clicking the "Add" button. You might need to place the backup direcly on your C drive if you are having issues locating it due to permissions. 

![step 3: setting up the database](https://github.com/Boxfusion/shesha-docs/blob/main/docs/assets/setting-up-the-database-3.png?raw=true)

- Once you have added the backup you can click "Verify Backup Media" and once all is set you can click the "OK" button to complete the import 

![step 4: setting up the database](https://github.com/Boxfusion/shesha-docs/blob/main/docs/assets/setting-up-the-database-4.png?raw=true)

## Setting Up The Backend

Now that you have successfully backed up the database we will be configuring and setting up the backend APIs so that you can start making calls to and from your database.

We will be using Visual Studio 2019 Enterprise in this tutorial to configure the backend. Any version of Visual Studio should work as long as you have the .NET core tools for development installed.

The first thing you will need to do is locate the "SheshaMMSampleBackend" folder where your sample backend application is kept and open up the solution by double clicking the "Shesha.Sample.sln" file.

![step 1: setting up the backend](https://github.com/Boxfusion/shesha-docs/blob/main/docs/assets/setting-up-the-backend-1.png?raw=true)

Before you continue make sure that you have selected the "Shesha.Sample.Web.Host" project as the start up project. You can do this by right clicking the "Shesha.Sample.Web.Host" project and selecting "Set as Startup Project".

![step 2: setting up the backend](https://github.com/Boxfusion/shesha-docs/blob/main/docs/assets/setting-up-the-backend-2.png?raw=true)

Before you can run the backend application you will need to make sure that it is pointing to the correct database that you setup before.

Expand the "Shesha.Sample.Web.Host" project and double click the "appsettings.json". You will need to edit the connection string to point to your local database that you setup earlier. In this cases we use windows authentication to access our database and our database was restored as "Shesha" so our default connection string will be **"Default": "Data Source=MSI\\MSSQLSERVER01;Initial Catalog=Shesha;integrated security=true"**.

![step 3: setting up the backend](https://github.com/Boxfusion/shesha-docs/blob/main/docs/assets/setting-up-the-backend-3.png?raw=true)

You can now run the app. If you have set everything up correctly you should see the swagger page for the application opened in your browser.

![step 4: setting up the backend](https://github.com/Boxfusion/shesha-docs/blob/main/docs/assets/setting-up-the-backend-4.png?raw=true)

## Setting Up The Admin Portal

### Getting Started

In this tutorial we will introduce you to the Admin Portal app and how to get it set up.

### Change backend url

Before you can run the app you will need to change the backend URL so that it points to your local backend that you have running. You can search for the **BASE_URL** property and set it to your backend URL e.g. localhost:0000. The values to change can be found in the following files:

- restful-react.config.js
- static/config/web.config.js
- utils/configManager.ts

By default the URL is set to "https://shesha-mmsample-backend-dev.azurewebsites.net"

### Run the app

Once you have cloned and opened the 'SheshaMMSampleAdminPortal (Admin Portal)' repository it's now time to get any missing dependencies and run the app. 

The first step is to run the following CLI in your chosen IDE and update all the node packages. 

``` shell
npm i
```

![admin-portal-cli-npm screenshot](https://github.com/Boxfusion/shesha-docs/blob/main/docs/assets/admin-portal-cli-npm.PNG?raw=true)

Running this CLI will update and get any node packages you will need to run the Admin Portal app.

![admin-portal-cli-npm-packages screenshot](https://github.com/Boxfusion/shesha-docs/blob/main/docs/assets/admin-portal-cli-npm-packages.PNG?raw=true)

Once this step is complete we can now run the app using the following CLI

``` shell
npm run dev
```

This will then build and serve the application on the following URL

``` shell
http://localhost:3050
```

You can manually navigate there or (ctrl + click) on the URL when it appears in your IDE terminal. This will launch the following screen.

![admin-portal-welcome-screen screenshot](https://github.com/Boxfusion/shesha-docs/blob/main/docs/assets/admin-portal-welcome-screen.PNG?raw=true)

We can now log in using the following username and password.

=== "Username"
``` shell
admin
```
=== "Password"
``` shell
123qwe
```

Congratulations, you have now succeessfully cloned and run the Shesha Admin Portal app!

## Congratulations

You have setup the main components required to complete the tutorial. We will be building a membership application from scratch and introducing you to more components and patterns for building Shesha apps.

You can move on to the [Membership Management App](https://shesha-docs.readthedocs.io/en/latest/tutorials/00-membership-management-app/) tutorial section when you are ready.
