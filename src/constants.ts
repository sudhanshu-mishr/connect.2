import { Profile, Match } from './types';

export const MOCK_PROFILES: Profile[] = [
  {
    id: '1',
    name: 'Sarah',
    age: 24,
    bio: 'Adventure seeker and coffee enthusiast. Let\'s find the best sunset spots! 🌅',
    distance: '2km away',
    job: 'Graphic Designer',
    school: 'Design Academy',
    images: [
      'https://picsum.photos/seed/sarah1/800/1200',
      'https://picsum.photos/seed/sarah2/800/1200',
    ],
    interests: ['Coffee', 'Hiking', 'Art', 'Travel'],
  },
  {
    id: '2',
    name: 'Alex',
    age: 27,
    bio: 'Chef by day, gamer by night. I make a mean pasta carbonara. 🍝',
    distance: '5km away',
    job: 'Head Chef',
    school: 'Culinary Institute',
    images: [
      'https://picsum.photos/seed/alex1/800/1200',
      'https://picsum.photos/seed/alex2/800/1200',
    ],
    interests: ['Cooking', 'Gaming', 'Music', 'Wine'],
  },
  {
    id: '3',
    name: 'Elena',
    age: 22,
    bio: 'Student, dreamer, and occasional poet. Looking for someone to share stories with.',
    distance: '1km away',
    job: 'Student',
    school: 'State University',
    images: [
      'https://picsum.photos/seed/elena1/800/1200',
      'https://picsum.photos/seed/elena2/800/1200',
    ],
    interests: ['Books', 'Poetry', 'Yoga', 'Nature'],
  },
  {
    id: '4',
    name: 'Marcus',
    age: 29,
    bio: 'Fitness freak and tech nerd. Always up for a challenge! 🏋️‍♂️💻',
    distance: '8km away',
    job: 'Software Engineer',
    school: 'Tech Institute',
    images: [
      'https://picsum.photos/seed/marcus1/800/1200',
      'https://picsum.photos/seed/marcus2/800/1200',
    ],
    interests: ['Fitness', 'Coding', 'Running', 'Gadgets'],
  },
];

export const MOCK_MATCHES: Match[] = [
  {
    id: 'm1',
    profile: MOCK_PROFILES[0],
    lastMessage: 'Hey! How was your weekend?',
    timestamp: '2m ago',
    unread: true,
  },
  {
    id: 'm2',
    profile: MOCK_PROFILES[2],
    lastMessage: 'That sounds like a plan!',
    timestamp: '1h ago',
    unread: false,
  },
];
