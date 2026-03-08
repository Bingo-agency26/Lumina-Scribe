
import { Template, Language } from './types';
import { 
  Linkedin, 
  Instagram, 
  FileText, 
  Mail, 
  Youtube, 
  ShoppingBag, 
  Twitter 
} from 'lucide-react';

export const APP_NAME = "LuminaScribe";

const TEMPLATES_DATA = {
  en: [
    {
      id: 'linkedin-expert',
      name: 'LinkedIn Thought Leadership',
      description: 'Share your expertise with a professional, engaging LinkedIn post.',
      promptBase: "Create a professional LinkedIn post demonstrating expertise on: {USER_INPUT}. Structure: Engaging hook, 3-4 bullet points, conclusion with a question.",
      example: "🚀 The Future of AI in Marketing\n\nAI isn't replacing marketers; it's replacing marketers who don't use AI..."
    },
    {
      id: 'instagram-story',
      name: 'Instagram Story',
      description: 'Short, punchy text for stories that drive engagement.',
      promptBase: "Create an engaging Instagram Story text about: {USER_INPUT}. Keep it under 50 words. Include a call to action.",
      example: "Monday mood! ☕️✨ Crushing goals and drinking coffee. Who else is ready for a big week?"
    },
    {
      id: 'seo-blog',
      name: 'SEO Blog Article',
      description: 'A complete, structured blog post optimized for search engines.',
      promptBase: "Write a complete SEO-optimized blog article about: {USER_INPUT}. Include H1, Introduction, 3 H2 sections, and a Conclusion.",
      example: "# The Ultimate Guide to Remote Work\n\nRemote work is here to stay. In this guide, we cover tools..."
    },
    {
      id: 'cold-email',
      name: 'Cold Outreach Email',
      description: 'High-conversion email to introduce your services or products.',
      promptBase: "Write a cold outreach email about: {USER_INPUT}. Subject line must be catchy. Focus on value proposition.",
      example: "Subject: Quick question about your marketing\n\nHi [Name],\n\nI noticed you're scaling fast..."
    },
    {
      id: 'youtube-script',
      name: 'YouTube Video Script',
      description: 'Structured script with hook, content, and CTA.',
      promptBase: "Create a YouTube video script for: {USER_INPUT}. Include: Hook (0-30s), Intro, Main Content (3 points), Conclusion.",
      example: "[HOOK] Want to double your productivity? Watch this.\n[INTRO] Hi everyone! Today we're diving into..."
    },
    {
      id: 'product-desc',
      name: 'E-commerce Description',
      description: 'Persuasive product description that sells benefits.',
      promptBase: "Write a persuasive product description for: {USER_INPUT}. Focus on benefits over features. Use sensory words.",
      example: "Elevate your morning routine with our Artisan Coffee Maker. Crafted from premium stainless steel..."
    },
    {
      id: 'twitter-thread',
      name: 'Viral Twitter Thread',
      description: 'A multi-tweet thread designed to go viral.',
      promptBase: "Create a Twitter thread about: {USER_INPUT}. First tweet is a hook. 5-7 tweets total. Last tweet is a recap/CTA.",
      example: "1/5 I used to hate writing emails. Then I found this framework. 🧵"
    }
  ],
  fr: [
    {
      id: 'linkedin-expert',
      name: 'Leadership d\'opinion LinkedIn',
      description: 'Partagez votre expertise avec un post LinkedIn professionnel et engageant.',
      promptBase: "Créez un post LinkedIn professionnel démontrant une expertise sur : {USER_INPUT}. Structure : Accroche engageante, 3-4 points clés, conclusion avec une question.",
      example: "🚀 L'avenir de l'IA dans le marketing\n\nL'IA ne remplace pas les marketeurs ; elle remplace ceux qui ne l'utilisent pas..."
    },
    {
      id: 'instagram-story',
      name: 'Story Instagram',
      description: 'Texte court et percutant pour des stories qui engagent.',
      promptBase: "Créez un texte de Story Instagram engageant sur : {USER_INPUT}. Moins de 50 mots. Inclure un appel à l'action.",
      example: "Humeur du lundi ! ☕️✨ On atteint nos objectifs avec un bon café. Qui est prêt pour cette semaine ?"
    },
    {
      id: 'seo-blog',
      name: 'Article de Blog SEO',
      description: 'Un article de blog complet et structuré, optimisé pour les moteurs de recherche.',
      promptBase: "Écrivez un article de blog complet optimisé SEO sur : {USER_INPUT}. Inclure H1, Introduction, 3 sections H2 et une Conclusion.",
      example: "# Le guide ultime du télétravail\n\nLe télétravail est là pour durer. Dans ce guide, nous couvrons les outils..."
    },
    {
      id: 'cold-email',
      name: 'Email de Prospection',
      description: 'Email à haute conversion pour présenter vos services ou produits.',
      promptBase: "Écrivez un email de prospection à propos de : {USER_INPUT}. L'objet doit être accrocheur. Concentrez-vous sur la proposition de valeur.",
      example: "Objet : Question rapide sur votre marketing\n\nBonjour [Nom],\n\nJ'ai remarqué votre croissance rapide..."
    },
    {
      id: 'youtube-script',
      name: 'Script Vidéo YouTube',
      description: 'Script structuré avec accroche, contenu et appel à l\'action.',
      promptBase: "Créez un script vidéo YouTube pour : {USER_INPUT}. Inclure : Accroche (0-30s), Intro, Contenu principal (3 points), Conclusion.",
      example: "[ACCROCHE] Vous voulez doubler votre productivité ? Regardez ça.\n[INTRO] Bonjour à tous ! Aujourd'hui..."
    },
    {
      id: 'product-desc',
      name: 'Description E-commerce',
      description: 'Description de produit persuasive qui vend les bénéfices.',
      promptBase: "Écrivez une description de produit persuasive pour : {USER_INPUT}. Concentrez-vous sur les bénéfices plutôt que les fonctionnalités.",
      example: "Élevez votre routine matinale avec notre Cafetière Artisanale. Fabriquée en acier inoxydable premium..."
    },
    {
      id: 'twitter-thread',
      name: 'Thread Twitter Viral',
      description: 'Un fil de plusieurs tweets conçu pour devenir viral.',
      promptBase: "Créez un thread Twitter sur : {USER_INPUT}. Le premier tweet est une accroche. 5-7 tweets au total. Le dernier tweet est un récap/CTA.",
      example: "1/5 Je détestais écrire des emails. Puis j'ai trouvé ce système. 🧵"
    }
  ]
};

