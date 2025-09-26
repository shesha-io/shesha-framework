<p align="center">
  <a href="https://www.shesha.io?utm_source=github&utm_medium=organic&utm_campaign=readme">
    <img src="https://github.com/shesha-io/shesha-framework/blob/main/static/Shesha_Horizontal.png" alt="Shesha Logo" width="500">
  </a>
</p>

# What is Shesha?

<p>Shesha is an open-source Low-Code development framework specifically for .NET developers. You can build anything from simple CRUD apps, admin panels to complex business applications super quickly.</p>

Shesha builds on top of other excellent frameworks and libraries (most notably ASP\.NET Core, Abp\.io, React, NextJs), layers on Low-Code capabilities (think drag & drop form builder and app themer), and incorporates standard admin functionality (e.g. User and security management) to drastically reduce the time and effort required to build applications.

In fact, in our experience, you will likely need **>80% less code** for most typical business applications.

👾 Embark on an adventure and explore the boundless possibilities of Shesha at our [tutorial site](https://tutorial.shesha.dev/)! It's not just a playground; it's a vibrant universe where you can interact with the framework and witness its magic unfold.

More info from the [Shesha website](https://shesha.io/).

# Features

Shesha comes with a range of features that massively reduce the effort required to create business applications:

- **Form Builder** allows users to create application pages and by simply 'dragging and dropping' components onto a page designer. With over 40 components that come as standard, you will be able to create powerful and professional-looking applications without writing a line of front-end code. If the standard components aren't sufficient, simply create your own in React or create entirely custom pages.
- **Dynamic CRUD APIs** get 'auto-magically' generated from your domain entities without the need for repetitive boilerplate code. APIs can be secured simply through configuration.
- **App Themer** allows you to match your branding needs with zero effort.
- **Administration Panel** provides the most common admin functionalities required by almost any business application 'out-of-the-box', including:
  - Security:
    - User Management
    - Roles and permissions management
    - API Configuration
    - Data change audits
    - Logon Audits
  - Settings management
  - Notification templates and audits
  - Scheduled and Background Jobs management
  - Reference/Lookup lists management

<h4 align="center">
  <b><a href="https://www.shesha.io/get-started-with-shesha">Get Started</a></b>
  •
  <b><a href="https://www.youtube.com/@Shesha01">YouTube</a></b>
    •
  <b><a href="https://tutorial.shesha.dev/">Demo Site</a></b>
</h4>

<br />

## Build Apps in 4 Steps

### 1. Implement your Domain

Shesha takes a Domain-driven approach to application development, the starting point is therefore to implement your domain. This is done by implementing `Entity` classes as you would do for any business application. You can extend standard entities that come as part of the base Shesha model (e.g. `Person`, `Organisation`, `Site`, etc...) or by creating your own.

<p align="center">
  <img alt="Create your domain" src="https://github.com/shesha-io/shesha-framework/blob/main/static/domain-entity.gif" />
</p>

### 2. Expose your APIs

All it takes to expose your domain and data through dynamically generated CRUD APIs is the checking of a box and specifying the authorization rules.

You will immediately get full CRUD support as well as GraphQL endpoints for flexible and efficient data retrieval.

<p align="center">
  <img alt="Expose your APIs" src="https://github.com/shesha-io/shesha-framework/blob/main/static/generate-api.gif" />
</p>

Where the dynamically generated APIs are insufficient, you still have the full power of Visual Studio and ASP.NET Core to create custom APIs the way you are used to.

### 3. Configure your UI

Once you have exposed your domain and APIs, you can build your UI through our drag-and-drop form builder. There are over 40 different components including tables, lists, forms, sub-forms, modals, and many more allowing you to build sophisticated and scalable enterprise applications without a line of front-end code.

<p align="center">
  <img alt="Expose your APIs" src="https://github.com/shesha-io/shesha-framework/blob/main/static/form-configuration.gif" />
</p>

Where the configuration-only approach is too limiting, you can add Javascript snippets to implement more advanced behavior or build custom components or entire pages using React.

### 4. Deploy your app

Simply deploy your application as you would any other ASP.NET Core website with Sql Server. Deploy on your favorite cloud or on-premise.

## Getting Started

The easiest way to get started is by downloading a starter template and by following our [tutorial videos](https://www.youtube.com/watch?v=-QqzmP30kBs&list=PLEFomNQeAmo2Azy7aWqjX5oiIAeKiFCzt) that will take you through the full process of building your first Shesha application.

## Support and Community

Issues are inevitable. When you have one, our entire team and our active developer community are around to help.<br>

💬 Talk to us on [Discord](https://discord.gg/pdDh7JRNGp)<br>
📄 Find a solution in our [Documentation](https://docs.shesha.io)<br>
⚠️ Open an issue right here on [GitHub](https://github.com/shesha-io/shesha-framework/issues)<br>
💡 Use our learning resources: [Videos](https://www.youtube.com/@Shesha01)<br>
👾 Play around with live configurations on our [tutorial site](https://tutorial.shesha.dev)

## How to Contribute

We ❤️ our contributors. We're committed to fostering an open, welcoming, and safe environment in the community.

📕 We expect everyone participating in the community to abide by our [Code of Conduct](https://github.com/shesha-io/shesha-framework/blob/main/.github/CODE_OF_CONDUCT.md). Please read and follow it. <br>
🤝 If you'd like to contribute, start by reading our [Contribution Guide](https://github.com/shesha-io/shesha-framework/blob/main/.github/CONTRIBUTING.md).<br>
👾 Explore some [good first issues](https://github.com/shesha-io/shesha-framework/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22).<br>

Let's build great software together!

## License

Shesha is available under the [Apache License 2.0](https://github.com/shesha-io/shesha-framework/blob/main/LICENSE.md). Use it wisely!
