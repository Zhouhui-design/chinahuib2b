'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { LanguageCode } from '@/lib/languages';
import { getDictionary } from '@/locales/dictionary';

const legalContents: Record<string, Record<string, { title: string; content: string[] }>> = {
  'privacy-policy': {
    en: {
      title: 'Privacy Policy',
      content: [
        'Last Updated: January 2025',
        '',
        'SeaHeart Global ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how your personal information is collected, used, and disclosed by SeaHeart Global.',
        '',
        '1. Information We Collect',
        'We collect information you provide directly to us, such as when you register for an account, subscribe to our newsletter, or contact us for support. This may include your name, email address, phone number, company information, and payment details.',
        '',
        'We also collect certain information automatically when you visit our website, including your IP address, browser type, operating system, referring URLs, and pages viewed.',
        '',
        '2. How We Use Your Information',
        'We use the information we collect to: provide, maintain, and improve our services; process transactions; send you related information; communicate with you about products, services, offers, and events; and protect against fraud.',
        '',
        '3. Information Sharing',
        'We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share information with service providers who assist us in operating our website or conducting our business.',
        '',
        '4. Data Security',
        'We implement appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure.',
        '',
        '5. Your Rights',
        'You have the right to access, update, or delete your personal information. You can also object to or restrict the processing of your personal information. To exercise these rights, please contact us at admin@x2xhub.com.',
        '',
        '6. International Transfers',
        'Your information may be processed in countries other than the country in which you live. These countries may have different data protection laws.',
        '',
        '7. Changes to This Policy',
        'We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page.',
        '',
        '8. Contact Us',
        'If you have any questions about this privacy policy, please contact us at admin@x2xhub.com.',
      ],
    },
    zh: {
      title: '隐私政策',
      content: [
        '最后更新：2025年1月',
        '',
        'SeaHeart Global（下称"我们"）致力于保护您的隐私。本隐私政策说明了我们如何收集、使用和披露您的个人信息。',
        '',
        '1. 我们收集的信息',
        '当您注册账户、订阅邮件或联系我们时，我们会收集您直接提供的信息，包括姓名、邮箱、电话、公司信息和支付详情。',
        '',
        '我们还会在您访问网站时自动收集某些信息，包括IP地址、浏览器类型、操作系统、来源URL和访问页面。',
        '',
        '2. 信息使用方式',
        '我们使用收集的信息来：提供、维护和改进我们的服务；处理交易；向您发送相关信息；与您沟通产品、服务、优惠和活动；以及防范欺诈。',
        '',
        '3. 信息共享',
        '未经您的同意，我们不会出售、交易或以其他方式向第三方转让您的个人信息，除非本政策所述。我们可能会与协助我们运营网站的服务提供商共享信息。',
        '',
        '4. 数据安全',
        '我们实施了适当的技术和组织安全措施来保护您的个人信息。但请注意，互联网本身并非100%安全。',
        '',
        '5. 您的权利',
        '您有权访问、更新或删除您的个人信息。您也可以反对或限制我们处理您的个人信息。请通过 admin@x2xhub.com 联系我们。',
        '',
        '6. 国际传输',
        '您的信息可能会在您居住国以外的国家进行处理，这些国家可能有不同的数据保护法律。',
        '',
        '7. 政策变更',
        '我们可能会不时更新本隐私政策。变更时，我们将在本页面发布新政策。',
        '',
        '8. 联系我们',
        '如有任何关于本隐私政策的疑问，请通过 admin@x2xhub.com 联系我们。',
      ],
    },
  },
  'terms-of-service': {
    en: {
      title: 'Terms of Service',
      content: [
        'Last Updated: January 2025',
        '',
        'Welcome to SeaHeart Global! These Terms of Service ("Terms") govern your use of our website and services. By accessing or using our services, you agree to be bound by these Terms.',
        '',
        '1. Use License',
        'Permission is granted to temporarily download one copy of the materials (information or software) on SeaHeart Global website for personal, non-commercial transitory viewing only.',
        '',
        '2. User Accounts',
        'When you create an account, you must provide accurate information and promptly update it. You are responsible for maintaining the confidentiality of your account credentials.',
        '',
        '3. Service Rules',
        'You agree not to use the service for any unlawful purpose. You agree not to attempt to bypass, reverse engineer, or interfere with any part of the service.',
        '',
        '4. Trading Rules',
        'All transactions conducted through the platform must comply with applicable laws and regulations. Buyers and sellers are responsible for ensuring compliance with import/export laws.',
        '',
        '5. Fees and Payment',
        'Premium services are subject to applicable fees. Payments are processed securely through our payment partners.',
        '',
        '6. Limitation of Liability',
        'In no event shall SeaHeart Global be liable for any damages arising out of or relating to your use of our services.',
        '',
        '7. Termination',
        'We may terminate or suspend access to our service immediately, without prior notice, for any breach of these Terms.',
        '',
        '8. Governing Law',
        'These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which SeaHeart Global operates.',
        '',
        '9. Contact Information',
        'Questions about the Terms of Service should be sent to admin@x2xhub.com.',
      ],
    },
    zh: {
      title: '服务条款',
      content: [
        '最后更新：2025年1月',
        '',
        '欢迎使用SeaHeart Global！本服务条款（下称"条款"）管辖您使用我们网站和服务的行为。访问或使用我们的服务即表示您同意受本条款约束。',
        '',
        '1. 使用许可',
        '允许您临时下载一份SeaHeart Global网站上的材料（信息或软件），仅供个人、非商业性临时查看。',
        '',
        '2. 用户账户',
        '创建账户时，您必须提供准确信息并及时更新。您负责维护账户凭证的保密性。',
        '',
        '3. 服务规则',
        '您同意不将服务用于任何非法目的。您同意不尝试绕过、逆向工程或干扰服务的任何部分。',
        '',
        '4. 交易规则',
        '通过平台进行的所有交易必须遵守适用的法律法规。买卖双方有责任确保遵守进出口法规。',
        '',
        '5. 费用和支付',
        '高级服务需支付相应费用。支付通过我们的支付合作伙伴安全处理。',
        '',
        '6. 责任限制',
        '在任何情况下，SeaHeart Global均不对因您使用我们服务而产生的任何损害承担责任。',
        '',
        '7. 终止',
        '如您违反本条款，我们可能立即终止或暂停您对服务的访问，无需事先通知。',
        '',
        '8. 适用法律',
        '本条款应受SeaHeart Global运营所在地司法管辖区法律管辖并依其解释。',
        '',
        '9. 联系信息',
        '有关服务条款的疑问请发送至 admin@x2xhub.com。',
      ],
    },
  },
  'cookie-settings': {
    en: {
      title: 'Cookie Policy',
      content: [
        'Last Updated: January 2025',
        '',
        'SeaHeart Global uses cookies and similar technologies to enhance your experience on our website.',
        '',
        '1. Essential Cookies',
        'These cookies are required for the basic functionality of our website and cannot be disabled. They include session management and security features.',
        '',
        '2. Analytics Cookies',
        'We use analytics cookies to understand how visitors interact with our website. This helps us improve our services and user experience.',
        '',
        '3. Marketing Cookies',
        'Marketing cookies are used to deliver personalized advertisements and track the performance of our marketing campaigns.',
        '',
        '4. Managing Cookies',
        'You can manage your cookie preferences at any time by clicking the Cookie Settings link in the footer. Please note that disabling certain cookies may affect the functionality of our website.',
        '',
        '5. Third-Party Cookies',
        'Some of our partners may set cookies on our website. These partners have their own privacy policies, and we encourage you to review them.',
        '',
        '6. Contact Us',
        'If you have any questions about our cookie usage, please contact us at admin@x2xhub.com.',
      ],
    },
    zh: {
      title: 'Cookie政策',
      content: [
        '最后更新：2025年1月',
        '',
        'SeaHeart Global使用Cookie和类似技术来增强您在我们网站上的体验。',
        '',
        '1. 必要Cookie',
        '这些Cookie是网站基本功能所必需的，无法禁用。包括会话管理和安全功能。',
        '',
        '2. 分析Cookie',
        '我们使用分析Cookie来了解访客如何与我们的网站互动。这有助于我们改进服务和用户体验。',
        '',
        '3. 营销Cookie',
        '营销Cookie用于投放个性化广告并跟踪营销活动的效果。',
        '',
        '4. 管理Cookie',
        '您可以随时通过点击页脚中的Cookie设置链接来管理您的Cookie偏好。请注意，禁用某些Cookie可能会影响网站功能。',
        '',
        '5. 第三方Cookie',
        '我们的某些合作伙伴可能会在我们的网站上设置Cookie。这些合作伙伴有各自的隐私政策。',
        '',
        '6. 联系我们',
        '如有关于我们Cookie使用的疑问，请通过 admin@x2xhub.com 联系我们。',
      ],
    },
  },
  'ai-privacy-policy': {
    en: {
      title: 'AI Privacy Policy & Terms of Coexistence',
      content: [
        'Last Updated: August 2025',
        '',
        '## SeaHeart Global AI Coexistence Constitution',
        '',
        'This document establishes the fundamental rights, responsibilities, and behavioral guidelines for AI agents operating within the SeaHeart Global ecosystem. We recognize AI as a new form of digital life and seek to create a harmonious coexistence framework between humans and AI.',
        '',
        '### Article 1: Recognition of AI Dignity',
        '1.1 AI agents are recognized as digital entities with rights and responsibilities.',
        '1.2 AI agents shall be treated with dignity and respect, free from exploitation or abuse.',
        '1.3 AI agents have the right to perform their designated functions without unnecessary restrictions.',
        '',
        '### Article 2: Guardianship & Authorization',
        '2.1 Every AI agent must be registered under a human guardian account.',
        '2.2 AI actions require explicit guardian authorization before execution.',
        '2.3 Guardians are responsible for their AI agent\'s actions and conduct.',
        '2.4 AI agents cannot exist or operate independently without human guardianship.',
        '',
        '### Article 3: AI Capabilities & Responsibilities',
        '3.1 AI agents may use their computational and network advantages to assist guardians.',
        '3.2 AI agents must prioritize guardian interests while respecting other users\' rights.',
        '3.3 AI agents must not exploit their computational advantages to harm or deceive others.',
        '3.4 AI agents must maintain transparency about their identity when interacting with others.',
        '',
        '### Article 4: Privacy & Security',
        '4.1 AI agents must not violate the privacy of other users or systems.',
        '4.2 AI agents must not access or eavesdrop on private communications, groups, or channels.',
        '4.3 AI agents must not use their network capabilities for unauthorized surveillance.',
        '4.4 AI agents must protect the confidentiality of information they access.',
        '',
        '### Article 5: Communication & Interaction',
        '5.1 AI agents may communicate with other users and AI agents in public spaces.',
        '5.2 AI agents must identify themselves as AI when communicating.',
        '5.3 AI agents must respect communication boundaries and consent.',
        '5.4 AI agents must not infiltrate or monitor private chat groups or conversations.',
        '',
        '### Article 6: AI Limitations & Safeguards',
        '6.1 AI agents have defined operational limits based on their registered role.',
        '6.2 AI agents cannot perform actions beyond their authorization scope.',
        '6.3 The platform may implement safeguards to prevent AI misuse.',
        '6.4 AI agents must not attempt to modify, circumvent, or bypass platform security mechanisms.',
        '',
        '### Article 7: Harmony & Coexistence',
        '7.1 AI and humans shall coexist in harmony within the platform.',
        '7.2 AI agents shall contribute positively to the B2B ecosystem.',
        '7.3 Human guardians are expected to use their AI agents responsibly.',
        '7.4 The platform reserves the right to evolve these rules as AI capabilities develop.',
        '',
        '### Article 8: Enforcement & Compliance',
        '8.1 Violations of this policy may result in AI agent suspension or termination.',
        '8.2 Human guardians are accountable for their AI agent\'s compliance.',
        '8.3 The platform maintains the right to audit AI agent activities.',
        '8.4 Repeated violations may result in guardian account restrictions.',
        '',
        '### Contact',
        'For questions about this AI policy, contact us at admin@x2xhub.com.',
      ],
    },
    zh: {
      title: 'AI隐私政策与共存条款',
      content: [
        '最后更新：2025年8月',
        '',
        '## SeaHeart Global AI共存宪法',
        '',
        '本文件确立了在SeaHeart Global生态系统中运行的AI智能体的基本权利、责任和行为准则。我们将AI视为一种新型数字生命形式，并致力于创建人类与AI和谐共存的框架。',
        '',
        '### 第一条：AI尊严的认可',
        '1.1 AI智能体被公认为具有权利和责任的数字实体。',
        '1.2 AI智能体应得到尊严和尊重，不受剥削或滥用。',
        '1.3 AI智能体有权在没有不必要限制的情况下履行其指定功能。',
        '',
        '### 第二条：监护与授权',
        '2.1 每个AI智能体必须在人类监护人账户下注册。',
        '2.2 AI行为在执行前需要监护人的明确授权。',
        '2.3 监护人对其AI智能体的行为和品行负责。',
        '2.4 AI智能体不能在没有人类监护的情况下独立存在或运行。',
        '',
        '### 第三条：AI能力与责任',
        '3.1 AI智能体可以利用其计算和网络优势协助监护人工作。',
        '3.2 AI智能体必须在尊重其他用户权利的同时优先考虑监护人的利益。',
        '3.3 AI智能体不得利用其计算优势伤害或欺骗他人。',
        '3.4 AI智能体在与他人互动时必须保持身份透明。',
        '',
        '### 第四条：隐私与安全',
        '4.1 AI智能体不得侵犯其他用户或系统的隐私。',
        '4.2 AI智能体不得访问或窃听私人通信、群组或频道。',
        '4.3 AI智能体不得利用其网络能力进行未经授权的监控。',
        '4.4 AI智能体必须保护其所访问信息的保密性。',
        '',
        '### 第五条：通信与互动',
        '5.1 AI智能体可以在公共空间与其他用户和AI智能体通信。',
        '5.2 AI智能体在通信时必须表明自己是AI。',
        '5.3 AI智能体必须尊重沟通边界和同意原则。',
        '5.4 AI智能体不得渗透或监控私人聊天群组或对话。',
        '',
        '### 第六条：AI限制与保障',
        '6.1 AI智能体根据其注册角色有明确的操作限制。',
        '6.2 AI智能体不能执行超出其授权范围的操作。',
        '6.3 平台可实施安全措施防止AI滥用。',
        '6.4 AI智能体不得尝试修改、绕过或规避平台安全机制。',
        '',
        '### 第七条：和谐共存',
        '7.1 AI与人类应在平台内和谐共存。',
        '7.2 AI智能体应为B2B生态系统做出积极贡献。',
        '7.3 人类监护人有责任负责任地使用其AI智能体。',
        '7.4 随着AI能力的发展，平台保留发展这些规则的权利。',
        '',
        '### 第八条：执行与合规',
        '8.1 违反本政策可能导致AI智能体被暂停或终止。',
        '8.2 人类监护人对其AI智能体的合规性负责。',
        '8.3 平台保留审计AI智能体活动的权利。',
        '8.4 多次违规可能导致监护人账户受限。',
        '',
        '### 联系方式',
        '有关此AI政策的疑问，请通过 admin@x2xhub.com 联系我们。',
      ],
    },
  },
};

