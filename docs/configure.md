# Configuring Scheddy
Scheddy is primarily configured through a set of environment variables. Please consult the table below for what they are, and how they should be set.

## How to set variables
All variables must be set at **runtime**. They must be visible to the main server process, whether that be via a `.env` or through `Environment=` in a systemd unit.


### List of config variables

| Variable                                | Required? | Description                                                                                                 | Example                                               |
|-----------------------------------------|-----------|-------------------------------------------------------------------------------------------------------------|-------------------------------------------------------|
| `SCHEDDY_DATABASE_URL`                  | Yes       | A URL-style connection string for MySQL.                                                                    | `mysql://username:urlencoded_password@host:port/name` |
| `PUBLIC_SCHEDDY_FACILITY_NAME`          | Yes       | The site name to be displayed.                                                                              | `Atlanta ARTCC`                                       |
| `SCHEDDY_FACILITY_ID`                   | Yes       | Your VATUSA API ID (ZTL, ZAU, ZOB, etc)                                                                     | `ZTL`                                                 |
| `SCHEDDY_FACILITY_MAIL_DOMAIN`          | Yes       | The domain your facility uses for email.                                                                    | `ztlartcc.org`                                        |
| `PUBLIC_SCHEDDY_SITE_BASE`              | Yes       | The public base URL **WITH A SLASH AT THE END** of your Scheddy instance.                                   | `https://scheddy.ztlartcc.org/`                       |
| `SCHEDDY_SITE_MODE`                     | No        | If this is set to `dev`, it enables the development CID auth backend.                                       | `prod`                                                |
| `SCHEDDY_SITE_DEV_CID`                  | No        | If `SCHEDDY_SITE_MODE` is `dev`, this will overwrite whatever CID you log in with (useful for development.) | `1710004`                                             |
| `SCHEDDY_BOOKINGS_MAX_DAYS_AHEAD`       | Yes       | Max # of days, integer, ahead of time that students can book.                                               | `14`                                                  |
| `SCHEDDY_BOOKINGS_MAX_PENDING_SESSIONS` | Yes       | Max # of sessions, integer, a student may have booked at any given time.                                    | `2`                                                   |
| `PUBLIC_SCHEDDY_AUTH_VATSIM_BASE`         | Yes       | VATSIM OAuth base. Should always be `https://auth.vatsim.net`               | `https://auth.vatsim.net`                                        |
| `PUBLIC_SCHEDDY_AUTH_VATSIM_CLIENT_ID`    | Yes       | VATSIM OAuth client ID                                                      | `123`                                                            |
| `SCHEDDY_AUTH_VATSIM_CLIENT_SECRET` | Yes       | Redirect URL. Should be `https://your.scheddy.domain/callback`              | `https://scheddy.ztlartcc.org/callback`                          |
| `SCHEDDY_AUTH_VATUSA_BASE`                  | Yes       | VATUSA API base. Should always be `https://api.vatusa.net`                  | `https://api.vatusa.net`                                         |
| `SCHEDDY_AUTH_VATUSA_KEY`                   | Yes       | Your VATUSA API key.                                                        | `123SecretKey`                                                   |
| `SCHEDDY_SMTP_HOST`                        | Yes       | SMTP host to connect to for notifications.                                  | `mail.yourproviders.email`                                       |
| `SCHEDDY_SMTP_PORT`                        | Yes       | SMTP port to connect to                                                     | `465`                                                            |
| `SCHEDDY_SMTP_SECURE`                      | Yes       | Whether or not to use TLS/SSL/STARTTLS/etc (`true` or `false`)                                  | `true`                                                           |
| `SCHEDDY_SMTP_AUTH_USER`                   | Yes       | Username to authenticate with                                               | `username`                                                       |
| `SCHEDDY_SMTP_AUTH_PASS`                   | Yes       | Password to authenticate with                                               | `password`                                                       |
| `SCHEDDY_SMTP_FROM`                  | Yes       | The contents of the From header for emails.                                 | `Name To Show <email_to@send.from>`                              |
| `SCHEDDY_API_MASTER_KEY`                   | Yes       | A randomly generated secret key to use for the API.                         | `GENERATE_YOUR_OWN_YOU_HAVE_BEEN_WARNED`                         |
| `PUBLIC_SENTRY_DSN`                | No        | Sentry DSN for error reporting. Help make Scheddy better - please use ours! | `https://ce463d975d42f1a39ec94cbf87405e46@sentry.coredoes.dev/2` |

> **Note**
> 
> We rely on Sentry to get issue reports outside of ZTL. We would greatly appreciate if you use our sentry DSN, so that we get reports of any errors that pop up.
>
> If you don't want to, that's okay. Set the env var to anything to overwrite it.
>
> If you choose not to report with Sentry, please, please report any issues you find on the Issues section of the github.
>
> That way, we can fix it, and make Scheddy the best it can be :)

> **CAUTION**
> 
> __IT IS ABSOLUTELY CRUCIAL THAT YOU GENERATE YOUR OWN API KEY__
>
> DO NOT USE ANY EXAMPLE VALUES. The master API key has power!
>
> `openssl rand -hex 32` is your friend.
>
> Do not share it with untrusted parties.

