import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';

const TRANSLATIONS = {
  fr: {
    common: {
      appName: 'LuminaScribe',
      dashboard: 'Tableau de bord',
      generator: 'Générateur',
      templates: 'Modèles',
      history: 'Historique',
      settings: 'Paramètres',
      signOut: 'Déconnexion',
      login: 'Connexion',
      credits: 'Crédits',
      proPlan: 'Plan Pro',
      freePlan: 'Plan Gratuit',
      unlimited: 'Illimité',
      copy: 'Copier',
      copied: 'Copié !',
      delete: 'Supprimer',
      clearAll: 'Tout effacer',
      close: 'Fermer',
      generate: 'Générer la Magie',
      generating: 'Génération...',
      tryAgain: 'Réessayer',
      publish: 'Publier',
      publishing: 'Publication...',
      published: 'Publié !',
      or: 'OU',
      connect: 'Connecter',
      disconnect: 'Déconnecter',
      connected: 'Connecté',
      download: 'Télécharger',
    },
    dashboard: {
      welcome: 'Bon retour, {name}',
      subtitle: "Voici ce qui se passe avec votre contenu aujourd'hui.",
      unlimitedActive: 'Plan Illimité Actif',
      wordsGenerated: 'Mots Générés',
      docsCreated: 'Documents Créés',
      creditsRemaining: 'Crédits Restants',
      refill: 'Recharge en 24h',
      activityOverview: 'Aperçu de l\'activité (7 derniers jours)',
      integrations: 'Intégrations & Comptes Sociaux',
      manageIntegrations: 'Gérez vos comptes connectés pour une publication rapide.',
      proAccess: 'Accès Pro',
      proDescActive: 'Vous profitez actuellement du plan Pro. Savourez votre pouvoir créatif illimité !',
      proDescInactive: 'Débloquez des générations illimitées, des voix de marque personnalisées et un support prioritaire.',
      status: 'Statut',
      active: 'Actif',
      getPro: 'Obtenir l\'Accès Pro',
      quickStart: 'Démarrage Rapide',
      viewAll: 'Voir tout',
      cards: {
        blog: 'Article de Blog',
        insta: 'Légende Instagram',
        email: 'Newsletter Email',
        tweet: 'Tweet'
      }
    },
    generator: {
      input: 'Entrée',
      result: 'Résultat',
      whatToCreate: 'Que voulez-vous créer ?',
      placeholder: 'ex: Un post LinkedIn sur l\'avenir de l\'IA dans le marketing, axé sur l\'efficacité et la créativité...',
      jobTitle: 'Votre Poste / Rôle (Persona IA)',
      jobTitlePlaceholder: 'ex: Responsable Marketing, CEO, Coach...',
      tone: 'Ton',
      length: 'Longueur',
      includeEmojis: 'Inclure des Emojis',
      platform: 'Plateformes (Sélection multiple)',
      generateImage: 'Générer une Image',
      aspectRatio: 'Format Image',
      error: 'Oups ! Quelque chose s\'est mal passé',
      thinking: 'LuminaScribe réfléchit...',
      waiting: 'Votre chef-d\'œuvre vous attend',
      waitingSub: 'Entrez votre prompt à gauche pour commencer',
      noCredits: 'Plus de crédits',
      noCreditsDesc: 'Veuillez attendre 24h pour la recharge ou passer à la version Pro.',
      magicSaved: 'Magie Sauvegardée !',
      magicSavedDesc: 'Retrouvez ceci plus tard dans votre onglet Historique.',
      publishSuccess: 'Contenu publié avec succès sur {platform} !',
      connectModalTitle: 'Autorisation Requise',
      connectModalDesc: 'Pour publier directement sur les plateformes sélectionnées, vous devez connecter vos comptes.',
      missingAccounts: 'Comptes manquants :',
      tones: {
        professional: 'Professionnel',
        casual: 'Décontracté',
        friendly: 'Amical',
        expert: 'Expert',
        inspirational: 'Inspirant',
        witty: 'Spirituel'
      },
      lengths: {
        short: 'Court',
        medium: 'Moyen',
        long: 'Long'
      },
      types: {
        social_post: 'Post Réseaux Sociaux',
        blog_article: 'Article de Blog',
        email: 'Email',
        video_script: 'Script Vidéo',
        product_description: 'Description Produit'
      },
      ratios: {
        square: 'Carré (1:1)',
        landscape: 'Paysage (16:9)',
        portrait: 'Portrait (9:16)'
      }
    },
    templates: {
      title: 'Bibliothèque de Modèles',
      subtitle: 'Choisissez un modèle pour créer du contenu de haute qualité instantanément.',
      useTemplate: 'Utiliser ce modèle',
      example: 'Exemple de résultat :'
    },
    history: {
      title: 'Votre Historique',
      subtitle: 'Consultez et gérez vos générations de contenu passées.',
      emptyTitle: 'Pas encore d\'historique',
      emptyDesc: 'Générez votre premier chef-d\'œuvre pour le voir sauvegardé ici.',
      confirmClear: 'Êtes-vous sûr de vouloir effacer tout l\'historique ?',
      showLess: 'Voir moins',
      readFull: 'Lire tout le contenu',
      prompt: 'Prompt :',
      generatedImage: 'Image Générée'
    },
    login: {
      title: 'Connectez-vous pour accéder à votre espace créatif',
      createTitle: 'Créez votre compte LuminaScribe',
      verifyTitle: 'Vérifiez votre email',
      verifySubtitle: 'Nous avons envoyé un code à 6 chiffres à {email}',
      email: 'Adresse Email',
      password: 'Mot de passe',
      firstName: 'Prénom',
      lastName: 'Nom',
      birthDate: 'Date de naissance',
      verificationCode: 'Code de vérification',
      signIn: 'Se connecter',
      signUp: 'S\'inscrire',
      verify: 'Vérifier',
      noAccount: 'Pas encore de compte ?',
      hasAccount: 'Déjà un compte ?',
      invalid: 'Identifiants invalides',
      invalidCode: 'Code invalide. Essayez 123456.',
      continueWith: 'Continuer avec {provider}'
    }
  },
  en: {
    common: {
      appName: 'LuminaScribe',
      dashboard: 'Dashboard',
      generator: 'Generator',
      templates: 'Templates',
      history: 'History',
      settings: 'Settings',
      signOut: 'Sign Out',
      login: 'Login',
      credits: 'Credits',
      proPlan: 'Pro Plan',
      freePlan: 'Free Plan',
      unlimited: 'Unlimited',
      copy: 'Copy',
      copied: 'Copied!',
      delete: 'Delete',
      clearAll: 'Clear All',
      close: 'Close',
      generate: 'Generate Magic',
      generating: 'Generating...',
      tryAgain: 'Try again',
      publish: 'Publish',
      publishing: 'Publishing...',
      published: 'Published!',
      or: 'OR',
      connect: 'Connect',
      disconnect: 'Disconnect',
      connected: 'Connected',
      download: 'Download',
    },
    dashboard: {
      welcome: 'Welcome back, {name}',
      subtitle: "Here is what's happening with your content today.",
      unlimitedActive: 'Unlimited Plan Active',
      wordsGenerated: 'Words Generated',
      docsCreated: 'Documents Created',
      creditsRemaining: 'Credits Remaining',
      refill: 'Refill in 24h',
      activityOverview: 'Activity Overview (Last 7 Days)',
      integrations: 'Integrations & Social Accounts',
      manageIntegrations: 'Manage your connected accounts for quick publishing.',
      proAccess: 'Pro Access',
      proDescActive: 'You are currently rocking the Pro plan. Enjoy your unlimited creative powers!',
      proDescInactive: 'Unlock unlimited generations, custom brand voices, and priority support.',
      status: 'Status',
      active: 'Active',
      getPro: 'Get Pro Access',
      quickStart: 'Quick Start',
      viewAll: 'View all',
      cards: {
        blog: 'Blog Post',
        insta: 'Instagram Caption',
        email: 'Email Newsletter',
        tweet: 'Tweet'
      }
    },
    generator: {
      input: 'Input',
      result: 'Result',
      whatToCreate: 'What would you like to create?',
      placeholder: 'e.g., A LinkedIn post about the future of AI in marketing, focusing on efficiency and creativity...',
      jobTitle: 'Your Job Title / Role (AI Persona)',
      jobTitlePlaceholder: 'e.g., Marketing Manager, CEO, Fitness Coach...',
      tone: 'Tone',
      length: 'Length',
      includeEmojis: 'Include Emojis',
      platform: 'Platforms (Multi-select)',
      generateImage: 'Generate Image',
      aspectRatio: 'Image Ratio',
      error: 'Oops! Something went wrong',
      thinking: 'LuminaScribe is thinking...',
      waiting: 'Your masterpiece awaits',
      waitingSub: 'Enter your prompt on the left to start',
      noCredits: 'No Credits Remaining',
      noCreditsDesc: 'Please wait 24h for credit refill or upgrade.',
      magicSaved: 'Magic Saved!',
      magicSavedDesc: 'Find this later in your History tab.',
      publishSuccess: 'Content successfully published to {platform}!',
      connectModalTitle: 'Authorization Required',
      connectModalDesc: 'To publish directly to the selected platforms, you must connect your accounts.',
      missingAccounts: 'Missing accounts:',
      tones: {
        professional: 'Professional',
        casual: 'Casual',
        friendly: 'Friendly',
        expert: 'Expert',
        inspirational: 'Inspirational',
        witty: 'Witty'
      },
      lengths: {
        short: 'Short',
        medium: 'Medium',
        long: 'Long'
      },
      types: {
        social_post: 'Social Post',
        blog_article: 'Blog Article',
        email: 'Email',
        video_script: 'Video Script',
        product_description: 'Product Description'
      },
      ratios: {
        square: 'Square (1:1)',
        landscape: 'Landscape (16:9)',
        portrait: 'Portrait (9:16)'
      }
    },
    templates: {
      title: 'Template Library',
      subtitle: 'Choose a template to start creating high-quality content instantly.',
      useTemplate: 'Use Template',
      example: 'Output Example:'
    },
    history: {
      title: 'Your History',
      subtitle: 'View and manage your past content generations.',
      emptyTitle: 'No history yet',
      emptyDesc: 'Generate your first masterpiece to see it saved here automatically.',
      confirmClear: 'Are you sure you want to clear all history?',
      showLess: 'Show Less',
      readFull: 'Read Full Content',
      prompt: 'Prompt:',
      generatedImage: 'Generated Image'
    },
    login: {
      title: 'Sign in to access your creative workspace',
      createTitle: 'Create your LuminaScribe account',
      verifyTitle: 'Verify your email',
      verifySubtitle: 'We sent a 6-digit code to {email}',
      email: 'Email Address',
      password: 'Password',
      firstName: 'First Name',
      lastName: 'Last Name',
      birthDate: 'Date of Birth',
      verificationCode: 'Verification Code',
      signIn: 'Sign In',
      signUp: 'Sign Up',
      verify: 'Verify',
      noAccount: 'Don\'t have an account?',
      hasAccount: 'Already have an account?',
      invalid: 'Invalid credentials',
      invalidCode: 'Invalid code. Try 123456.',
      continueWith: 'Continue with {provider}'
    }
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('fr');

  useEffect(() => {
    const savedLang = localStorage.getItem('ls_lang') as Language;
    if (savedLang) {
      setLanguage(savedLang);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('ls_lang', lang);
  };

  const t = (path: string, params?: Record<string, string>): string => {
    const keys = path.split('.');
    let value: any = TRANSLATIONS[language];
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return path; // Return key if translation not found
      }
    }

    if (typeof value !== 'string') return path;

    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        value = value.replace(`{${key}}`, val);
      });
    }

    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};