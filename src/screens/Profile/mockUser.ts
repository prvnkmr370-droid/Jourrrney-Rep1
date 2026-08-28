/**
 * Static demo persona ported from the Make prototype's ProfileScreen.tsx —
 * it's mock data there too (hardcoded, no backend), not something this
 * port is faking on top of a real feature. Shared by MyAccount.tsx and
 * its tabs.
 */
export const USER = {
  name: "Priya Sharma",
  preferredName: "Priya",
  email: "priya.sharma@email.com",
  phone: "+91 98765 43210",
  avatar: "PS",
  location: "Bengaluru, Karnataka",
  memberSince: "2024",
  bio: "Solo traveller exploring India one state at a time. I love heritage sites, local food, and off-the-beaten-path experiences.",
  languages: ["English", "Hindi", "Kannada"],
  travelStyle: "Backpacker",
  verified: { phone: true, email: true, govId: false },
};
