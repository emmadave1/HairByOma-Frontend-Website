import hero from "@/assets/hairbyoma-hero.jpg";
import deep from "@/assets/deep-wave.jpg";
import bob from "@/assets/bob-wig.jpg";
import bounce from "@/assets/layered-bounce.jpg";
import type { Review } from "@/types";
export const gallery = [
  { id: "1", category: "Hair", title: "Silky signature lengths", image: hero },
  { id: "2", category: "New Arrivals", title: "Deep wave bundles", image: deep },
  { id: "3", category: "Wigs", title: "The Oma Bob", image: bob },
  { id: "4", category: "Client Looks", title: "Layered bounce", image: bounce },
  { id: "5", category: "Packaging", title: "Luxury presentation", image: deep },
  { id: "6", category: "Before & After", title: "Soft transformation", image: hero },
];
export const reviews: Review[] = [
  {
    id: "1",
    name: "Adaeze N.",
    product: "Signature Bone Straight",
    rating: 5,
    text: "The movement is beautiful and the finish feels incredibly polished. It arrived carefully presented.",
    verified: true,
    image: hero,
  },
  {
    id: "2",
    name: "Tomi A.",
    product: "Layered Bounce Luxe",
    rating: 5,
    text: "The curls are full without feeling heavy. I received so many compliments on my first wear.",
    verified: true,
    image: bounce,
  },
  {
    id: "3",
    name: "Ifeoma C.",
    product: "Midnight Deep Wave",
    rating: 4,
    text: "Soft, defined and easy to style. The consultation helped me choose the right length.",
    verified: false,
    image: deep,
  },
];
export const faqs = [
  [
    "What makes HairbyOma hair different?",
    "Our mock catalogue presents carefully selected luxury textures, clear options and a consultation-led customer experience. Final quality specifications will be confirmed with the official product catalogue.",
  ],
  [
    "How do I choose the right length?",
    "Use our visual length guide as a starting point. The finished appearance varies with your height, texture, curls and styling.",
  ],
  [
    "Can I choose a custom colour?",
    "Yes. Use the Custom Wig request form to prepare your preferred colour and style. A future backend will submit the request.",
  ],
  [
    "Do you offer installment payments?",
    "Installment terms will appear here when the client supplies the final policy. No payment is processed in this frontend demonstration.",
  ],
  [
    "How does delivery work?",
    "Port Harcourt pickup and dispatch options are available. Nationwide timeframes and fees will be finalized by the client.",
  ],
  [
    "Can I exchange or return hair?",
    "Final refund and exchange conditions must be inserted from the client’s approved policy text before launch.",
  ],
  [
    "How do rewards and referrals work?",
    "The dashboards preview points, referral history and progress. Tracking and rewards are not active until backend integration.",
  ],
  [
    "Can I submit a review?",
    "The review form supports ratings and media previews locally. Publishing requires the future review service.",
  ],
];
