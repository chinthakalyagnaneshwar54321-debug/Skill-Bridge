/**
 * Dummy/demo data used ONLY as a visual fallback when a logged-in account has
 * no real records yet, so the UI can be understood at a glance.
 * All demo ids are prefixed with "demo-" and are never written to the database.
 */

export const isDemoId = (id: string) => id.startsWith("demo-");

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();

export const demoRequests = [
  {
    id: "demo-req-1",
    status: "pending" as const,
    message: "Hey! I'd love to learn React from you — I can help you with Python in return.",
    created_at: hoursAgo(3),
    sender_id: "demo-user-1",
    receiver_id: "self",
    sender: { id: "demo-user-1", full_name: "Ananya Rao", avatar_url: null },
    receiver: { id: "self", full_name: "You", avatar_url: null },
    offered: { title: "Python & Pandas" },
    requested: { title: "React Fundamentals" },
  },
  {
    id: "demo-req-2",
    status: "accepted" as const,
    message: "Sounds great, let's start this weekend!",
    created_at: hoursAgo(26),
    sender_id: "demo-user-2",
    receiver_id: "self",
    sender: { id: "demo-user-2", full_name: "Rahul Menon", avatar_url: null },
    receiver: { id: "self", full_name: "You", avatar_url: null },
    offered: { title: "Figma UI Design" },
    requested: { title: "JavaScript Basics" },
  },
  {
    id: "demo-req-3",
    status: "completed" as const,
    message: null,
    created_at: hoursAgo(120),
    sender_id: "self",
    receiver_id: "demo-user-3",
    sender: { id: "self", full_name: "You", avatar_url: null },
    receiver: { id: "demo-user-3", full_name: "Sneha Kulkarni", avatar_url: null },
    offered: { title: "Public Speaking" },
    requested: { title: "Machine Learning 101" },
  },
  {
    id: "demo-req-4",
    status: "pending" as const,
    message: "Can you teach me DSA problem patterns? I can help with Tailwind CSS.",
    created_at: hoursAgo(8),
    sender_id: "self",
    receiver_id: "demo-user-4",
    sender: { id: "self", full_name: "You", avatar_url: null },
    receiver: { id: "demo-user-4", full_name: "Arjun Iyer", avatar_url: null },
    offered: { title: "Tailwind CSS" },
    requested: { title: "Data Structures & Algorithms" },
  },
];

export const demoNotifications = [
  {
    id: "demo-notif-1",
    type: "new_request",
    title: "New exchange request",
    body: "Ananya Rao wants to swap Python & Pandas for React Fundamentals.",
    link: "/requests",
    read: false,
    created_at: hoursAgo(3),
  },
  {
    id: "demo-notif-2",
    type: "request_accepted",
    title: "Request accepted",
    body: "Rahul Menon accepted your exchange request.",
    link: "/requests",
    read: false,
    created_at: hoursAgo(26),
  },
  {
    id: "demo-notif-3",
    type: "new_review",
    title: "New review",
    body: "Sneha Kulkarni left you a 5★ review.",
    link: "/my-profile",
    read: true,
    created_at: hoursAgo(96),
  },
];

export const demoDashboard = {
  stats: { skills: 6, pending: 2, accepted: 1, completed: 4, avgRating: 4.6, reviewsCount: 5 },
  byCategory: [
    { name: "Programming", value: 3 },
    { name: "AI / ML", value: 1 },
    { name: "UI / UX", value: 2 },
    { name: "Languages", value: 1 },
  ],
};

export const demoSkills = [
  { id: "demo-skill-1", title: "React Fundamentals", description: "Components, hooks, state and routing with hands-on mini projects.", type: "offered" as const, level: "advanced" as const, category_id: null, categories: { name: "Programming" } },
  { id: "demo-skill-2", title: "Tailwind CSS", description: "Utility-first styling, responsive design and theming.", type: "offered" as const, level: "intermediate" as const, category_id: null, categories: { name: "UI / UX" } },
  { id: "demo-skill-3", title: "Machine Learning 101", description: "Want to understand regression, classification and model evaluation.", type: "wanted" as const, level: "beginner" as const, category_id: null, categories: { name: "AI / ML" } },
];

