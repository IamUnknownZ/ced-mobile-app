import type { WasteCategory, WasteItem } from '../types/game';
export const categories: WasteCategory[] = [
  { id: 'general', nameTh: 'General waste', color: '#438cd1', icon: '●' },
  { id: 'recyclable', nameTh: 'Recycling', color: '#eab82a', icon: '♻' },
  { id: 'organic', nameTh: 'Organic waste', color: '#4caa55', icon: '♣' },
  { id: 'hazardous', nameTh: 'Hazardous waste', color: '#dd5251', icon: '!' },
];
// Draft learning copy supplied by the content teammate; local collection rules still need validation.
const originalItems: WasteItem[] = [
  {id:'wrapper',nameTh:'Multilayer snack wrapper',categoryId:'general',explanationTh:'Multilayer wrappers are often difficult to separate for recycling.',disposalTipTh:'Empty the wrapper and check for a specialised local collection point.',modelKey:'wrapper'},
  {id:'dirty-paper',nameTh:'Food-soiled paper',categoryId:'general',explanationTh:'Food and grease can make paper unsuitable for recycling.',disposalTipTh:'Keep it separate from clean paper. Some areas collect it for composting.',modelKey:'dirty-paper'},
  {id:'bottle',nameTh:'Empty plastic water bottle',categoryId:'recyclable',explanationTh:'Many collection points accept plastic bottles for recycling.',disposalTipTh:'Empty it and check local rules for caps and crushing bottles.',modelKey:'bottle'},
  {id:'can',nameTh:'Aluminium can',categoryId:'recyclable',explanationTh:'Aluminium can be recycled into new products.',disposalTipTh:'Empty and clean it as appropriate.',modelKey:'can'},
  {id:'paper',nameTh:'Clean, dry paper',categoryId:'recyclable',explanationTh:'Clean, dry paper can often be recycled.',disposalTipTh:'Keep it dry and check which paper types your collection point accepts.',modelKey:'paper'},
  {id:'banana',nameTh:'Banana peel',categoryId:'organic',explanationTh:'This plant waste is biodegradable.',disposalTipTh:'Separate it from plastic and follow your local organic waste system.',modelKey:'banana'},
  {id:'leaf',nameTh:'Leaves',categoryId:'organic',explanationTh:'Leaves can be collected as organic waste.',disposalTipTh:'Collect them separately for composting or local collection.',modelKey:'leaf'},
  {id:'battery',nameTh:'Used battery',categoryId:'hazardous',explanationTh:'Batteries contain substances and components requiring separate handling.',disposalTipTh:'Keep it separate and take it to a battery or hazardous waste collection point.',modelKey:'battery'},
];
export const additionalItems: WasteItem[] = [
  {id:'plastic-cup',nameTh:'Used plastic cup',categoryId:'recyclable',explanationTh:'Some plastic cups are recyclable where collection facilities accept them.',disposalTipTh:'Empty and clean it as appropriate; check whether the plastic type is accepted.',modelKey:'plastic-cup'},
  {id:'uht-carton',nameTh:'UHT milk carton',categoryId:'recyclable',explanationTh:'Drink cartons contain multiple layers and need a suitable collection point.',disposalTipTh:'Rinse, dry and take it to a carton collection point.',modelKey:'uht-carton'},
  {id:'plastic-bag',nameTh:'Used plastic bag',categoryId:'general',explanationTh:'Some general recycling systems do not accept plastic bags.',disposalTipTh:'Clean, dry bags may be accepted at specialised collection points. Check locally.',modelKey:'plastic-bag'},
  {id:'food',nameTh:'Food scraps',categoryId:'organic',explanationTh:'Food scraps can be collected separately as organic waste.',disposalTipTh:'Remove containers and other materials before using your local collection system.',modelKey:'food'},
  {id:'fluorescent-lamp',nameTh:'Used fluorescent lamp',categoryId:'hazardous',explanationTh:'This type of lamp must be handled carefully.',disposalTipTh:'Avoid breaking it; package it and take it to an appropriate collection point.',modelKey:'fluorescent-lamp'},
  {id:'vegetables',nameTh:'Vegetable scraps',categoryId:'organic',explanationTh:'Vegetable scraps can be collected as organic waste.',disposalTipTh:'Remove bags and rubber bands, then follow local collection rules.',modelKey:'vegetables'},
  {id:'expired-medicine',nameTh:'Expired medicine',categoryId:'hazardous',explanationTh:'Expired medicines should not be used and must be disposed of properly.',disposalTipTh:'In this game it is hazardous waste. Take expired medicine to a healthcare facility or ask a pharmacist.',modelKey:'expired-medicine'},
];

export const parkItems: WasteItem[] = [...originalItems,...additionalItems];
export const guideItems: WasteItem[] = parkItems;
