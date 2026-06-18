/**
 * Bambara (Bamanankan) — langue la plus parlée au Mali (~50% locuteurs)
 */
import type { Translations } from './types';
import fr from './fr';

const bm: Translations = {
  ...fr, // fallback français pour les chaînes non traduites
  common: {
    ...fr.common,
    cancel: 'A to',
    confirm: 'Ayi',
    save: 'Maracogo',
    delete: 'Jɔsi',
    back: 'Kɔsɛgi',
    yes: 'Awo',
    no: 'Ayi',
    loading: 'Kɔnɔko tɛ…',
    error: 'Fili',
    success: 'Diya',
    comingSoon: 'Pɔɔ bɛ na',
    comingSoonMsg: 'Nin baara bɛ na version korolanin na.',
  },
  profile: {
    ...fr.profile,
    title: 'N ka kunnafonili',
    notConnected: 'Ni ma don',
    notConnectedMsg: 'Dɔn i yɛrɛ la ka sɔrɔ i ka kunnafonili, rapɔrɔw ani ka sarali.',
    signIn: 'Don',
    createAccount: 'Compte kura dayɛlɛ',
    sectionAgricultural: 'Sɛnɛkɛba',
    sectionMarket: 'Jakuma',
    sectionAcademy: 'Kalanso',
    sectionAccount: 'Compte',
    myReports: 'N ka rapɔrɔw',
    myReportsSubtitle: 'Diagnostik kunnafoni · Internet tɛ',
    myCart: 'N ka panier',
    myPurchases: 'N sara fɛnw',
    mySales: 'N ci fɛnw',
    settings: 'A labɛnni',
    settingsSubtitle: 'Ɲɛtaa, kunnafoniw, kan',
    signOut: 'Bɔ',
    signOutConfirmTitle: 'Bɔ',
    signOutConfirmMsg: 'I b\'a fɛ ka bɔ tiɲɛ?',
    statPurchases: 'Sarali',
    statSales: 'Ci',
    statCart: 'Panier',
  },
  settings: {
    ...fr.settings,
    title: 'A labɛnni',
    sectionAccount: 'N ka compte',
    editProfile: 'Profil yɛlɛma',
    changePassword: 'Gundo sɛbɛn yɛlɛma',
    language: 'Kan',
    sectionNotifications: 'Kunnafoniw',
    notifWeather: 'Lajɛ kunnafoni',
    notifDiagnostic: 'Diagnostik hakili',
    notifMarket: 'Jakuma kunnafoni',
    sectionApp: 'App',
    offlineMode: 'Internet tɛ mode',
    surfaceUnit: 'Jɔnjɔn kawiliba',
    clearCache: 'Cache bɔ',
    clearCacheSub: 'Fɛn gɛlɛn halɛ',
    sectionAbout: 'Mɔgɔ dɔn',
    appVersion: 'App version',
    contactSupport: 'Dɛmɛ ɲini',
    contactSupportSub: 'support@senegundo.com',
  },
};

export default bm;
