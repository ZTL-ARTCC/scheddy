# Deploying Scheddy

> **Important Caveat**
> 
> Scheddy can currently only load user information from **VATUSA.**
> 
> If you wish to use this software outside of VATUSA, it's easy to adapt - the authentication backend is only used in
> one routine and can be easily replaced.
> 
> Ping Tyler Donia on the vatsim.dev Discord and I'd be happy to help you integrate Scheddy with your vACC/Division's
> authentication system.

Scheddy is easy to deploy *with some minimal sysadmin experience.*
Give yourself an hour or so to get Scheddy up and running for your facility.

If you have trouble, ping me on vatsim.dev or post a Discussion on GitHub - I'm happy to help!

## Prerequisites

You must have a VPS (from AWS, GCloud, DigitalOcean, doesn't matter) running Linux of some kind.

Scheddy -cannot- (**CANNOT!**) be deployed on shared web hosting of any kind. If you try anyway, it is almost guaranteed
that it will not work, and we cannot support you in this instance.
We do not recommend running Scheddy inside any sort of managed environment such as Plesk, as we can't guarantee they
will play nice together.

ZTL runs Scheddy in production on the cheapest EC2 VM available, and it works great. Scheddy is fairly lightweight, and does not need much!

On your VPS, have the following tooling installed:
- [bun](https://bun.sh) version 1.2 or later
- [Git](https://git-scm.com)
- A reverse proxy of some kind (we like [Caddy](https://caddyserver.com), but others have had success with [nginx](https://nginx.org))

You'll also need access to a clean MySQL database. Postgres or sqlite are not supported.

## Step 1. Download the Scheddy bundle

On your VPS, download the latest Scheddy build bundle from the Releases tab. Extract it somewhere you can access.

## Step 2. Install/update dependencies

In the `scheddy/` directory you've downloaded, run `bun install` to install the latest dependencies.

## Step 3. Configure Scheddy

Create your .env file according to [Configure Scheddy](configure.md). Put the result in `.env`, then return to this guide when you're done.

## Step 4. Run database migrations

Before starting scheddy, you must migrate the database. If you are updating, check the changelog for any manual migration that must be done!

```
bun db:migrate
```

This should respond with `[✓] migrations applied successfully!` if the process is successful.

## Step 5. Start Scheddy

Start the server:

```
bun --bun run build/index.js
```

It will listen on port 3000 by default. If you want to change this, you can set the PORT environment variable at runtime- e.g. `PORT=3005 bun --bun run build/index.js` will have it listen on port 3005.

It's highly encouraged that you either create a systemd unit for Scheddy or use something like pm2 to keep scheddy running even after you close your console session.

## Step 6. Configure your reverse proxy

Refer to the documentation for your reverse proxy on how to configure it. You don't need anything special - we like Caddy with a simple reverse_proxy config, but if you wish to use something else, nginx is a great choice, or Apache is a classic if you know how to use it already.

## Step 7. Log in

Log in, and you're good to go. Make sure to monitor the GitHub regularly for new versions and follow the instructions below to update whenever a new update becomes available. Scheddy is under active development, so it's important that you keep up to date.

## Updating Scheddy

Updating scheddy is fairly simple - check the changelog on Releases for any important information, then simply repeat the above steps, making sure to back up your .env file to ensure it is not accidentially deleted or overwritten, and then restarting your Scheddy server through whatever mechanism you configured in Step 5.