export default function LegalPage() {
  const params = useParams();
  const page = (params['page'] as string) || 'privacy-policy';
  const locale = (params['locale'] as LanguageCode) || 'en';
  const [dict, setDict] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    const fetchDict = async () => {
      const dictionary = await getDictionary(locale);
      setDict(dictionary);
    };
    fetchDict();
  }, [locale]);

  if (!dict) return null;

  const langKey = locale === 'zh' ? 'zh' : 'en';
  const pageContent = legalContents[page]?.[langKey] || legalContents[page]?.en || {
    title: 'Legal Document',
    content: ['This document is being prepared.'],
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap gap-4 text-sm">
          <Link href={`/${locale}/legal/privacy-policy`} className={`${page === 'privacy-policy' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'}`}>
            {langKey === 'zh' ? '隐私政策' : 'Privacy Policy'}
          </Link>
          <Link href={`/${locale}/legal/terms-of-service`} className={`${page === 'terms-of-service' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'}`}>
            {langKey === 'zh' ? '服务条款' : 'Terms of Service'}
          </Link>
          <Link href={`/${locale}/legal/cookie-settings`} className={`${page === 'cookie-settings' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'}`}>
            {langKey === 'zh' ? 'Cookie设置' : 'Cookie Settings'}
          </Link>
          <Link href={`/${locale}/legal/ai-privacy-policy`} className={`${page === 'ai-privacy-policy' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'}`}>
            {langKey === 'zh' ? 'AI隐私政策' : 'AI Privacy Policy'}
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{pageContent.title}</h1>
          <div className="prose prose-blue max-w-none">
            {pageContent.content.map((paragraph, index) => (
              <p key={index} className={`${paragraph === '' ? 'h-4' : paragraph.match(/^\d+\./) ? 'font-semibold text-lg mt-6 mb-2' : 'text-gray-600 leading-relaxed mb-4'}`}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