export const demoBrowseRows = [
  {
    id: "demo-browse-1", title: "React Fundamentals", description: "Hooks, state management and clean component patterns.",
    type: "offered" as const, level: "advanced", user_id: "demo-user-1",
    categories: { name: "Programming" },
    profiles: { id: "demo-user-1", full_name: "Ananya Rao", college: "NIT Trichy", branch: "Computer Science", avatar_url: null },
  },
  {
    id: "demo-browse-2", title: "Figma UI Design", description: "Wireframes, design systems and prototyping.",
    type: "offered" as const, level: "intermediate", user_id: "demo-user-2",
    categories: { name: "UI / UX" },
    profiles: { id: "demo-user-2", full_name: "Rahul Menon", college: "VIT Vellore", branch: "Information Technology", avatar_url: null },
  },
  {
    id: "demo-browse-3", title: "Machine Learning 101", description: "Scikit-learn basics with real datasets.",
    type: "offered" as const, level: "beginner", user_id: "demo-user-3",
    categories: { name: "AI / ML" },
    profiles: { id: "demo-user-3", full_name: "Sneha Kulkarni", college: "COEP Pune", branch: "Electronics", avatar_url: null },
  },
  {
    id: "demo-browse-4", title: "Data Structures & Algorithms", description: "Problem patterns for interviews and contests.",
    type: "offered" as const, level: "advanced", user_id: "demo-user-4",
    categories: { name: "Programming" },
    profiles: { id: "demo-user-4", full_name: "Arjun Iyer", college: "IIT Hyderabad", branch: "Mechanical", avatar_url: null },
  },
  {
    id: "demo-browse-5", title: "Spoken German (A1)", description: "Wants a conversation partner for basic German.",
    type: "wanted" as const, level: "beginner", user_id: "demo-user-5",
    categories: { name: "Languages" },
    profiles: { id: "demo-user-5", full_name: "Meera Nair", college: "Christ University", branch: "Commerce", avatar_url: null },
  },
  {
    id: "demo-browse-6", title: "Public Speaking", description: "Wants coaching for college fest hosting.",
    type: "wanted" as const, level: "intermediate", user_id: "demo-user-6",
    categories: { name: "Soft Skills" },
    profiles: { id: "demo-user-6", full_name: "Kabir Shah", college: "SRM Chennai", branch: "Civil", avatar_url: null },
  },
];

export const demoCategoryRows: Record<string, typeof demoBrowseRows> = {
  programming: [
    demoBrowseRows[0],
    demoBrowseRows[3],
    { ...demoBrowseRows[0], id: "demo-programming-3", title: "Python & Pandas", description: "Data workflows, notebooks and practical automation with Python." },
  ],
  "web-development": [
    { ...demoBrowseRows[0], id: "demo-web-1", title: "Full-stack Web Apps", description: "Build modern web applications from interface to API." },
    { ...demoBrowseRows[0], id: "demo-web-2", title: "Responsive CSS", description: "Create polished layouts that work across every screen size." },
  ],
  "ai-ml": [
    demoBrowseRows[2],
    { ...demoBrowseRows[2], id: "demo-ai-2", title: "Prompt Engineering", description: "Design reliable prompts and AI-powered workflows." },
  ],
  "ui-ux": [
    demoBrowseRows[1],
    { ...demoBrowseRows[1], id: "demo-ui-2", title: "Design Systems", description: "Create reusable components, tokens and accessible interfaces." },
  ],
  cloud: [
    { ...demoBrowseRows[0], id: "demo-cloud-1", title: "Cloud Fundamentals", description: "Understand hosting, storage and deployment on the cloud." },
    { ...demoBrowseRows[0], id: "demo-cloud-2", title: "Cloud Deployment", description: "Ship web projects with reliable, repeatable deployments." },
  ],
  "public-speaking": [
    demoBrowseRows[5],
    { ...demoBrowseRows[5], id: "demo-speaking-2", title: "Presentation Skills", description: "Plan clear talks and present with confidence." },
  ],
};
