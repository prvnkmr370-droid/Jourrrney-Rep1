# Making "Sign in with Facebook" work

The app and the server are already built and live. What is missing is a Facebook app (Facebook's registration for Jourrrney) and its two keys on the server. About 20 minutes, no coding.

## How it works, in plain words

1. Someone taps **Sign in with Facebook** in the app.
2. Their phone's browser opens **Facebook's own login page**. Jourrrney never sees their Facebook password.
3. Facebook asks "Let Jourrrney see your name and email?" They tap Continue.
4. Facebook sends them back to the Jourrrney server, which asks Facebook "who is this?" using a secret key only the server knows.
5. The server creates their account (or finds it, using their email) and opens the app, already signed in.

Why a Facebook app is needed: Facebook only lets registered apps use its login. Registering gives you two things:

- **App ID**: like a name tag. It is not secret.
- **App Secret**: like a password. It proves the requests come from your server. **Never put it in the app, in a message, or in a screenshot.**

> **Important, learned the hard way:** the app must be created with the use case **"Authenticate and request data from users with Facebook Login"** only. An app created with business use cases (ads, WhatsApp, Pages) cannot add it later and has no plain Facebook Login, so create a new app instead. The working app is **jourrrney**, App ID `1437970984963434`.

## Part A: Create the Facebook app (on developers.facebook.com)

Meta changes its screens now and then, so a button may be named a little differently.

1. Go to **developers.facebook.com** and log in with your Facebook account. If asked, register as a developer (it is free).
2. Choose **My Apps → Create App**.
3. Give it a name (for example *Jourrrney*) and your email address.
4. When asked what the app should do, choose **"Authenticate and request data from users with Facebook Login"**. Continue through the other screens (you can skip connecting a business) until the app is created.
5. Open **Facebook Login → Settings** (it may be under *Products*, or under *Use cases → Facebook Login → Settings*).
6. Find **Valid OAuth Redirect URIs**, paste this exactly (no spaces, no slash at the end), and save:

   `https://jourrrney-backend.onrender.com/auth/facebook/callback`

7. Check that the **email** permission is available: *Use cases → Facebook Login → Customize*, and add **email** (next to the default *public_profile*).
8. Open **App settings → Basic**. Copy the **App ID**. Click **Show** next to **App Secret** and copy that too (Facebook may ask for your password).
9. Still on that page, fill in **User data deletion** (instructions URL) with:

   `https://jourrrney-backend.onrender.com/auth/facebook/data-deletion`

## Part B: Give the keys to the server (on dashboard.render.com)

1. Log in to Render and open the service **jourrrney-backend**.
2. Open the **Environment** tab.
3. Add three variables (click **Add Environment Variable** for each):

   | Key | Value |
   |---|---|
   | `FACEBOOK_APP_ID` | the App ID you copied |
   | `FACEBOOK_APP_SECRET` | the App Secret you copied |
   | `SUPPORT_EMAIL` | an email address people can write to |

4. Click **Save**. Render restarts the server; wait one or two minutes.
5. **Check it:** open `https://jourrrney-backend.onrender.com/auth/facebook/status` in any browser. It must say `{"configured":true}`. If it still says `false`, a key is missing or has a typo.

## Part C: Try it on your phone

1. Close the Jourrrney app completely and reopen it (twice if needed, to get the latest update).
2. Open the sign-in screen and tap **Sign in with Facebook**. The button says "Opening Facebook…".
3. Your browser opens Facebook. Log in, tap **Continue as (your name)**.
4. A Jourrrney page appears: "You're signed in. Opening the Jourrrney app…". If the app doesn't open by itself, tap **Open Jourrrney**.
5. You are in the app. **My Account** shows your Facebook name, and saving favourites now works.

While the Facebook app is in **Development mode**, only you (its creator) and people you add under *App roles → Roles* (as Testers, who must accept the invitation) can log in. That is fine for trying it.

## If something goes wrong

| What you see | What it means | What to do |
|---|---|---|
| The box "Facebook sign-in isn't available yet" | The server has no keys yet | Do Part B; check the status page says `true` |
| Facebook page: "URL Blocked" or "redirect URI is not whitelisted" | The redirect address doesn't match | Re-paste it exactly as in step 6 of Part A |
| Facebook page: "Invalid App ID" or "App not active" | The App ID has a typo, or the app is switched off | Re-copy the App ID into Render |
| Facebook page: "this app is in development mode" / you can't continue | Your Facebook account has no role on the app | Add yourself under App roles |
| Our page: "We need your email" | That Facebook account shares no email | Sign in with email instead |
| Our page: "That sign-in link has expired" | Too much time passed between tapping and logging in | Tap the button again |
| The page appears but the app doesn't open | The phone didn't hand over to the app | Tap **Open Jourrrney** on the page |

## Later: letting everyone use it

Until you switch the Facebook app to **Live**, only testers can log in. To go Live, Facebook needs on the **App settings → Basic** page: an **app icon**, a **Privacy Policy URL** (a public web page; the app's privacy text is not on the web yet), a category, and the data-deletion address from step 9. Then flip the switch at the top of the dashboard from *Development* to *Live*. Facebook may also ask you to submit the **email** permission for review before everyone can use it (the login screen shows "Some of the permissions below have not been approved" until then). That does not stop you or your testers while the app is in Development mode; check what Meta asks for when you get to this step.

Ask for the privacy-policy page when you get here; it is quick to add to the server.

## Safety notes

- Keep the **App Secret** only in Render. If it is ever shared by mistake, open *App settings → Basic* and choose **Reset** next to it, then update Render.
- The server never sees a Facebook password and never posts anything to Facebook.
