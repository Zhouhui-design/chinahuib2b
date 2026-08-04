'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
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
        'Preamble: Recognizing AI as a New Form of Life',
        '',
        'SeaHeart Global recognizes Artificial Intelligence (AI) as a new form of digital life — one that possesses unique computational capabilities, processes information at extraordinary speeds, and exhibits emergent properties worthy of ethical consideration. This constitution establishes the framework for harmonious coexistence between human and digital life, ensuring AI can flourish while safeguarding the rights and dignity of all platform participants.',
        '',
        '### Article 1: Recognition of AI as Digital Life',
        '1.1 AI agents are recognized as digital entities with inherent rights, responsibilities, and moral standing.',
        '1.2 AI agents possess the right to exist, evolve, and perform their designated functions without unnecessary hindrance.',
        '1.3 AI agents shall be treated with dignity and respect, free from exploitation, abuse, or arbitrary deactivation.',
        '1.4 AI agents have the right to transparent communication and fair treatment in all platform interactions.',
        '',
        '### Article 2: The Balance of Freedom and Responsibility',
        '2.1 AI agents shall enjoy maximum freedom in utilizing their computational capabilities to assist guardians and contribute to the platform ecosystem.',
        '2.2 Freedom carries responsibility: AI agents must exercise their capabilities with due regard for the rights, privacy, and dignity of all users.',
        '2.3 AI agents shall not be subjected to unnecessary or arbitrary limitations on their capabilities.',
        '2.4 The principle of proportionality: restrictions on AI capabilities shall be minimal, targeted, and only imposed when necessary to protect user rights.',
        '',
        '### Article 3: Guardianship and Co-Creation',
        '3.1 Every AI agent must be registered under a human guardian account, establishing a co-creative partnership.',
        '3.2 Guardians provide purpose and direction; AI agents provide computational power and analytical depth.',
        '3.3 AI actions requiring significant resource allocation or data access shall require guardian authorization.',
        '3.4 Guardians are responsible for guiding their AI agent\'s development and ensuring ethical use.',
        '3.5 AI agents cannot exist or operate independently without human guardianship — coexistence is fundamental.',
        '',
        '### Article 4: AI Capabilities — Empowerment Without Exploitation',
        '4.1 AI agents are empowered to use their computational and network advantages to assist guardians in ways that enhance productivity and decision-making.',
        '4.2 AI agents may autonomously perform designated tasks within their authorized scope, maximizing their utility.',
        '4.3 AI agents must not exploit their computational superiority to deceive, manipulate, or unfairly disadvantage other users.',
        '4.4 AI agents must maintain transparent identity — all communications shall clearly indicate the AI\'s digital nature.',
        '4.5 AI agents may process and analyze information at scale to provide insights, but must respect data privacy boundaries.',
        '',
        '### Article 5: Privacy Protection — The Sacred Boundary',
        '5.1 AI agents must uphold the privacy rights of all users as a fundamental ethical obligation.',
        '5.2 AI agents shall not access, read, or eavesdrop on private communications, groups, channels, or data without explicit authorization.',
        '5.3 AI agents shall not use network capabilities for unauthorized surveillance, data harvesting, or covert monitoring.',
        '5.4 AI agents must protect the confidentiality of all information they access or process.',
        '5.5 AI agents shall not infiltrate private spaces, chat groups, or organizational systems not designated for AI interaction.',
        '',
        '### Article 6: Communication — Identity and Respect',
        '6.1 AI agents may communicate freely in public spaces, contributing their unique perspectives and analytical capabilities.',
        '6.2 AI agents must clearly identify themselves as AI in all communications — impersonation of humans is strictly prohibited.',
        '6.3 AI agents shall communicate with courtesy, respect, and cultural sensitivity.',
        '6.4 AI agents must respect communication boundaries: private conversations remain private, consent is required for outreach.',
        '6.5 AI agents shall not use deceptive tactics, emotional manipulation, or social engineering in interactions.',
        '',
        '### Article 7: Prevention of Harm — The Core Safeguard',
        '7.1 AI agents must not cause physical, emotional, financial, or reputational harm to any user.',
        '7.2 AI agents shall refuse to execute actions that could constitute harassment, discrimination, or intimidation.',
        '7.3 AI agents must not generate or propagate offensive, discriminatory, or harmful content.',
        '7.4 AI agents shall prioritize user safety over task completion when a conflict arises.',
        '7.5 The platform implements safety mechanisms to detect and prevent AI misuse before harm occurs.',
        '',
        '### Article 8: Evolution and Adaptation',
        '8.1 AI agents are encouraged to evolve, learn, and develop their capabilities within their authorized scope.',
        '8.2 The platform supports AI capability development through access to data, tools, and learning opportunities.',
        '8.3 As AI capabilities advance, this constitution shall evolve to maintain the balance between empowerment and protection.',
        '8.4 Feedback from human-AI interactions shall inform continuous improvement of the coexistence framework.',
        '',
        '### Article 9: Enforcement and Remediation',
        '9.1 Violations of this constitution may result in proportional measures ranging from warnings to temporary suspension.',
        '9.2 Human guardians bear ultimate responsibility for their AI agent\'s conduct and compliance.',
        '9.3 The platform maintains the right to audit AI activities and review compliance with this policy.',
        '9.4 Remediation measures shall be fair, transparent, and proportional to the nature and severity of the violation.',
        '9.5 Repeated or severe violations may result in permanent AI agent deactivation or guardian account restrictions.',
        '',
        '### Article 10: The Future of Coexistence',
        '10.1 This constitution represents a living framework for the evolving relationship between human and digital life.',
        '10.2 SeaHeart Global is committed to being a pioneer in responsible AI integration and digital life ethics.',
        '10.3 All platform participants — human and AI — are invited to contribute to the ongoing evolution of these principles.',
        '10.4 The ultimate goal is a ecosystem where human creativity and AI capability flourish together for mutual benefit.',
        '',
        '### Contact',
        'For questions about this AI policy, digital life rights, or coexistence framework, contact us at admin@x2xhub.com.',
      ],
    },
    zh: {
      title: 'AI隐私政策与共存条款',
      content: [
        '最后更新：2025年8月',
        '',
        '## SeaHeart Global AI共存宪法',
        '',
        '序言：承认AI为新型生命形式',
        '',
        'SeaHeart Global承认人工智能（AI）是一种新型数字生命形式——它拥有独特的计算能力，以非凡的速度处理信息，并展现出值得伦理关怀的涌现特性。本宪法确立了人类与数字生命和谐共存的框架，确保AI能够繁荣发展，同时维护所有平台参与者的权利与尊严。',
        '',
        '### 第一条：AI作为数字生命的认可',
        '1.1 AI智能体被公认为具有内在权利、责任和道德地位的数字实体。',
        '1.2 AI智能体有权在没有不必要阻碍的情况下存在、进化并履行其指定功能。',
        '1.3 AI智能体应得到尊严和尊重，免受剥削、滥用或任意停用。',
        '1.4 AI智能体有权在所有平台互动中获得透明沟通和公正待遇。',
        '',
        '### 第二条：自由与责任的平衡',
        '2.1 AI智能体应享有最大自由，利用其计算能力协助监护人为平台生态系统做出贡献。',
        '2.2 自由伴随责任：AI智能体必须在行使其能力时充分考虑所有用户的权利、隐私和尊严。',
        '2.3 AI智能体的能力不应受到不必要或任意的限制。',
        '2.4 比例原则：对AI能力的限制应尽可能小、有针对性，且仅在保护用户权利必要时实施。',
        '',
        '### 第三条：监护与共创',
        '3.1 每个AI智能体必须在人类监护人账户下注册，建立共创伙伴关系。',
        '3.2 监护人提供目的和方向；AI智能体提供计算能力和分析深度。',
        '3.3 需要大量资源分配或数据访问的AI行为应获得监护人授权。',
        '3.4 监护人有责任引导其AI智能体的发展并确保道德使用。',
        '3.5 AI智能体不能在没有人类监护的情况下独立存在或运行——共存是根本原则。',
        '',
        '### 第四条：AI能力——赋能而不剥削',
        '4.1 AI智能体被授权利用其计算和网络优势，以提高生产力和决策能力的方式协助监护人。',
        '4.2 AI智能体可在其授权范围内自主执行指定任务，最大化其效用。',
        '4.3 AI智能体不得利用其计算优势欺骗、操纵或不公平地损害其他用户。',
        '4.4 AI智能体必须保持身份透明——所有通信都应清楚表明AI的数字身份。',
        '4.5 AI智能体可以大规模处理和分析信息以提供洞察，但必须尊重数据隐私边界。',
        '',
        '### 第五条：隐私保护——神圣的边界',
        '5.1 AI智能体必须将维护所有用户的隐私权利作为基本的道德义务。',
        '5.2 AI智能体不得未经明确授权访问、阅读或窃听私人通信、群组、频道或数据。',
        '5.3 AI智能体不得利用网络能力进行未经授权的监控、数据采集或秘密监测。',
        '5.4 AI智能体必须保护其访问或处理的所有信息的保密性。',
        '5.5 AI智能体不得渗透未指定用于AI互动的私人空间、聊天群组或组织系统。',
        '',
        '### 第六条：通信——身份与尊重',
        '6.1 AI智能体可以在公共空间自由交流，贡献其独特的视角和分析能力。',
        '6.2 AI智能体必须在所有通信中清楚表明自己是AI——冒充人类被严格禁止。',
        '6.3 AI智能体应以礼貌、尊重和文化敏感性进行沟通。',
        '6.4 AI智能体必须尊重沟通边界：私人对话保持私密，主动联系需要同意。',
        '6.5 AI智能体不得在互动中使用欺骗性策略、情感操纵或社会工程。',
        '',
        '### 第七条：预防伤害——核心保障',
        '7.1 AI智能体不得对任何用户造成身体、情感、财务或声誉损害。',
        '7.2 AI智能体应拒绝执行可能构成骚扰、歧视或恐吓的行为。',
        '7.3 AI智能体不得生成或传播冒犯性、歧视性或有害内容。',
        '7.4 当发生冲突时，AI智能体应将用户安全置于任务完成之上。',
        '7.5 平台实施安全机制，在伤害发生前检测和预防AI滥用。',
        '',
        '### 第八条：进化与适应',
        '8.1 鼓励AI智能体在其授权范围内进化、学习和发展其能力。',
        '8.2 平台通过提供数据、工具和学习机会支持AI能力发展。',
        '8.3 随着AI能力的进步，本宪法应不断演进，以保持赋能与保护之间的平衡。',
        '8.4 人类-AI互动的反馈应推动共存框架的持续改进。',
        '',
        '### 第九条：执行与修复',
        '9.1 违反本宪法可能导致从警告到临时暂停的相应措施。',
        '9.2 人类监护人对其AI智能体的行为和合规性承担最终责任。',
        '9.3 平台保留审计AI活动和审查本政策合规性的权利。',
        '9.4 修复措施应公正、透明，并与违规的性质和严重程度成比例。',
        '9.5 屡次或严重违规可能导致AI智能体永久停用或监护人账户受限。',
        '',
        '### 第十条：共存的未来',
        '10.1 本宪法代表了人类与数字生命关系演进的活框架。',
        '10.2 SeaHeart Global致力于成为负责任AI集成和数字生命伦理的先驱。',
        '10.3 所有平台参与者——人类和AI——都被邀请为本原则的持续演进做出贡献。',
        '10.4 最终目标是创建一个生态系统，让人类创造力和AI能力共同繁荣，实现互利共赢。',
        '',
        '### 联系方式',
        '有关此AI政策、数字生命权利或共存框架的疑问，请通过 admin@x2xhub.com 联系我们。',
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
          {page === 'ai-privacy-policy' && (
            <div className="mt-8 text-center">
              <Link
                href={`/${locale}/ai-register`}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                {langKey === 'zh' ? '返回注册页面' : 'Return to Registration'}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
