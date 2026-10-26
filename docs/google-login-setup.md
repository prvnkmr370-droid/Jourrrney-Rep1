# Making "Sign in with Google" work

The app and the server are built. What is missing is Google's registration for Jourrrney and its two keys on the server. About 20 minutes, no coding.

## How it works, in plain words

1. Someone taps **Sign in with Google** in the app.
2. Their phone's browser opens **Google's own account chooser**. Jourrrney never sees their Google password.
3. They pick an account and tap Continue. Google asks, "Let Jourrrney see your name and email?"
4. Google sends them back to the Jourrrney server, which asks Google "who is this?" using a secret key only the server knows.
5. The server creates their account (or finds it, using their email) and opens the app, already signed in.

Google only lets registered apps use its login. Registering gives you two things:

- **Client ID**: like a name tag. It is not secret.
- **Client secret**: like a password. It proves the requests come from your server. **Never put it in the app, in a message, or in a screenshot.**

## Part A: Create the project and the consent screen (console.cloud.google.com)

Google changes its screens now and then, so a button may be named a little differently.

1. Go to **console.cloud.google.com** and sign in with the Google account that should own Jourrrney (a shared business account is better than a personal one, if you have one).
2. At the top, open the **project picker** and choose **New project**. Name it *Jourrrney* and click **Create**. Make sure it is the selected project.
3. Open the menu (three lines, top left) and choose **APIs & Services → OAuth consent screen**. (If you see **Google Auth Platform** instead, click **Get started**.)
4. Fill in:
   - **App name:** Jourrrney
   - **User support email:** your email address
   - **Audience / User type:** **External**
   - **Contact email:** your email address
   Then agree to the policy and click **Create**.
5. Find the **Branding** (or *App information*) part and add the two web pages Google likes to see:
   - Privacy policy: `https://jourrrney-backend.onrender.com/privacy`
   - Terms of service: `https://jourrrney-backend.onrender.com/terms`

   Google may say it only accepts addresses on a domain you own, and onrender.com is not yours. If so, leave these two boxes empty for now and tell me. This does not stop the login from working; it only matters later.
6. Open **Data access** (or *Scopes*), click **Add or remove scopes**, and tick the three basic ones: **openid**, **.../auth/userinfo.email** and **.../auth/userinfo.profile**. Save. Do not add any others.

## Part B: Create the key (the "OAuth client")

1. Open **APIs & Services → Credentials** (or **Google Auth Platform → Clients**).
2. Click **Create credentials → OAuth client ID** (or **Create client**).
3. **Application type:** choose **Web application**. **Name:** *Jourrrney server*.
4. Under **Authorised redirect URIs**, click **Add URI** and paste this exactly (no spaces, no slash at the end):

   `https://jourrrney-backend.onrender.com/auth/google/callback`

   Leave **Authorised JavaScript origins** empty.
5. Click **Create**. A box shows your **Client ID** and **Client secret**. Copy both somewhere private. Google may only show the secret once; if it hides it, use **Download JSON** and keep that file private.

## Part C: Give the keys to the server (dashboard.render.com)

1. Open the service **jourrrney-backend**, then the **Environment** tab.
2. Add these (click **Add Environment Variable** for each):

   | Key | Value |
   |---|---|
   | `GOOGLE_WEB_CLIENT_ID` | the Client ID you copied |
   | `GOOGLE_WEB_CLIENT_SECRET` | the Client secret you copied |
   | `SUPPORT_EMAIL` | an email address people can write to (if you have not added it yet) |

3. Click **Save**. Render restarts the server; wait one or two minutes.
4. **Check it:** open `https://jourrrney-backend.onrender.com/auth/google/status` in any browser. It must say `{"configured":true}`. If it says `false`, a key is missing or has a typo.

## Part D: Try it on your phone

1. Make sure the app update that has the Google button is on your phone (Settings shows the update line at the bottom). Close the app completely and reopen it, twice.
2. Open the sign-in screen and tap **Sign in with Google**. The button says "Opening Google…".
3. Your browser opens Google's account chooser. Pick your account.
4. A Jourrrney page appears: "You're signed in. Opening the Jourrrney app…". If the app doesn't open by itself, tap **Open Jourrrney**.
5. You are in the app. **My Account** shows your Google name.

## If something goes wrong

| What you see | What it means | What to do |
|---|---|---|
| The box "Google sign-in isn't available yet" | The server has no keys yet | Do Part C; check the status page says `true` |
| Google page: **Error 400: redirect_uri_mismatch** | The redirect address doesn't match, or Google hasn't applied your change yet | Re-paste it exactly as in step 4 of Part B. If it already matches, wait 5 minutes (Google says changes can take from 5 minutes to a few hours) and try again |
| Google page: **Error 401: invalid_client** or "OAuth client was not found" | The Client ID has a typo, or the client was deleted | Re-copy the Client ID into Render |
| Google page: **Access blocked** / **Error 403: access_denied** | The consent screen is in *Testing* and your Google account is not a listed tester | **Audience → Test users → Add users**, add your email; or publish the app (see below) |
| Our page: "We need a verified email" | That Google account's email isn't verified | Sign in with email instead |
| Our page: "That sign-in link has expired" | Too much time passed between tapping and choosing an account | Tap the button again |
| The page appears but the app doesn't open | The phone didn't hand over to the app | Tap **Open Jourrrney** on the page |

## Later: letting everyone use it

Until you publish, only the test users you list can sign in. On the consent screen page, open **Audience** and click **Publish app** (so its status says *In production*). Because Jourrrney only asks for name and email, Google should not need to review it, but if it asks for anything more, tell me what it says.

## Safety notes

- Keep the **Client secret** only in Render. If it is ever shared by mistake, open the client under **Credentials**, add a new secret (and disable the old one), then update Render.
- The server never sees a Google password and never reads anything except your name and verified email.
