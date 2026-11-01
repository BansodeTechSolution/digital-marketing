export const DEMO_LOGIN = { username: 'organizer', password: 'demo-admin-2026' };

export const seedRegistrations = [
  { id: 'demo-1', name: 'Aarav Mehta', business: 'Mehta Family Grocers', topic: 'WhatsApp Business', createdAt: '2026-10-28T08:30:00.000Z' },
  { id: 'demo-2', name: 'Sana Khan', business: 'Sana’s Home Bakery', topic: 'Social media content', createdAt: '2026-10-29T10:15:00.000Z' },
  { id: 'demo-3', name: 'Rohan Patil', business: 'Patil Cycle Repair', topic: 'Local listings and website options', createdAt: '2026-10-30T06:45:00.000Z' },
];

export const sampleAds = [
  {
    id: 'instagram-story', platform: 'Instagram Stories', format: 'Vertical story · 9:16', campaign: 'Grow your small business online',
    headline: 'Your next customer is scrolling.',
    copy: 'Show up where your neighbourhood spends time. Learn simple social media habits you can keep up with.',
    cta: 'Join a session', path: 'join', objective: 'Reach local business owners', style: 'ad-art-sage', badge: 'SAMPLE CREATIVE',
  },
  {
    id: 'facebook-feed', platform: 'Facebook Feed', format: 'Feed post · 1:1', campaign: 'Six-session beginner course',
    headline: 'Digital marketing, made practical.',
    copy: 'Try WhatsApp Business, plan a week of posts and learn how to measure what works. No marketing background needed.',
    cta: 'Explore the course', path: 'courses', objective: 'Introduce the training', style: 'ad-art-orange', badge: 'SAMPLE CREATIVE',
  },
  {
    id: 'whatsapp-flyer', platform: 'WhatsApp Business', format: 'Shareable flyer · 4:5', campaign: 'Free starter toolkit',
    headline: 'Small steps. More local customers.',
    copy: 'Start with a free WhatsApp Business checklist and a simple weekly content routine for your business.',
    cta: 'Get the toolkit', path: 'toolkit', objective: 'Encourage toolkit visits', style: 'ad-art-cream', badge: 'SAMPLE CREATIVE',
  },
];
