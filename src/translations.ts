export type Language = 'en' | 'ta' | 'te' | 'hi';

export interface TranslationDictionary {
  appName: string;
  dashboard: string;
  schedule: string;
  chores: string;
  gallery: string;
  directory: string;
  chat: string;
  settings: string;
  history: string;
  logout: string;
  welcomeBack: string;
  roomNumber: string;
  activeStatus: string;
  saveSettings: string;
  languageSelect: string;
  upcomingSchedules: string;
  pointsStanding: string;
  announcements: string;
  recentMessages: string;
  voteAsAdmin: string;
  electedAdmin: string;
  consensusVote: string;
  democraticallyElect: string;
  currentElectedAdmin: string;
  roommateDirectory: string;
  connectAndElect: string;
  activeOrganizer: string;
  noActiveAdmin: string;
  viewProfile: string;
  roommatesConnected: string;
  privateRoommates: string;
  houseGroupChat: string;
  commonRoom: string;
  typeMessage: string;
  send: string;
  themePreference: string;
  accentColor: string;
  personalBio: string;
  saveSuccess: string;
  rewards: string;
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    appName: "adengappa 7 peru",
    dashboard: "Dashboard",
    schedule: "Schedule",
    chores: "Chores",
    gallery: "Gallery",
    directory: "Roommates",
    chat: "Chat Room",
    settings: "Settings",
    history: "History & Archives",
    logout: "Log Out",
    welcomeBack: "Welcome back",
    roomNumber: "Room",
    activeStatus: "Active",
    saveSettings: "Save Settings Changes",
    languageSelect: "Language",
    upcomingSchedules: "Upcoming House Schedules",
    pointsStanding: "Point Standings",
    announcements: "Announcements Board",
    recentMessages: "Recent Messages",
    voteAsAdmin: "Vote as House Admin",
    electedAdmin: "House Admin",
    consensusVote: "Consensus",
    democraticallyElect: "Democratically Elect our House Admin",
    currentElectedAdmin: "Current Elected House Admin",
    roommateDirectory: "Roommate Directory",
    connectAndElect: "Connect and elect active leadership with the roommates in your shared space.",
    activeOrganizer: "Active Organizer",
    noActiveAdmin: "No active House Admin has been elected yet. Every roommate gets 1 vote to choose who holds active organizer status.",
    viewProfile: "View Full Profile",
    roommatesConnected: "roommates connected",
    privateRoommates: "Private Roommates",
    houseGroupChat: "House Group Chat",
    commonRoom: "Common Room",
    typeMessage: "Type a message...",
    send: "Send",
    themePreference: "Select Board Theme",
    accentColor: "Select Accent Color",
    personalBio: "Personal Bio Info",
    saveSuccess: "Profile settings successfully saved!",
    rewards: "Rewards & Standings",
  },
  ta: {
    appName: "அடேங்கப்பா 7 பேரு",
    dashboard: "முகப்பு",
    schedule: "கால அட்டவணை",
    chores: "வீட்டு வேலைகள்",
    gallery: "கேலரி",
    directory: "அறை நண்பர்கள்",
    chat: "அரட்டை அறை",
    settings: "அமைப்புகள்",
    history: "வரலாறு",
    logout: "வெளியேறு",
    welcomeBack: "மீண்டும் வருக",
    roomNumber: "அறை எண்",
    activeStatus: "செயலில் உள்ளது",
    saveSettings: "அமைப்புகளைச் சேமிக்கவும்",
    languageSelect: "மொழி",
    upcomingSchedules: "வரவிருக்கும் வீட்டு அட்டவணைகள்",
    pointsStanding: "மதிப்பெண் தரவரிசை",
    announcements: "அறிவிப்பு பலகை",
    recentMessages: "சமீபத்திய செய்திகள்",
    voteAsAdmin: "நிர்வாகிக்கு வாக்களிக்கவும்",
    electedAdmin: "வீட்டு நிர்வாகி",
    consensusVote: "வாக்குகள்",
    democraticallyElect: "நமது வீட்டு நிர்வாகியை ஜனநாயக ரீதியாக தேர்ந்தெடுங்கள்",
    currentElectedAdmin: "தற்போதைய தேர்ந்தெடுக்கப்பட்ட வீட்டு நிர்வாகி",
    roommateDirectory: "அறை நண்பர்கள் பட்டியல்",
    connectAndElect: "அறை நண்பர்களுடன் இணைந்து செயல்பட்டு உங்கள் வீட்டு நிர்வாகியைத் தேர்ந்தெடுக்கவும்.",
    activeOrganizer: "செயலில் உள்ள ஒருங்கிணைப்பாளர்",
    noActiveAdmin: "இதுவரை எந்த வீட்டு நிர்வாகியும் தேர்ந்தெடுக்கப்படவில்லை. ஒவ்வொரு அறை நண்பருக்கும் 1 வாக்கு உண்டு.",
    viewProfile: "முழு சுயவிவரத்தைக் காண்க",
    roommatesConnected: "அறை நண்பர்கள் இணைக்கப்பட்டுள்ளனர்",
    privateRoommates: "தனியார் அரட்டைகள்",
    houseGroupChat: "வீட்டு குழு அரட்டை",
    commonRoom: "பொது அறை",
    typeMessage: "செய்தியைத் தட்டச்சு செய்க...",
    send: "அனுப்பு",
    themePreference: "பலகை தீம் தேர்வு",
    accentColor: "வண்ணத் தேர்வு",
    personalBio: "சுயசரிதை தகவல்",
    saveSuccess: "சுயவிவர அமைப்புகள் வெற்றிகரமாக சேமிக்கப்பட்டன!",
    rewards: "வெகுமதிகள் & மதிப்பெண்கள்",
  },
  te: {
    appName: "అడెంగప్ప 7 పేరు",
    dashboard: "డాష్‌బోర్డ్",
    schedule: "షెడ్యూల్",
    chores: "ఇంటి పనులు",
    gallery: "గ్యాలరీ",
    directory: "రూమ్మేట్స్",
    chat: "చాట్ రూమ్",
    settings: "సెట్టింగులు",
    history: "చరిత్ర",
    logout: "లాగ్ అవుట్",
    welcomeBack: "స్వాగతం",
    roomNumber: "గది సంఖ్య",
    activeStatus: "యాక్టివ్",
    saveSettings: "సెట్టింగులను సేవ్ చేయి",
    languageSelect: "భాష",
    upcomingSchedules: "రాబోయే ఇంటి షెడ్యూల్స్",
    pointsStanding: "పాయింట్ల స్టాండింగ్స్",
    announcements: "ప్రకటనల బోర్డు",
    recentMessages: "ఇటీవలి సందేశాలు",
    voteAsAdmin: "అడ్మిన్ గా ఓటు వేయండి",
    electedAdmin: "హౌస్ అడ్మిన్",
    consensusVote: "ఓట్లు",
    democraticallyElect: "ప్రజాస్వామ్యయుతంగా మన హౌస్ అడ్మిన్‌ను ఎన్నుకోండి",
    currentElectedAdmin: "ప్రస్తుత ఎన్నికైన హౌస్ అడ్మిన్",
    roommateDirectory: "రూమ్‌మేట్ డైరెక్టరీ",
    connectAndElect: "రూమ్‌మేట్స్‌తో కనెక్ట్ అవ్వండి మరియు మీ హౌస్ అడ్మిన్‌ను ఎన్నుకోండి.",
    activeOrganizer: "యాక్టివ్ ఆర్గనైజర్",
    noActiveAdmin: "ఇంతవరకు ఎవరూ హౌస్ అడ్మిన్‌గా ఎన్నిక కాలేదు. ప్రతి రూమ్‌మేట్‌కు 1 ఓటు ఉంటుంది.",
    viewProfile: "పూర్తి ప్రొఫైల్ చూడండి",
    roommatesConnected: "రూమ్‌మేట్స్ కనెక్ట్ అయ్యారు",
    privateRoommates: "ప్రైవేట్ రూమ్‌మేట్స్",
    houseGroupChat: "హౌస్ గ్రూప్ చాట్",
    commonRoom: "కామన్ రూమ్",
    typeMessage: "సందేశాన్ని టైప్ చేయండి...",
    send: "పంపండి",
    themePreference: "బోర్డు థీమ్ ఎంచుకోండి",
    accentColor: "రంగు ఎంచుకోండి",
    personalBio: "వ్యక్తిగత బయో సమాచారం",
    saveSuccess: "ప్రొఫైల్ సెట్టింగ్‌లు విజయవంతంగా సేవ్ చేయబడ్డాయి!",
    rewards: "రివార్డులు & పాయింట్లు",
  },
  hi: {
    appName: "अडेंगाप्पा 7 पेरू",
    dashboard: "डैशबोर्ड",
    schedule: "अनुसूची",
    chores: "घर के काम",
    gallery: "गैलरी",
    directory: "रूममेट्स",
    chat: "चैट रूम",
    settings: "सेटिंग्स",
    history: "इतिहास",
    logout: "लॉग आउट",
    welcomeBack: "स्वागत है",
    roomNumber: "कमरा",
    activeStatus: "सक्रिय",
    saveSettings: "सेटिंग्स सहेजें",
    languageSelect: "भाषा",
    upcomingSchedules: "आने वाली घर की अनुसूची",
    pointsStanding: "अंक तालिका",
    announcements: "घोषणा बोर्ड",
    recentMessages: "हाल के संदेश",
    voteAsAdmin: "एडमिन के रूप में वोट करें",
    electedAdmin: "हाउस एडमिन",
    consensusVote: "वोट",
    democraticallyElect: "लोकतांत्रिक तरीके से हमारे हाउस एडमिन का चुनाव करें",
    currentElectedAdmin: "वर्तमान निर्वाचित हाउस एडमिन",
    roommateDirectory: "रूममेट डायरेक्टरी",
    connectAndElect: "रूममेट्स से जुड़ें और सक्रिय लीडरशिप का चुनाव करें।",
    activeOrganizer: "सक्रिय आयोजक",
    noActiveAdmin: "अभी तक कोई सक्रिय हाउस एडमिन नहीं चुना गया है। प्रत्येक रूममेट को 1 वोट मिलता है।",
    viewProfile: "पूरी प्रोफाइल देखें",
    roommatesConnected: "रूममेट्स जुड़े हुए हैं",
    privateRoommates: "निजी रूममेट्स",
    houseGroupChat: "हाउस ग्रुप चैट",
    commonRoom: "सामान्य कमरा",
    typeMessage: "संदेश टाइप करें...",
    send: "भेजें",
    themePreference: "बोर्ड थीम चुनें",
    accentColor: "रंग चुनें",
    personalBio: "व्यक्तिगत बायो जानकारी",
    saveSuccess: "प्रोफाइल सेटिंग्स सफलतापूर्वक सहेजी गईं!",
    rewards: "पुरस्कार और अंक तालिका",
  }
};
