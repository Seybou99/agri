/**
 * Clés de traduction de l'application SeneGundo.
 * Toute nouvelle chaîne traduite doit être ajoutée ici.
 */
export interface Translations {
  // ── Commun ──────────────────────────────────────────────────────────────────
  common: {
    cancel: string;
    confirm: string;
    save: string;
    delete: string;
    back: string;
    yes: string;
    no: string;
    loading: string;
    error: string;
    success: string;
    comingSoon: string;
    comingSoonMsg: string;
  };

  // ── Navigation / onglets ────────────────────────────────────────────────────
  tabs: {
    home: string;
    stats: string;
    market: string;
    messages: string;
  };

  // ── Profil ──────────────────────────────────────────────────────────────────
  profile: {
    title: string;
    notConnected: string;
    notConnectedMsg: string;
    signIn: string;
    createAccount: string;
    sectionAgricultural: string;
    sectionMarket: string;
    sectionAcademy: string;
    sectionAccount: string;
    myReports: string;
    myReportsSubtitle: string;
    myCart: string;
    myPurchases: string;
    mySales: string;
    myGuidesBought: string;
    myGuidesSold: string;
    settings: string;
    settingsSubtitle: string;
    signOut: string;
    signOutConfirmTitle: string;
    signOutConfirmMsg: string;
    statPurchases: string;
    statSales: string;
    statCart: string;
    articles: string;
    orders: string;
    guides: string;
    soldItems: string;
    cartItems: string;
    cartEmpty: string;
    ordersHistory: string;
    salesHistory: string;
    guidesBought: string;
    guidesPublished: string;
  };

  // ── Paramètres ──────────────────────────────────────────────────────────────
  settings: {
    title: string;
    // Compte
    sectionAccount: string;
    editProfile: string;
    editProfileSub: string;
    changePassword: string;
    language: string;
    // Notifications
    sectionNotifications: string;
    notifWeather: string;
    notifDiagnostic: string;
    notifMarket: string;
    // Application
    sectionApp: string;
    offlineMode: string;
    surfaceUnit: string;
    clearCache: string;
    clearCacheSub: string;
    clearCacheConfirmTitle: string;
    clearCacheConfirmMsg: string;
    clearCacheSuccess: string;
    clearCacheSuccessMsg: string;
    // À propos
    sectionAbout: string;
    appVersion: string;
    contactSupport: string;
    contactSupportSub: string;
    contactAlertTitle: string;
    contactAlertMsg: string;
    // Alertes modales
    editProfileSoonTitle: string;
    editProfileSoonMsg: string;
    changePasswordSoonTitle: string;
    changePasswordSoonMsg: string;
  };
}

export type LanguageCode = 'fr' | 'en' | 'bm' | 'ff' | 'snk' | 'tmh' | 'son';
export type SurfaceUnit = 'ha' | 'acres';
