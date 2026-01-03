import { Persona } from '@/types/chat';

export const dummyPersonas: Persona[] = [
  {
    id: 'marketing',
    name: 'Marketing',
    role: 'Marketing Specialist',
    avatar: 'M',
    color: '#10B981', // green
  },
  {
    id: 'pm',
    name: 'PM',
    role: 'Product Manager',
    avatar: 'P',
    color: '#F87171', // red
  },
  {
    id: 'developer',
    name: 'Developer',
    role: 'Software Engineer',
    avatar: 'D',
    color: '#60A5FA', // blue
  },
  {
    id: 'qa',
    name: 'QA & Testing',
    role: 'Quality Assurance',
    avatar: 'Q',
    color: '#A78BFA', // purple
  },
];

export const dummyResponses: Record<string, string[]> = {
  marketing: [
    "I've scanned current market trends for 2025. The 'Arch-Tech' niche is growing, but user retention is low in existing apps due to poor visualization tools. However, AR adoption in professional architecture is up by 42%. Retrieving data... Estimated Total Addressable Market: $2.4B. I suggest we pivot the value prop from 'Social Sharing' to 'Professional Critique' to capture higher-value users.",
    "Based on recent market analysis, we should focus on the professional segment. The competition in consumer AR is saturated, but there's a clear gap in professional tools.",
    'I recommend we target architecture firms and design studios first. They have the budget and need for high-quality AR visualization tools.',
  ],
  pm: [
    'Agreed on the pivot. But a professional tool requires high stability. Developer, can we build an AR critique engine in a 4-month MVP window with a team of 3?',
    "Let's prioritize core features for the MVP: AR model viewing, annotation system, and basic collaboration. We can add advanced features in phase 2.",
    "We need to define clear success metrics. I'm thinking: user retention rate, number of projects created, and collaboration engagement.",
  ],
  developer: [
    "A full AR engine with real-time shadows and occlusion? No. That's a 9-month roadmap. If we want to launch in 4 months, we should use a web-based AR framework or limit the initial release to static 3D model overlays with 'pinned' comments.",
    "I can start with AR.js or Three.js for the web-based approach. We'd need to compromise on some visual quality, but we can ship faster.",
    'For the MVP, I suggest we focus on mobile web first. Native apps can come later once we validate the concept.',
  ],
  qa: [
    "LIDAR-only requirement limits our market to iPhone Pro and high-end Android users. Marketing, how does that affect the revenue prediction? Also, Developer, how do we handle lighting variations for outdoor architecture? I'm seeing a major risk in 'Environmental Inconsistency' for the AR critique.",
    "We need to establish testing protocols early. I'll need access to various devices and test environments to ensure consistent AR performance.",
    'Should we consider a phased rollout? Start with a beta group to gather feedback before the full launch?',
  ],
};

export const getRandomResponse = (personaId: string): string => {
  const responses = dummyResponses[personaId];
  return responses[Math.floor(Math.random() * responses.length)];
};

export const getRandomPersonas = (count = 2): Persona[] => {
  const shuffled = [...dummyPersonas].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
