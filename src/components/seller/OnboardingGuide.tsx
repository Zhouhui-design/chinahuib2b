'use client'

import { useState, useEffect } from 'react'
import { ChevronRight, CheckCircle, Circle, X, HelpCircle, ArrowRight } from 'lucide-react'
import { useSellerLanguage } from '@/hooks/useSellerLanguage'

type Task = {
  id: string
  title: string
  description: string
  completed: boolean
  action?: () => void
}

type OnboardingGuideProps = {
  onClose: () => void
}

export default function OnboardingGuide({ onClose }: OnboardingGuideProps) {
  const language = useSellerLanguage()
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0)
  const [isExpanded, setIsExpanded] = useState(true)
  
  // Translations for tasks
  const taskTranslations = {
    complete_profile: {
      title: language === 'zh' ? '完善您的资料' :
             language === 'ja' ? 'プロフィールを完成させる' :
             language === 'ar' ? 'أكمل ملفك الشخصي' :
             language === 'es' ? 'Completa tu perfil' :
             language === 'fr' ? 'Complétez votre profil' :
             language === 'de' ? 'Vervollständigen Sie Ihr Profil' :
             language === 'ko' ? '프로필 완성하기' :
             language === 'ru' ? 'Заполните профиль' :
             language === 'pt' ? 'Complete seu perfil' :
             language === 'hi' ? 'अपनी प्रोफ़ाइल पूरी करें' :
             language === 'th' ? 'กรอกโปรไฟล์ของคุณให้สมบูรณ์' :
             language === 'vi' ? 'Hoàn thành hồ sơ của bạn' :
             'Complete Your Profile',
      description: language === 'zh' ? '添加您的公司信息、徽标和联系详情，以建立买家的信任。' :
                   language === 'ja' ? 'バイヤーの信頼を築くために、会社情報、ロゴ、連絡先詳細を追加してください。' :
                   language === 'ar' ? 'أضف معلومات شركتك وشعارك وتفاصيل الاتصال لبناء الثقة مع المشترين.' :
                   language === 'es' ? 'Agrega la información de tu empresa, logotipo y detalles de contacto para generar confianza con los compradores.' :
                   language === 'fr' ? 'Ajoutez les informations de votre entreprise, votre logo et vos coordonnées pour instaurer la confiance avec les acheteurs.' :
                   language === 'de' ? 'Fügen Sie Ihre Unternehmensinformationen, Logo und Kontaktdetails hinzu, um Vertrauen bei Käufern aufzubauen.' :
                   language === 'ko' ? '구매자의 신뢰를 쌓기 위해 회사 정보, 로고 및 연락처 세부 정보를 추가하세요.' :
                   language === 'ru' ? 'Добавьте информацию о компании, логотип и контактные данные, чтобы вызвать доверие у покупателей.' :
                   language === 'pt' ? 'Adicione as informações da sua empresa, logotipo e detalhes de contato para construir confiança com os compradores.' :
                   language === 'hi' ? 'खरीदारों के साथ विश्वास बनाने के लिए अपनी कंपनी की जानकारी, लोगो और संपर्क विवरण जोड़ें।' :
                   language === 'th' ? 'เพิ่มข้อมูลบริษัท โลโก้ และรายละเอียดการติดต่อของคุณเพื่อสร้างความไว้วางใจกับผู้ซื้อ' :
                   language === 'vi' ? 'Thêm thông tin công ty, logo và chi tiết liên hệ của bạn để xây dựng niềm tin với người mua.' :
                   'Add your company information, logo, and contact details to build trust with buyers.',
    },
    add_first_product: {
      title: language === 'zh' ? '添加您的第一个产品' :
             language === 'ja' ? '最初の製品を追加' :
             language === 'ar' ? 'أضف منتجك الأول' :
             language === 'es' ? 'Agrega tu primer producto' :
             language === 'fr' ? 'Ajoutez votre premier produit' :
             language === 'de' ? 'Fügen Sie Ihr erstes Produkt hinzu' :
             language === 'ko' ? '첫 번째 제품 추가' :
             language === 'ru' ? 'Добавьте первый продукт' :
             language === 'pt' ? 'Adicione seu primeiro produto' :
             language === 'hi' ? 'अपना पहला उत्पाद जोड़ें' :
             language === 'th' ? 'เพิ่มสินค้าชิ้นแรกของคุณ' :
             language === 'vi' ? 'Thêm sản phẩm đầu tiên của bạn' :
             'Add Your First Product',
      description: language === 'zh' ? '创建您的第一个产品列表，包括图片、描述和定价。' :
                   language === 'ja' ? '画像、説明、価格設定を含む最初の製品リストを作成してください。' :
                   language === 'ar' ? 'أنشئ قائمة منتجاتك الأولى مع الصور والوصف والأسعار.' :
                   language === 'es' ? 'Crea tu primera lista de productos con imágenes, descripción y precios.' :
                   language === 'fr' ? 'Créez votre première fiche produit avec des images, une description et des prix.' :
                   language === 'de' ? 'Erstellen Sie Ihren ersten Produkteintrag mit Bildern, Beschreibung und Preisen.' :
                   language === 'ko' ? '이미지, 설명 및 가격이 포함된 첫 번째 제품 목록을 만드세요.' :
                   language === 'ru' ? 'Создайте свой первый список продуктов с изображениями, описанием и ценами.' :
                   language === 'pt' ? 'Crie sua primeira lista de produtos com imagens, descrição e preços.' :
                   language === 'hi' ? 'छवियों, विवरण और मूल्य निर्धारण के साथ अपनी पहली उत्पाद सूची बनाएं।' :
                   language === 'th' ? 'สร้างรายการสินค้าชิ้นแรกของคุณพร้อมรูปภาพ คำอธิบาย และราคา' :
                   language === 'vi' ? 'Tạo danh sách sản phẩm đầu tiên của bạn với hình ảnh, mô tả và giá cả.' :
                   'Create your first product listing with images, description, and pricing.',
    },
    upload_brochure: {
      title: language === 'zh' ? '上传产品宣传册' :
             language === 'ja' ? '製品パンフレットをアップロード' :
             language === 'ar' ? 'تحميل كتيب المنتج' :
             language === 'es' ? 'Subir folleto del producto' :
             language === 'fr' ? 'Télécharger la brochure du produit' :
             language === 'de' ? 'Produktbroschüre hochladen' :
             language === 'ko' ? '제품 브로셔 업로드' :
             language === 'ru' ? 'Загрузить брошюру продукта' :
             language === 'pt' ? 'Carregar folheto do produto' :
             language === 'hi' ? 'उत्पाद ब्रोशर अपलोड करें' :
             language === 'th' ? 'อัปโหลดโบรชัวร์สินค้า' :
             language === 'vi' ? 'Tải lên tài liệu sản phẩm' :
             'Upload Product Brochure',
      description: language === 'zh' ? '添加 PDF 宣传册，为潜在买家提供详细的产品信息。' :
                   language === 'ja' ? 'PDF パンフレットを追加して、潜在的なバイヤーに詳細な製品情報を提供してください。' :
                   language === 'ar' ? 'أضف كتيب PDF لتقديم معلومات مفصلة عن المنتج للمشترين المحتملين.' :
                   language === 'es' ? 'Agrega un folleto PDF para proporcionar información detallada del producto a los compradores potenciales.' :
                   language === 'fr' ? 'Ajoutez une brochure PDF pour fournir des informations détaillées sur le produit aux acheteurs potentiels.' :
                   language === 'de' ? 'Fügen Sie eine PDF-Broschüre hinzu, um potenziellen Käufern detaillierte Produktinformationen bereitzustellen.' :
                   language === 'ko' ? '잠재 구매자에게 자세한 제품 정보를 제공하기 위해 PDF 브로셔를 추가하세요.' :
                   language === 'ru' ? 'Добавьте PDF-брошюру, чтобы предоставить потенциальным покупателям подробную информацию о продукте.' :
                   language === 'pt' ? 'Adicione um folheto em PDF para fornecer informações detalhadas do produto aos compradores em potencial.' :
                   language === 'hi' ? 'संभावित खरीदारों को विस्तृत उत्पाद जानकारी प्रदान करने के लिए एक PDF ब्रोशर जोड़ें।' :
                   language === 'th' ? 'เพิ่มโบรชัวร์ PDF เพื่อให้ข้อมูลผลิตภัณฑ์โดยละเอียดแก่ผู้ซื้อที่มีศักยภาพ' :
                   language === 'vi' ? 'Thêm tài liệu PDF để cung cấp thông tin chi tiết về sản phẩm cho người mua tiềm năng.' :
                   'Add a PDF brochure to provide detailed product information to potential buyers.',
    },
    customize_store: {
      title: language === 'zh' ? '定制您的店铺' :
             language === 'ja' ? 'ストアをカスタマイズ' :
             language === 'ar' ? 'تخصيص متجرك' :
             language === 'es' ? 'Personaliza tu tienda' :
             language === 'fr' ? 'Personnalisez votre magasin' :
             language === 'de' ? 'Passen Sie Ihren Store an' :
             language === 'ko' ? '스토어 사용자 지정' :
             language === 'ru' ? 'Настройте свой магазин' :
             language === 'pt' ? 'Personalize sua loja' :
             language === 'hi' ? 'अपनी स्टोर को अनुकूलित करें' :
             language === 'th' ? 'ปรับแต่งร้านของคุณ' :
             language === 'vi' ? 'Tùy chỉnh cửa hàng của bạn' :
             'Customize Your Store',
      description: language === 'zh' ? '选择您的展位主题颜色和布局，让您的店铺脱颖而出。' :
                   language === 'ja' ? 'ブースのテーマカラーとレイアウトを選択して、ストアを目立たせましょう。' :
                   language === 'ar' ? 'اختر لون ومخطط جناحك لتميز متجرك.' :
                   language === 'es' ? 'Elige el color temático y el diseño de tu stand para destacar tu tienda.' :
                   language === 'fr' ? 'Choisissez la couleur thème et la disposition de votre stand pour faire ressortir votre magasin.' :
                   language === 'de' ? 'Wählen Sie Ihre Stand-Farbthema und Layout, um Ihren Store hervorzuheben.' :
                   language === 'ko' ? '부스 테마 색상과 레이아웃을 선택하여 스토어를 돋보이게 하세요.' :
                   language === 'ru' ? 'Выберите цвет темы и макет вашего стенда, чтобы выделить свой магазин.' :
                   language === 'pt' ? 'Escolha a cor temática e o layout do seu estande para destacar sua loja.' :
                   language === 'hi' ? 'अपनी स्टोर को अलग दिखाने के लिए अपने बूथ का थीम रंग और लेआउट चुनें।' :
                   language === 'th' ? 'เลือกสีธีมและเลย์เอาต์ของบูธเพื่อให้ร้านของคุณโดดเด่น' :
                   language === 'vi' ? 'Chọn màu chủ đề và bố cục gian hàng của bạn để làm cho cửa hàng nổi bật.' :
                   'Choose your booth theme color and layout to make your store stand out.',
    },
    publish_products: {
      title: language === 'zh' ? '发布所有产品' :
             language === 'ja' ? 'すべての製品を公開' :
             language === 'ar' ? 'نشر جميع المنتجات' :
             language === 'es' ? 'Publicar todos los productos' :
             language === 'fr' ? 'Publier tous les produits' :
             language === 'de' ? 'Alle Produkte veröffentlichen' :
             language === 'ko' ? '모든 제품 게시' :
             language === 'ru' ? 'Опубликовать все продукты' :
             language === 'pt' ? 'Publicar todos os produtos' :
             language === 'hi' ? 'सभी उत्पाद प्रकाशित करें' :
             language === 'th' ? 'เผยแพร่สินค้าทั้งหมด' :
             language === 'vi' ? 'Xuất bản tất cả sản phẩm' :
             'Publish All Products',
      description: language === 'zh' ? '确保您的所有产品都已发布并对买家可见。' :
                   language === 'ja' ? 'すべての製品が公開され、バイヤーに表示されるようにしてください。' :
                   language === 'ar' ? 'تأكد من نشر جميع منتجاتك ومرئية للمشترين.' :
                   language === 'es' ? 'Asegúrate de que todos tus productos estén publicados y visibles para los compradores.' :
                   language === 'fr' ? 'Assurez-vous que tous vos produits sont publiés et visibles par les acheteurs.' :
                   language === 'de' ? 'Stellen Sie sicher, dass alle Ihre Produkte veröffentlicht und für Käufer sichtbar sind.' :
                   language === 'ko' ? '모든 제품이 게시되어 구매자에게 표시되도록 하세요.' :
                   language === 'ru' ? 'Убедитесь, что все ваши продукты опубликованы и видны покупателям.' :
                   language === 'pt' ? 'Certifique-se de que todos os seus produtos estão publicados e visíveis para os compradores.' :
                   language === 'hi' ? 'सुनिश्चित करें कि आपके सभी उत्पाद प्रकाशित हैं और खरीदारों को दिखाई दे रहे हैं।' :
                   language === 'th' ? 'ตรวจสอบให้แน่ใจว่าสินค้าทั้งหมดของคุณได้รับการเผยแพร่และมองเห็นได้โดยผู้ซื้อ' :
                   language === 'vi' ? 'Đảm bảo tất cả sản phẩm của bạn đã được xuất bản và hiển thị cho người mua.' :
                   'Make sure all your products are published and visible to buyers.',
    },
  }
  
  // Task definitions with completion status only
  const [taskStatus, setTaskStatus] = useState<Record<string, boolean>>({
    complete_profile: false,
    add_first_product: false,
    upload_brochure: false,
    customize_store: false,
    publish_products: false,
  })

  // Load progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('seller_onboarding_progress')
    if (savedProgress) {
      const progress = JSON.parse(savedProgress)
      setTaskStatus(progress)
    }
  }, [])

  // Save progress to localStorage
  useEffect(() => {
    localStorage.setItem('seller_onboarding_progress', JSON.stringify(taskStatus))
  }, [taskStatus])

  const markTaskComplete = (taskId: string) => {
    setTaskStatus(prev => ({
      ...prev,
      [taskId]: true
    }))
  }

  const handleNext = () => {
    if (currentTaskIndex < 4) { // 5 tasks total (0-4)
      setCurrentTaskIndex(currentTaskIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentTaskIndex > 0) {
      setCurrentTaskIndex(currentTaskIndex - 1)
    }
  }

  // Create dynamic tasks array based on current language
  const taskIds = ['complete_profile', 'add_first_product', 'upload_brochure', 'customize_store', 'publish_products']
  const tasks = taskIds.map(id => ({
    id,
    title: taskTranslations[id as keyof typeof taskTranslations].title,
    description: taskTranslations[id as keyof typeof taskTranslations].description,
    completed: taskStatus[id] || false,
  }))

  const currentTask = tasks[currentTaskIndex]
  const completedCount = tasks.filter(t => t.completed).length
  const progress = (completedCount / tasks.length) * 100
  
  // UI translations
  const uiTranslations = {
    gettingStartedGuide: language === 'zh' ? '入门指南' :
                         language === 'ja' ? 'スタートガイド' :
                         language === 'ar' ? 'دليل البدء' :
                         language === 'es' ? 'Guía de inicio' :
                         language === 'fr' ? 'Guide de démarrage' :
                         language === 'de' ? 'Erste Schritte' :
                         language === 'ko' ? '시작 가이드' :
                         language === 'ru' ? 'Руководство по началу работы' :
                         language === 'pt' ? 'Guia de início' :
                         language === 'hi' ? 'शुरुआती गाइड' :
                         language === 'th' ? 'คู่มือเริ่มต้น' :
                         language === 'vi' ? 'Hướng dẫn bắt đầu' :
                         'Getting Started Guide',
    tasksCompleted: language === 'zh' ? '个任务已完成' :
                    language === 'ja' ? 'タスク完了' :
                    language === 'ar' ? 'من المهام مكتملة' :
                    language === 'es' ? 'de tareas completadas' :
                    language === 'fr' ? 'tâches complétées' :
                    language === 'de' ? 'Aufgaben abgeschlossen' :
                    language === 'ko' ? '개 작업 완료' :
                    language === 'ru' ? 'задач выполнено' :
                    language === 'pt' ? 'de tarefas concluídas' :
                    language === 'hi' ? 'कार्य पूर्ण' :
                    language === 'th' ? 'งานเสร็จสมบูรณ์' :
                    language === 'vi' ? 'công việc đã hoàn thành' :
                    'of tasks completed',
    previous: language === 'zh' ? '上一个' :
              language === 'ja' ? '前へ' :
              language === 'ar' ? 'السابق' :
              language === 'es' ? 'Anterior' :
              language === 'fr' ? 'Précédent' :
              language === 'de' ? 'Zurück' :
              language === 'ko' ? '이전' :
              language === 'ru' ? 'Предыдущий' :
              language === 'pt' ? 'Anterior' :
              language === 'hi' ? 'पिछला' :
              language === 'th' ? 'ก่อนหน้า' :
              language === 'vi' ? 'Trước' :
              'Previous',
    next: language === 'zh' ? '下一个' :
          language === 'ja' ? '次へ' :
          language === 'ar' ? 'التالي' :
          language === 'es' ? 'Siguiente' :
          language === 'fr' ? 'Suivant' :
          language === 'de' ? 'Weiter' :
          language === 'ko' ? '다음' :
          language === 'ru' ? 'Следующий' :
          language === 'pt' ? 'Próximo' :
          language === 'hi' ? 'अगला' :
          language === 'th' ? 'ถัดไป' :
          language === 'vi' ? 'Tiếp' :
          'Next',
    markComplete: language === 'zh' ? '标记完成' :
                  language === 'ja' ? '完了としてマーク' :
                  language === 'ar' ? 'تحديد كمكتمل' :
                  language === 'es' ? 'Marcar como completado' :
                  language === 'fr' ? 'Marquer comme terminé' :
                  language === 'de' ? 'Als abgeschlossen markieren' :
                  language === 'ko' ? '완료로 표시' :
                  language === 'ru' ? 'Отметить как выполненное' :
                  language === 'pt' ? 'Marcar como concluído' :
                  language === 'hi' ? 'पूर्ण के रूप में चिह्नित करें' :
                  language === 'th' ? 'ทำเครื่องหมายว่าเสร็จแล้ว' :
                  language === 'vi' ? 'Đánh dấu hoàn thành' :
                  'Mark Complete',
    completed: language === 'zh' ? '已完成' :
               language === 'ja' ? '完了' :
               language === 'ar' ? 'مكتمل' :
               language === 'es' ? 'Completado' :
               language === 'fr' ? 'Terminé' :
               language === 'de' ? 'Abgeschlossen' :
               language === 'ko' ? '완료됨' :
               language === 'ru' ? 'Выполнено' :
               language === 'pt' ? 'Concluído' :
               language === 'hi' ? 'पूर्ण' :
               language === 'th' ? 'เสร็จสมบูรณ์' :
               language === 'vi' ? 'Hoàn thành' :
               'Completed',
    congratulations: language === 'zh' ? '🎉 恭喜！' :
                     language === 'ja' ? '🎉 おめでとうございます！' :
                     language === 'ar' ? '🎉 تهانينا!' :
                     language === 'es' ? '🎉 ¡Felicidades!' :
                     language === 'fr' ? '🎉 Félicitations !' :
                     language === 'de' ? '🎉 Glückwunsch!' :
                     language === 'ko' ? '🎉 축하합니다!' :
                     language === 'ru' ? '🎉 Поздравляем!' :
                     language === 'pt' ? '🎉 Parabéns!' :
                     language === 'hi' ? '🎉 बधाई हो!' :
                     language === 'th' ? '🎉 ยินดีด้วย!' :
                     language === 'vi' ? '🎉 Chúc mừng!' :
                     '🎉 Congratulations!',
    allTasksCompleted: language === 'zh' ? '您已完成所有入门任务。' :
                       language === 'ja' ? 'すべてのオンボーディングタスクを完了しました。' :
                       language === 'ar' ? 'لقد أكملت جميع مهام التوجيه.' :
                       language === 'es' ? 'Has completado todas las tareas de incorporación.' :
                       language === 'fr' ? 'Vous avez terminé toutes les tâches d\'intégration.' :
                       language === 'de' ? 'Sie haben alle Einführungsaufgaben abgeschlossen.' :
                       language === 'ko' ? '모든 온보딩 작업을 완료했습니다.' :
                       language === 'ru' ? 'Вы выполнили все задачи адаптации.' :
                       language === 'pt' ? 'Você concluiu todas as tarefas de integração.' :
                       language === 'hi' ? 'आपने सभी ऑनबोर्डिंग कार्य पूरे कर लिए हैं।' :
                       language === 'th' ? 'คุณได้ทำงานแนะนำทั้งหมดเสร็จสมบูรณ์แล้ว' :
                       language === 'vi' ? 'Bạn đã hoàn thành tất cả các nhiệm vụ hướng dẫn.' :
                       'You\'ve completed all onboarding tasks.',
  }

  if (!isExpanded) {
    return (
      <div className="fixed left-4 bottom-4 z-50">
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all"
        >
          <HelpCircle className="w-6 h-6" />
        </button>
      </div>
    )
  }

  return (
    <div className="fixed left-4 top-20 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[calc(100vh-6rem)] overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg">{uiTranslations.gettingStartedGuide}</h3>
          <button
            onClick={() => setIsExpanded(false)}
            className="text-white hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="text-sm opacity-90">
          {completedCount} {uiTranslations.tasksCompleted}
        </div>
        <div className="mt-2 bg-white/20 rounded-full h-2">
          <div
            className="bg-white rounded-full h-2 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Task List */}
      <div className="p-4 space-y-3">
        {tasks.map((task, index) => (
          <div
            key={task.id}
            className={`p-3 rounded-lg border transition-all cursor-pointer ${
              index === currentTaskIndex
                ? 'border-blue-500 bg-blue-50'
                : task.completed
                ? 'border-green-200 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setCurrentTaskIndex(index)}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {task.completed ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : index === currentTaskIndex ? (
                  <div className="w-5 h-5 rounded-full border-2 border-blue-600 flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  </div>
                ) : (
                  <Circle className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`text-sm font-medium ${
                  task.completed ? 'text-green-900 line-through' : 'text-gray-900'
                }`}>
                  {task.title}
                </h4>
                {index === currentTaskIndex && (
                  <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentTaskIndex === 0}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uiTranslations.previous}
          </button>
          
          {currentTask.completed ? (
            <span className="text-green-600 text-sm font-medium flex items-center">
              <CheckCircle className="w-4 h-4 mr-1" />
              {uiTranslations.completed}
            </span>
          ) : (
            <button
              onClick={() => markTaskComplete(currentTask.id)}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors flex items-center"
            >
              {uiTranslations.markComplete}
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          )}
          
          <button
            onClick={handleNext}
            disabled={currentTaskIndex === tasks.length - 1}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uiTranslations.next}
          </button>
        </div>
        
        {completedCount === tasks.length && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg text-center">
            <p className="text-sm text-green-800 font-medium">{uiTranslations.congratulations}</p>
            <p className="text-xs text-green-700 mt-1">{uiTranslations.allTasksCompleted}</p>
          </div>
        )}
      </div>
    </div>
  )
}
