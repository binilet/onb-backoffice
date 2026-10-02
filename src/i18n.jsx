import { createContext, useContext, useEffect, useMemo, useState } from "react";
import mediaEn from "./locales/siteMedia/en.json";
import mediaAm from "./locales/siteMedia/am.json";
import mediaOm from "./locales/siteMedia/om.json";
const mediaTranslations = { en: mediaEn, am: mediaAm, om: mediaOm };

export const languageOptions = [
  { code: "en", label: "English", shortLabel: "EN" },
  { code: "am", label: "አማርኛ", shortLabel: "አማ" },
  { code: "om", label: "Afaan Oromoo", shortLabel: "OM" },
];

const translations = {
  en: {
    language: "Language",
    english: "English",
    amharic: "Amharic",
    oromo: "Afaan Oromoo",
    dashboard: "Dashboard",
    users: "Users",
    admins: "Admins",
    agents: "Agents",
    games: "Games",
    invite: "Invite",
    credits: "Credits",
    manualDeposits: "Manual Deposits",
    manualWithdraws: "Manual Withdraws",
    autoPlay: "Auto Play",
    finance: "Finance",
    hagereOnline: "Hagere Online",
    hagereShops: "Hagere Shops",
    logout: "Logout",
    openNavigation: "Open navigation",
    closeNavigation: "Close navigation",
    useLightTheme: "Use light theme",
    useDarkTheme: "Use dark theme",
    shopBalance: "Your Shop Balance",
    noScope: "No scope",
    guest: "Guest",
    signIn: "Sign in",
    adminConsole: "Admin console — sign in to continue",
    signInHelp: "Use your registered phone number and password.",
    phoneNumber: "Phone number",
    password: "Password",
    hidePassword: "Hide password",
    showPassword: "Show password",
    expired: "Your session expired. Please sign in again.",
    requiredCredentials: "Please enter both phone number and password.",
    authorizedOnly: "Hagere Online admin console · Authorized personnel only",
    shopRoleNotice: "This area only shows data and actions available to your shop role.",
    shopManagement: "Shop management",
    shops: "Shops",
    staff: "Staff",
    balances: "Balances",
    playerRoomWallets: "Player room wallets",
    depositApprovals: "Deposit approvals",
    actionLog: "Action log",
  },
  am: {
    language: "ቋንቋ",
    english: "እንግሊዝኛ",
    amharic: "አማርኛ",
    oromo: "አፋን ኦሮሞ",
    dashboard: "ዳሽቦርድ",
    users: "ተጠቃሚዎች",
    admins: "አስተዳዳሪዎች",
    agents: "ወኪሎች",
    games: "ጨዋታዎች",
    invite: "ግብዣ",
    credits: "ክሬዲቶች",
    manualDeposits: "በእጅ ገቢዎች",
    manualWithdraws: "በእጅ ወጪዎች",
    autoPlay: "ራስ-ሰር ጨዋታ",
    finance: "ፋይናንስ",
    hagereOnline: "ሀገሬ ኦንላይን",
    hagereShops: "ሀገሬ ሱቆች",
    logout: "ውጣ",
    openNavigation: "ማውጫ ክፈት",
    closeNavigation: "ማውጫ ዝጋ",
    useLightTheme: "ብርሃን ገጽታ ተጠቀም",
    useDarkTheme: "ጨለማ ገጽታ ተጠቀም",
    shopBalance: "የሱቅ ሂሳብዎ",
    noScope: "ምንም ወሰን የለም",
    guest: "እንግዳ",
    signIn: "ግባ",
    adminConsole: "የአስተዳዳሪ ማዕከል — ለመቀጠል ይግቡ",
    signInHelp: "የተመዘገበ ስልክ ቁጥርዎን እና የይለፍ ቃልዎን ይጠቀሙ።",
    phoneNumber: "ስልክ ቁጥር",
    password: "የይለፍ ቃል",
    hidePassword: "የይለፍ ቃል ደብቅ",
    showPassword: "የይለፍ ቃል አሳይ",
    expired: "የክፍለ ጊዜዎ አልቋል። እንደገና ይግቡ።",
    requiredCredentials: "እባክዎ ስልክ ቁጥር እና የይለፍ ቃል ያስገቡ።",
    authorizedOnly: "የሀገሬ ኦንላይን አስተዳዳሪ ማዕከል · ለተፈቀደላቸው ሰዎች ብቻ",
    shopRoleNotice: "ይህ ክፍል ለሱቅ ሚናዎ የተፈቀዱ መረጃዎችን እና ተግባሮችን ብቻ ያሳያል።",
    shopManagement: "የሱቅ አስተዳደር",
    shops: "ሱቆች",
    staff: "ሰራተኞች",
    balances: "ሂሳቦች",
    playerRoomWallets: "የተጫዋች ክፍል ቦርሳዎች",
    depositApprovals: "የገቢ ማጽደቂያዎች",
    actionLog: "የተግባር መዝገብ",
  },
  om: {
    language: "Afaan",
    english: "English",
    amharic: "Amaariffa",
    oromo: "Afaan Oromoo",
    dashboard: "Daashboordii",
    users: "Fayyadamtoota",
    admins: "Bulchitoota",
    agents: "Ergamtota",
    games: "Taphawwan",
    invite: "Afeerraa",
    credits: "Kireediti",
    manualDeposits: "Galii harka keessaa",
    manualWithdraws: "Baasi harka keessaa",
    autoPlay: "Tapha ofumaan",
    finance: "Faayinaansii",
    hagereOnline: "Hagere Online",
    hagereShops: "Dukaana Hagere",
    logout: "Ba'i",
    openNavigation: "Qajeelfama bani",
    closeNavigation: "Qajeelfama cufi",
    useLightTheme: "Bifa ifaa fayyadami",
    useDarkTheme: "Bifa dukkanaa fayyadami",
    shopBalance: "Haftee Dukaanii Keessanii",
    noScope: "Daangaa hin qabne",
    guest: "Keessummaa",
    signIn: "Seeni",
    adminConsole: "Kuusaa bulchiinsaa — itti fufuuf seeni",
    signInHelp: "Lakkoofsa bilbilaa fi jecha icciitii galmeessitan fayyadamaa.",
    phoneNumber: "Lakkoofsa bilbilaa",
    password: "Jecha icciitii",
    hidePassword: "Jecha icciitii dhoksi",
    showPassword: "Jecha icciitii agarsiisi",
    expired: "Yeroon seensaa kee dhumeera. Irra deebi'ii seeni.",
    requiredCredentials: "Mee lakkoofsa bilbilaa fi jecha icciitii galchi.",
    authorizedOnly: "Kuusaa bulchiinsaa Hagere Online · Hojjettoota eeyyamamaniif qofa",
    shopRoleNotice: "Kutaan kun odeeffannoo fi tarkaanfiiwwan gahee dukaanaa keetiif hayyamaman qofa agarsiisa.",
    shopManagement: "Bulchiinsa dukaanii",
    shops: "Dukaana",
    staff: "Hojjettoota",
    balances: "Hafteewwan",
    playerRoomWallets: "Boorsaa kutaa taphataa",
    depositApprovals: "Mirkaneessa galii",
    actionLog: "Galmee tarkaanfii",
  },
};

const LanguageContext = createContext(null);

function readInitialLanguage() {
  try {
    const saved = localStorage.getItem("admin-language");
    return languageOptions.some((option) => option.code === saved) ? saved : "en";
  } catch {
    return "en";
  }
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(readInitialLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
    try {
      localStorage.setItem("admin-language", language);
    } catch {
      // Language choice remains available for this session when storage is blocked.
    }
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage,
    t: (key) => key.startsWith("media.")
      ? mediaTranslations[language]?.[key.slice(6)] || mediaEn[key.slice(6)] || key
      : translations[language]?.[key] || translations.en[key] || key,
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
