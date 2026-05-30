'use client'

import { useState, useEffect } from 'react'
import { User, Building, Plus, Trash2, Image, Eye, EyeOff, CheckCircle, Upload, Settings, Shield, BadgeCheck, Camera } from 'lucide-react'

type UserProfile = {
  id: string
  name: string
  email: string
  personalAvatar?: string
  companyAvatar?: string
  associationAvatar?: string
  tags: UserTag[]
  bio?: string
  company?: string
  position?: string
}

type UserTag = {
  id: string
  name: string
  type: 'company' | 'association' | 'role' | 'skill' | 'other'
  isVisible: boolean
  order: number
}

const tagTypes = [
  { value: 'company', label: '公司', icon: <Building className="w-4 h-4" /> },
  { value: 'association', label: '协会/工会', icon: <Shield className="w-4 h-4" /> },
  { value: 'role', label: '职位', icon: <BadgeCheck className="w-4 h-4" /> },
  { value: 'skill', label: '技能', icon: <CheckCircle className="w-4 h-4" /> },
  { value: 'other', label: '其他', icon: <Settings className="w-4 h-4" /> },
]

const tagColors: Record<string, string> = {
  company: 'from-blue-500 to-blue-600',
  association: 'from-purple-500 to-purple-600',
  role: 'from-green-500 to-green-600',
  skill: 'from-yellow-500 to-yellow-600',
  other: 'from-slate-500 to-slate-600',
}

