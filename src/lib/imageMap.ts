import espressoImg from '@/assets/espresso.jpg';
import latteImg from '@/assets/latte-art.jpg';
import cappuccinoImg from '@/assets/cappuccino.jpg';
import icedImg from '@/assets/iced-coffee.jpg';
import mochaImg from '@/assets/mocha.jpg';
import flatWhiteImg from '@/assets/flat-white.jpg';
import matchaImg from '@/assets/matcha.jpg';
import coffeeArtImg from '@/assets/coffee-art.jpg';
import latteBlueImg from '@/assets/latte-blue.jpg';
import coffeeBeansImg from '@/assets/coffee-beans.jpg';
import brownieImg from '@/assets/brownie.jpg';
import brownieIcecreamImg from '@/assets/brownie-icecream.jpg';
import sandwichImg from '@/assets/grilled-sandwich.jpg';
import ceramicMugImg from '@/assets/ceramic-mug.jpg';
import travelTumblerImg from '@/assets/travel-tumbler.jpg';
import canvasToteImg from '@/assets/canvas-tote.jpg';
import brewKitImg from '@/assets/brew-kit.jpg';
import samosaImg from '@/assets/samosa.jpg';
import chickenTikkaImg from '@/assets/chicken-tikka.jpg';
import loadedFriesImg from '@/assets/loaded-fries.jpg';
import chickenBunImg from '@/assets/chicken-bun.jpg';
import waterImg from '@/assets/water.jpg';
import sparklingWaterImg from '@/assets/sparkling-water.jpg';
import flavourSyrupImg from '@/assets/flavour-syrup.jpg';
import croissantImg from '@/assets/croissant.jpg';
import gallery1 from '@/assets/gallery-1.jpg';
import gallery2 from '@/assets/gallery-2.jpg';
import gallery3 from '@/assets/gallery-3.jpg';
import gallery4 from '@/assets/gallery-4.jpg';
import gallery5 from '@/assets/gallery-5.jpg';
import gallery6 from '@/assets/gallery-6.jpg';
import gallery7 from '@/assets/gallery-7.jpg';
import gallery8 from '@/assets/gallery-8.jpg';
import gallery9 from '@/assets/gallery-9.jpg';

export const imageMap: Record<string, string> = {
  espresso: espressoImg,
  latte: latteImg,
  cappuccino: cappuccinoImg,
  iced: icedImg,
  mocha: mochaImg,
  'flat-white': flatWhiteImg,
  matcha: matchaImg,
  'coffee-art': coffeeArtImg,
  'latte-blue': latteBlueImg,
  'coffee-beans': coffeeBeansImg,
  brownie: brownieImg,
  'brownie-icecream': brownieIcecreamImg,
  sandwich: sandwichImg,
  'ceramic-mug': ceramicMugImg,
  'travel-tumbler': travelTumblerImg,
  'canvas-tote': canvasToteImg,
  'brew-kit': brewKitImg,
  samosa: samosaImg,
  'chicken-tikka': chickenTikkaImg,
  'loaded-fries': loadedFriesImg,
  'chicken-bun': chickenBunImg,
  water: waterImg,
  'sparkling-water': sparklingWaterImg,
  'flavour-syrup': flavourSyrupImg,
  croissant: croissantImg,
  'gallery-1': gallery1,
  'gallery-2': gallery2,
  'gallery-3': gallery3,
  'gallery-4': gallery4,
  'gallery-5': gallery5,
  'gallery-6': gallery6,
  'gallery-7': gallery7,
  'gallery-8': gallery8,
  'gallery-9': gallery9,
};

export const getImage = (key: string): string => imageMap[key] || espressoImg;