const STATIC_CONFIGS = [
  { id: 'linkedin-expert', type: 'social_post', iconName: 'Linkedin', defaultParams: { tone: 'professional', length: 'medium', includeEmojis: true, platforms: ['linkedin'] } },
  { id: 'instagram-story', type: 'social_post', iconName: 'Instagram', defaultParams: { tone: 'casual', length: 'short', includeEmojis: true, platforms: ['instagram'] } },
  { id: 'seo-blog', type: 'blog_article', iconName: 'FileText', defaultParams: { tone: 'expert', length: 'long', includeEmojis: false } },
  { id: 'cold-email', type: 'email', iconName: 'Mail', defaultParams: { tone: 'professional', length: 'short', includeEmojis: false, goal: 'conversion' } },
  { id: 'youtube-script', type: 'video_script', iconName: 'Youtube', defaultParams: { tone: 'friendly', length: 'long', includeEmojis: false } },
  { id: 'product-desc', type: 'product_description', iconName: 'ShoppingBag', defaultParams: { tone: 'inspirational', length: 'medium', includeEmojis: false } },
  { id: 'twitter-thread', type: 'social_post', iconName: 'Twitter', defaultParams: { tone: 'witty', length: 'medium', includeEmojis: false, platforms: ['twitter'] } },
];

export const getTemplates = (lang: Language): Template[] => {
  const translations = TEMPLATES_DATA[lang];
  return STATIC_CONFIGS.map(config => {
    const translation = translations.find(t => t.id === config.id);
    return {
      ...config,
      ...translation,
      // Fallbacks just in case
      name: translation?.name || '',
      description: translation?.description || '',
      promptBase: translation?.promptBase || '',
      example: translation?.example || ''
    } as Template;
  });
};
