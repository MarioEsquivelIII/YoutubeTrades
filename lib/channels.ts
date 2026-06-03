import type { Channel } from "./types";

// Seed list of well-known finance YouTubers shown as toggle chips in the filter.
// Users can also type in any other channel name (free-text) on top of these.
export const CHANNELS: Channel[] = [
  { id: "meetkevin", name: "Meet Kevin", handle: "MeetKevin" },
  { id: "grahamstephan", name: "Graham Stephan", handle: "GrahamStephan" },
  { id: "andreijikh", name: "Andrei Jikh", handle: "AndreiJikh" },
  { id: "josephcarlson", name: "Joseph Carlson", handle: "JosephCarlson" },
  { id: "tomnash", name: "Tom Nash", handle: "TomNash" },
  { id: "financialeducation", name: "Financial Education", handle: "FinancialEducationJeremy" },
  { id: "clearvaluetax", name: "ClearValue Tax", handle: "ClearValueTax" },
  { id: "stockmoe", name: "Stock Moe", handle: "StockMoe" },
  { id: "everythingmoney", name: "Everything Money", handle: "EverythingMoney" },
  { id: "tickersymbolyou", name: "Ticker Symbol: YOU", handle: "TickerSymbolYOU" },
  { id: "ziptrader", name: "ZipTrader", handle: "ZipTrader" },
  { id: "minoritymindset", name: "Minority Mindset", handle: "MinorityMindset" },
  { id: "brianjung", name: "Brian Jung", handle: "BrianJung" },
  { id: "humphreyyang", name: "Humphrey Yang", handle: "HumphreyYang" },
  { id: "newmoney", name: "New Money", handle: "NewMoneyYT" },
  { id: "patrickboyle", name: "Patrick Boyle", handle: "PBoyleFinance" },
  { id: "nateobrien", name: "Nate O'Brien", handle: "NateOBrien" },
  { id: "mattkohrs", name: "Matt Kohrs", handle: "MattKohrs" },
  { id: "josephhogue", name: "Joseph Hogue", handle: "JosephHogue" },
  { id: "marktilbury", name: "Mark Tilbury", handle: "MarkTilbury" },
  { id: "damientalksmoney", name: "Damien Talks Money", handle: "DamienTalksMoney" },
  { id: "theplainbagel", name: "The Plain Bagel", handle: "ThePlainBagel" },
  { id: "rosehan", name: "Rose Han", handle: "RoseHan" },
  { id: "calltoleap", name: "Call to Leap", handle: "CalltoLeap" },
  { id: "bravosresearch", name: "Bravos Research", handle: "BravosResearch" },
  { id: "danielpronk", name: "Daniel Pronk", handle: "DanielPronk" },
];

export const channelName = (id: string): string =>
  CHANNELS.find((c) => c.id === id)?.name ?? id;