export default function UserTagsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddTagModal, setShowAddTagModal] = useState(false)
  const [showAvatarModal, setShowAvatarModal] = useState<'personal' | 'company' | 'association' | null>(null)
  const [tagOrder, setTagOrder] = useState<string[]>([])

  const mockProfile: UserProfile = {
    id: '1',
    name: '张伟',
    email: 'zhangwei@example.com',
    personalAvatar: '',
    companyAvatar: '',
    associationAvatar: '',
    bio: '全球电子科技有限公司创始人兼CEO，专注于电子产品研发和国际贸易15年。',
    company: '全球电子科技有限公司',
    position: 'CEO',
    tags: [
      { id: '1', name: 'CEO', type: 'role', isVisible: true, order: 0 },
      { id: '2', name: '全球电子科技有限公司', type: 'company', isVisible: true, order: 1 },
      { id: '3', name: '中国电子商会会员', type: 'association', isVisible: true, order: 2 },
      { id: '4', name: '产品经理', type: 'skill', isVisible: false, order: 3 },
      { id: '5', name: '国际贸易', type: 'skill', isVisible: true, order: 4 },
      { id: '6', name: '电子工程', type: 'skill', isVisible: true, order: 5 },
      { id: '7', name: '供应链管理', type: 'skill', isVisible: false, order: 6 },
      { id: '8', name: '创业导师', type: 'other', isVisible: true, order: 7 },
    ]
  }

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = () => {
    setTimeout(() => {
      setProfile(mockProfile)
      setTagOrder(mockProfile.tags.map(t => t.id))
      setLoading(false)
    }, 500)
  }

  const addTag = (name: string, type: string) => {
    if (!profile || !name.trim()) return
    
    const newTag: UserTag = {
      id: Date.now().toString(),
      name,
      type: type as any,
      isVisible: true,
      order: profile.tags.length
    }
    
    setProfile({
      ...profile,
      tags: [...profile.tags, newTag]
    })
    setTagOrder([...tagOrder, newTag.id])
    setShowAddTagModal(false)
  }

  const removeTag = (tagId: string) => {
    if (!profile) return
    
    setProfile({
      ...profile,
      tags: profile.tags.filter(t => t.id !== tagId)
    })
    setTagOrder(tagOrder.filter(id => id !== tagId))
  }

  const toggleTagVisibility = (tagId: string) => {
    if (!profile) return
    
    setProfile({
      ...profile,
      tags: profile.tags.map(tag => 
        tag.id === tagId 
          ? { ...tag, isVisible: !tag.isVisible }
          : tag
      )
    })
  }

  const updateAvatar = (type: 'personal' | 'company' | 'association', avatarUrl: string) => {
    if (!profile) return
    
    setProfile({
      ...profile,
      [type === 'personal' ? 'personalAvatar' : type === 'company' ? 'companyAvatar' : 'associationAvatar']: avatarUrl
    })
    setShowAvatarModal(null)
  }

  const visibleTags = profile?.tags.filter(t => t.isVisible).slice(0, 3) || []
  const hiddenTags = profile?.tags.filter(t => !t.isVisible) || []
  const collapsedVisibleTags = profile?.tags.filter(t => t.isVisible).slice(3) || []

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面头部 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">个人资料与标签</h1>
          <p className="text-slate-600">管理您的个人信息、头像和展示标签</p>
        </div>

        {/* 预览区域 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5" />
            预览效果
          </h2>
          <div className="flex items-start gap-6 p-6 bg-slate-50 rounded-xl">
            {/* 头像区域 */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                {profile?.personalAvatar ? (
                  <img src={profile.personalAvatar} alt="个人头像" className="w-24 h-24 rounded-full object-cover" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-3xl font-bold">
                    {profile?.name.charAt(0)}
                  </div>
                )}
                {profile?.companyAvatar && (
                  <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full border-2 border-white overflow-hidden">
                    <img src={profile.companyAvatar} alt="公司头像" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              {profile?.associationAvatar && (
                <div className="w-12 h-12 rounded-lg overflow-hidden">
                  <img src={profile.associationAvatar} alt="协会头像" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* 信息区域 */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-xl font-bold text-slate-900">{profile?.name}</h3>
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              
              {/* 标签展示 */}
              <div className="flex flex-wrap gap-2 mb-4">
                {visibleTags.map(tag => (
                  <span
                    key={tag.id}
                    className={`inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r ${tagColors[tag.type]} text-white text-sm rounded-full`}
                  >
                    {tagTypes.find(t => t.value === tag.type)?.icon}
                    {tag.name}
                  </span>
                ))}
                {collapsedVisibleTags.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-200 text-slate-700 text-sm rounded-full">
                    +{collapsedVisibleTags.length}
                  </span>
                )}
              </div>

              {profile?.bio && (
                <p className="text-slate-600">{profile.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* 头像管理 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Image className="w-5 h-5" />
            头像管理
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 个人头像 */}
            <div className="text-center p-4 border border-slate-200 rounded-xl">
              <h3 className="font-medium text-slate-900 mb-3">个人头像</h3>
              {profile?.personalAvatar ? (
                <div className="relative inline-block">
                  <img src={profile.personalAvatar} alt="个人头像" className="w-24 h-24 rounded-full object-cover" />
                  <button
                    onClick={() => updateAvatar('personal', '')}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full hover:bg-red-600 flex items-center justify-center"
                  >
                    &times;
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center mx-auto mb-3">
                  <User className="w-12 h-12 text-slate-400" />
                </div>
              )}
              <button
                onClick={() => setShowAvatarModal('personal')}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 flex items-center gap-2 mx-auto"
              >
                <Upload className="w-4 h-4" />
                上传头像
              </button>
            </div>

            {/* 公司头像 */}
            <div className="text-center p-4 border border-slate-200 rounded-xl">
              <h3 className="font-medium text-slate-900 mb-3">公司头像</h3>
              {profile?.companyAvatar ? (
                <div className="relative inline-block">
                  <img src={profile.companyAvatar} alt="公司头像" className="w-24 h-24 rounded-lg object-cover" />
                  <button
                    onClick={() => updateAvatar('company', '')}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full hover:bg-red-600 flex items-center justify-center"
                  >
                    &times;
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-lg bg-slate-200 flex items-center justify-center mx-auto mb-3">
                  <Building className="w-12 h-12 text-slate-400" />
                </div>
              )}
              <button
                onClick={() => setShowAvatarModal('company')}
                className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 flex items-center gap-2 mx-auto"
              >
                <Upload className="w-4 h-4" />
                上传头像
              </button>
            </div>

            {/* 协会/工会头像 */}
            <div className="text-center p-4 border border-slate-200 rounded-xl">
              <h3 className="font-medium text-slate-900 mb-3">协会/工会头像</h3>
              {profile?.associationAvatar ? (
                <div className="relative inline-block">
                  <img src={profile.associationAvatar} alt="协会头像" className="w-24 h-24 rounded-lg object-cover" />
                  <button
                    onClick={() => updateAvatar('association', '')}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full hover:bg-red-600 flex items-center justify-center"
                  >
                    &times;
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-lg bg-slate-200 flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-12 h-12 text-slate-400" />
                </div>
              )}
              <button
                onClick={() => setShowAvatarModal('association')}
                className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 flex items-center gap-2 mx-auto"
              >
                <Upload className="w-4 h-4" />
                上传头像
              </button>
            </div>
          </div>
        </div>

        {/* 标签管理 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <BadgeCheck className="w-5 h-5" />
              标签管理
            </h2>
            <button
              onClick={() => setShowAddTagModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
            >
              <Plus className="w-4 h-4" />
              添加标签
            </button>
          </div>

          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p className="text-sm text-yellow-700">
              <strong>提示：</strong>最多可添加10个标签，前3个标签将在用户名旁直接显示，其余标签将收起显示。您可以控制标签的可见性。
            </p>
          </div>

          <div className="space-y-3">
            {profile?.tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r ${tagColors[tag.type]} text-white text-sm rounded-full`}
                  >
                    {tagTypes.find(t => t.value === tag.type)?.icon}
                    {tag.name}
                  </span>
                  <span className="text-sm text-slate-500">
                    {tagTypes.find(t => t.value === tag.type)?.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleTagVisibility(tag.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      tag.isVisible
                        ? 'text-green-600 hover:bg-green-50'
                        : 'text-slate-400 hover:bg-slate-100'
                    }`}
                    title={tag.isVisible ? '隐藏标签' : '显示标签'}
                  >
                    {tag.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => removeTag(tag.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="删除标签"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {profile?.tags.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <BadgeCheck className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>还没有添加任何标签</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 添加标签弹窗 */}
      {showAddTagModal && (
        <AddTagModal
          onSubmit={addTag}
          onCancel={() => setShowAddTagModal(false)}
        />
      )}

      {/* 上传头像弹窗 */}
      {showAvatarModal && (
        <AvatarUploadModal
          type={showAvatarModal}
          onSubmit={(url) => updateAvatar(showAvatarModal, url)}
          onCancel={() => setShowAvatarModal(null)}
        />
      )}
    </div>
  )
}

function AddTagModal({ onSubmit, onCancel }: { onSubmit: (name: string, type: string) => void; onCancel: () => void }) {
  const [name, setName] = useState('')
  const [type, setType] = useState('other')

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">添加新标签</h2>
            <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-lg">
              <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">标签名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入标签名称..."
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">标签类型</label>
            <div className="grid grid-cols-2 gap-3">
              {tagTypes.map(tagType => (
                <label
                  key={tagType.value}
                  className={`flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-all ${
                    type === tagType.value ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={tagType.value}
                    checked={type === tagType.value}
                    onChange={(e) => setType(e.target.value)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-2">
                    <span className={tagType.value === 'company' ? 'text-blue-600' : tagType.value === 'association' ? 'text-purple-600' : tagType.value === 'role' ? 'text-green-600' : tagType.value === 'skill' ? 'text-yellow-600' : 'text-slate-600'}>
                      {tagType.icon}
                    </span>
                    <span className="font-medium text-slate-900">{tagType.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
          <button onClick={onCancel} className="px-6 py-3 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
            取消
          </button>
          <button
            onClick={() => onSubmit(name, type)}
            disabled={!name.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            添加标签
          </button>
        </div>
      </div>
    </div>
  )
}

function AvatarUploadModal({ type, onSubmit, onCancel }: { type: 'personal' | 'company' | 'association'; onSubmit: (url: string) => void; onCancel: () => void }) {
  const [imageUrl, setImageUrl] = useState('')

  const typeNames = {
    personal: '个人',
    company: '公司',
    association: '协会/工会'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">上传{typeNames[type]}头像</h2>
            <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-lg">
              <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="text-center p-6 border-2 border-dashed border-slate-300 rounded-xl">
            <Camera className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 mb-4">拖放图片到这里，或点击选择图片</p>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  const url = URL.createObjectURL(file)
                  setImageUrl(url)
                }
              }}
            />
            <button
              onClick={() => document.querySelector('input[type="file"]')?.click()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
            >
              选择图片
            </button>
          </div>
          {imageUrl && (
            <div className="text-center">
              <img src={imageUrl} alt="预览" className="w-32 h-32 object-cover rounded-lg mx-auto mb-4" />
            </div>
          )}
        </div>
        <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
          <button onClick={onCancel} className="px-6 py-3 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
            取消
          </button>
          <button
            onClick={() => onSubmit(imageUrl || `https://picsum.photos/seed/${Date.now()}/200/200`)}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all"
          >
            保存头像
          </button>
        </div>
      </div>
    </div>
  )
}
