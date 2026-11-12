# Make email sign-in work (Resend + jourrrney.in)

The server already knows how to send the 6-digit code through Resend (`journey-backend/src/lib/mailer.js`). It only needs
three things from you: a Resend account, proof that you own the sending address, and a key. Nothing in the app changes.

Plan: Resend sends the codes from **`login@updates.jourrrney.in`**. A subdomain (`updates`) is used on purpose: it keeps
sign-in email separate from the main domain and nothing at jourrrney.in clashes with it (checked 2026-11-05: no mail
records, only the Google verification record and GoDaddy's default DMARC).

Free plan: 3,000 emails a month and **100 a day**, 3 domains. One code = one email, so about 100 sign-ins a day. If
that is ever too small, Resend Pro or Brevo (300 a day free) are the next step; the server supports both.

## Part 1: Resend account and domain (about 10 minutes)

1. Open https://resend.com and choose Sign up. Use the email you want to own the account. Confirm it from the email Resend sends.
2. Left menu: **Domains**, then **Add Domain**.
3. Domain name: `updates.jourrrney.in` (the whole thing, with `updates.`). Region: the one closest to India if offered, otherwise leave it.
4. Add Domain. Open the new domain, then the **Records** tab. You will see a short list (usually one MX and two or three TXT records). Keep this tab open.

## Part 2: add those records at GoDaddy (about 10 minutes)

5. Open https://dcc.godaddy.com/ , sign in, choose **jourrrney.in**, then **DNS**.
6. For each row in Resend's Records tab, choose **Add New Record** and copy it across exactly:
   - **Type**: the same as Resend (MX or TXT).
   - **Name / Host**: copy Resend's Name. If it ends in `.jourrrney.in`, remove that ending, because GoDaddy adds it itself (for example `send.updates`, `resend._domainkey.updates`).
   - **Value / Data**: paste Resend's value. For MX, also set **Priority** to what Resend shows (usually 10).
   - **TTL**: leave the default.
7. Do not change or delete any other record (especially the `@` A record, the `www` CNAME and the TXT that starts `google-site-verification`).
8. Tell Claude when done. It can check from here that the records are visible before you press Verify.
9. Back in Resend, press **Verify DNS Records**. It usually turns green within 15 minutes (up to a few hours in rare cases). All rows must say Verified.

## Part 3: the key (about 5 minutes). Never paste the key in chat.

10. Resend left menu: **API Keys**, then **Create API Key**.
11. Name: `journey-backend`. Permission: **Sending access**. Domain: `updates.jourrrney.in`. Create.
12. The key (starts `re_`) is shown **once**. Click copy. Do not send it to anyone, including Claude.

## Part 4: give the key to the server (about 5 minutes)

13. Open https://dashboard.render.com , choose the **jourrrney-backend** service, then **Environment**.
14. Add two variables (Add Environment Variable):
    - Key `RESEND_API_KEY`, Value: paste the key you copied.
    - Key `EMAIL_FROM`, Value: `Jourrrney <login@updates.jourrrney.in>`
15. Save Changes. Render redeploys by itself (a few minutes). Wait until the service says **Live**.

## Part 5: check it

16. Tell Claude when Render is Live. It will check that the server now accepts sign-in requests.
17. In the app: Profile, sign in, type your own email, Continue. The email "<code> is your Jourrrney sign-in code" should arrive within a minute (check junk mail the first time). Type the code.

## If something goes wrong

| What you see | Cause | Fix |
| --- | --- | --- |
| Resend row stays "Pending" after an hour | A record was typed differently | Compare each Name and Value with Resend's tab again; remove a doubled `.jourrrney.in.jourrrney.in` ending |
| App says "We can't send email codes right now" | The server has no key yet (the 503 message) | Part 4 not finished or Render still deploying |
| App says "We couldn't send the code just now" | The server has a key but Resend refused (domain not verified, wrong EMAIL_FROM, or the 100/day limit) | Check Resend > Logs; `EMAIL_FROM` must end in `@updates.jourrrney.in` |
| Email lands in junk | New domain, little history | Mark "Not junk" once; it improves with use |

To rotate the key later: create a new one in Resend, replace `RESEND_API_KEY` in Render, delete the old one in Resend.
