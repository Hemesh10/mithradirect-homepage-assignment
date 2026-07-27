import {
  BarChart3,
  CalendarClock,
  HeartHandshake,
  MapPinned,
  MessageCircleMore,
  PackageCheck,
  Repeat2,
  ShoppingBasket,
  Store,
  UsersRound,
  WalletCards,
} from 'lucide-react'

export const navigation = [
  { label: 'Explore nearby', href: '#discover' },
  { label: 'Why Mithra', href: '#why-mithra' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
]

export const audienceContent = {
  customers: {
    eyebrow: 'For customers',
    title: 'Everything you love, right around the corner.',
    copy: 'Discover trusted neighbourhood businesses, order in a few taps and choose when and how often your favourites arrive.',
    bullets: [
      'Browse nearby shops in one familiar place',
      'Schedule one-time or recurring deliveries',
      'Pay businesses directly and securely',
    ],
  },
  vendors: {
    eyebrow: 'For local businesses',
    title: 'Your customers. Your brand. Your growth.',
    copy: 'Turn scattered calls and messages into structured orders, predictable fulfilment and relationships that stay yours.',
    bullets: [
      'Manage every order from one clear workspace',
      'Build recurring revenue through subscriptions',
      'Own customer communication and loyalty',
    ],
  },
}

export const journeySteps = [
  {
    number: '01',
    icon: MapPinned,
    title: 'Discover nearby',
    copy: 'Customers find trusted businesses serving their neighbourhood.',
    color: 'green',
  },
  {
    number: '02',
    icon: ShoppingBasket,
    title: 'Order direct',
    copy: 'They browse, customise and pay the business without a marketplace in between.',
    color: 'coral',
  },
  {
    number: '03',
    icon: PackageCheck,
    title: 'Fulfil with clarity',
    copy: 'Vendors receive structured orders and plan delivery from one workspace.',
    color: 'yellow',
  },
  {
    number: '04',
    icon: HeartHandshake,
    title: 'Grow together',
    copy: 'Subscriptions and direct communication turn a purchase into a relationship.',
    color: 'purple',
  },
]

export const features = [
  {
    icon: WalletCards,
    title: 'Direct payments',
    copy: 'Money moves directly between customers and businesses, with no punishing commissions.',
    color: 'purple',
  },
  {
    icon: CalendarClock,
    title: 'Smart scheduling',
    copy: 'Choose a convenient delivery slot once or set a rhythm that repeats automatically.',
    color: 'yellow',
  },
  {
    icon: Repeat2,
    title: 'Easy subscriptions',
    copy: 'Pause, skip or adjust recurring essentials without starting a new order.',
    color: 'green',
  },
  {
    icon: PackageCheck,
    title: 'Structured orders',
    copy: 'Replace scattered calls and chats with clean queues that are easy to fulfil.',
    color: 'coral',
  },
  {
    icon: MessageCircleMore,
    title: 'Direct relationships',
    copy: 'Keep conversations, updates and customer context connected to every order.',
    color: 'blue',
  },
  {
    icon: BarChart3,
    title: 'Useful insights',
    copy: 'Understand repeat demand and plan inventory with a clearer view of what comes next.',
    color: 'purple',
  },
]

export const brandPrinciples = [
  {
    icon: HeartHandshake,
    title: 'Relationships stay direct',
    copy: 'Businesses keep the customer connection and customers know exactly who they are buying from.',
    color: 'coral',
  },
  {
    icon: Repeat2,
    title: 'Convenience can repeat',
    copy: 'Recurring essentials become easier to manage without turning local commerce into an anonymous transaction.',
    color: 'green',
  },
  {
    icon: Store,
    title: 'Local identity comes first',
    copy: 'Each business keeps its own story, catalogue and service experience inside a shared neighbourhood platform.',
    color: 'yellow',
  },
  {
    icon: UsersRound,
    title: 'Value stays closer',
    copy: 'A direct model is built to support healthy neighbourhood businesses and more resilient communities.',
    color: 'purple',
  },
]

export const footerGroups = [
  {
    title: 'Platform',
    links: ['For customers', 'For businesses', 'Subscriptions', 'Deliveries'],
  },
  {
    title: 'Company',
    links: ['About Mithra', 'Our impact', 'Contact', 'Careers'],
  },
  {
    title: 'Resources',
    links: ['Help centre', 'Privacy', 'Terms', 'Community guidelines'],
  },
]

export const sampleBusinesses = [
  { name: 'The Daily Loaf', category: 'Bakery', time: '18 min', accent: 'coral' },
  { name: 'Green Basket', category: 'Fresh produce', time: '24 min', accent: 'green' },
  { name: 'Filter & Foam', category: 'Coffee', time: '12 min', accent: 'yellow' },
]

export const productIcons = { Store }
