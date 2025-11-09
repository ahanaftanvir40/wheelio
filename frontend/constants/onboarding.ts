export interface OnboardingSlide {
  key: string;
  title: string;
  text: string;
  image: any;
}

export const slides: OnboardingSlide[] = [
  {
    key: 'rent',
    title: 'Rent Smartly',
    text: 'Browse verified vehicles near you.',
    image: require('../assets/images/react-logo.png'), // Using placeholder
  },
  {
    key: 'list',
    title: 'List & Earn',
    text: 'Turn your car into income.',
    image: require('../assets/images/react-logo.png'), // Using placeholder
  },
  {
    key: 'chat',
    title: 'Chat & Connect',
    text: 'Talk to owners in real time.',
    image: require('../assets/images/react-logo.png'), // Using placeholder
  },
];
