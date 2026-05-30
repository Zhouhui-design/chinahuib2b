'use client'

import { useState, useEffect, useRef } from 'react'
import { Users, MessageSquare, Plus, MoreVertical, Search, UserPlus, UserMinus, Shield, Trash2, Image as ImageIcon, Paperclip, Send, Smile, Lock, Bell } from 'lucide-react'

type Team = {
  id: string
  name: string
  description: string
  members: User[]
  avatar?: string
  createdAt: string
  maxMembers: number
  ownerId: string
  isPrivate: boolean
}

type User = {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'owner' | 'admin' | 'member'
  tags?: string[]
  companyAvatar?: string
  online?: boolean
}

type Message = {
  id: string
  teamId: string
  userId: string
  content: string
  type: 'text' | 'image' | 'file'
  timestamp: string
  readBy: string[]
}

export default function TeamChatPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 模拟数据 - 团队列表
  const mockTeams: Team[] = [
    {
      id: '1',
      name: '电子产品供应商群',
      description: '全球电子产品供应商交流群',
      maxMembers: 500,
      ownerId: '1',
      isPrivate: false,
      createdAt: '2026-05-01T00:00:00Z',
      members: [
        { id: '1', name: '张伟', email: 'zhangwei@example.com', role: 'owner', tags: ['CEO', '电子科技'], online: true },
        { id: '2', name: '李明', email: 'liming@example.com', role: 'admin', tags: ['产品经理'], online: true },
        { id: '3', name: 'Sarah Chen', email: 'sarah@example.com', role: 'member', tags: ['供应商', '美国'], online: false },
        { id: '4', name: '王芳', email: 'wangfang@example.com', role: 'member', tags: ['采购'], online: true },
      ]
    },
    {
      id: '2',
      name: '项目合作群 - ABC公司',
      description: 'ABC公司项目专用群',
      maxMembers: 50,
      ownerId: '2',
      isPrivate: true,
      createdAt: '2026-05-15T00:00:00Z',
      members: [
        { id: '1', name: '张伟', email: 'zhangwei@example.com', role: 'member', tags: ['CEO'], online: true },
        { id: '2', name: '李明', email: 'liming@example.com', role: 'owner', tags: ['产品经理'], online: true },
      ]
    }
  ]

  // 模拟数据 - 消息
  const mockMessages: Message[] = [
    {
      id: '1',
      teamId: '1',
      userId: '1',
      content: '大家好！欢迎来到电子产品供应商群！',
      type: 'text',
      timestamp: '2026-05-30T09:00:00Z',
      readBy: ['1', '2', '3', '4']
    },
    {
      id: '2',
      teamId: '1',
      userId: '2',
      content: '张总好！我是李明，很高兴加入这个群！',
      type: 'text',
      timestamp: '2026-05-30T09:05:00Z',
      readBy: ['1', '2', '3']
    },
    {
      id: '3',
      teamId: '1',
      userId: '3',
      content: '大家好，我是Sarah，来自美国的供应商！',
      type: 'text',
      timestamp: '2026-05-30T09:10:00Z',
      readBy: ['1', '2']
    },
    {
      id: '4',
      teamId: '1',
      userId: '4',
      content: '欢迎Sarah！我们公司正在寻找新的耳机供应商，有空可以聊聊 @Sarah Chen',
      type: 'text',
      timestamp: '2026-05-30T09:15:00Z',
      readBy: ['1']
    }
  ]

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const loadData = () => {
    setTimeout(() => {
      setTeams(mockTeams)
      setCurrentTeam(mockTeams[0])
      setMessages(mockMessages.filter(m => m.teamId === '1'))
      setLoading(false)
    }, 500)
  }

  const sendMessage = () => {
    if (!newMessage.trim() || !currentTeam) return

    const message: Message = {
      id: Date.now().toString(),
      teamId: currentTeam.id,
      userId: '1', // 当前用户
      content: newMessage,
      type: 'text',
      timestamp: new Date().toISOString(),
      readBy: ['1']
    }

    setMessages([...messages, message])
    setNewMessage('')

    // 模拟对方正在输入
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        teamId: currentTeam.id,
        userId: '2',
        content: '收到！我看到了您的消息！',
        type: 'text',
        timestamp: new Date().toISOString(),
        readBy: ['2']
      }
      setMessages(prev => [...prev, reply])
    }, 2000)
  }

  const createTeam = (name: string, description: string, isPrivate: boolean) => {
    const newTeam: Team = {
      id: Date.now().toString(),
      name,
      description,
      maxMembers: 50,
      ownerId: '1',
      isPrivate,
      createdAt: new Date().toISOString(),
      members: [
        { id: '1', name: '张伟', email: 'zhangwei@example.com', role: 'owner', tags: ['CEO'], online: true }
      ]
    }
    setTeams([newTeam, ...teams])
    setShowCreateTeamModal(false)
  }

  const joinTeam = (teamId: string) => {
    setTeams(teams.map(team => {
      if (team.id === teamId && team.members.length < team.maxMembers) {
        return {
          ...team,
          members: [
            ...team.members,
            { id: '1', name: '张伟', email: 'zhangwei@example.com', role: 'member', tags: ['CEO'], online: true }
          ]
        }
      }
      return team
    }))
  }

  const leaveTeam = (teamId: string) => {
    if (teamId === currentTeam?.id) {
      setCurrentTeam(teams.find(t => t.id !== teamId) || null)
    }
    setTeams(teams.map(team => {
      if (team.id === teamId) {
        return {
          ...team,
          members: team.members.filter(m => m.id !== '1')
        }
      }
      return team
    }))
  }

  const deleteTeam = (teamId: string) => {
    if (teamId === currentTeam?.id) {
      setCurrentTeam(null)
    }
    setTeams(teams.filter(t => t.id !== teamId))
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const getUser = (userId: string) => {
    if (!currentTeam) return null
    return currentTeam.members.find(m => m.id === userId)
  }

  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)]">
          {/* 左侧 - 团队列表 */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
              {/* 头部 */}
              <div className="p-4 border-b border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-6 h-6 text-blue-600" />
                    团队聊天
                  </h2>
                  <button
                    onClick={() => setShowCreateTeamModal(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    创建
                  </button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="搜索团队..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* 团队列表 */}
              <div className="flex-1 overflow-y-auto p-2">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : filteredTeams.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    没有找到团队
                  </div>
                ) : (
                  filteredTeams.map(team => {
                    const isMember = team.members.some(m => m.id === '1')
                    return (
                      <div
                        key={team.id}
                        onClick={() => isMember && setCurrentTeam(team)}
                        className={`p-4 rounded-lg mb-2 cursor-pointer transition-all ${
                          currentTeam?.id === team.id
                            ? 'bg-blue-50 border border-blue-200'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-900">{team.name}</h3>
                            {team.isPrivate && (
                              <Lock className="w-3 h-3 text-slate-500" />
                            )}
                          </div>
                          <span className="text-xs text-slate-500">
                            {team.members.length}/{team.maxMembers}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-2 line-clamp-1">{team.description}</p>
                        
                        {!isMember && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              joinTeam(team.id)
                            }}
                            className="w-full px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-500 transition-colors"
                          >
                            加入团队
                          </button>
                        )}
                        
                        {isMember && (
                          <div className="flex items-center gap-1">
                            {team.members.slice(0, 3).map(member => (
                              <div
                                key={member.id}
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                  member.online ? 'bg-green-500 text-white' : 'bg-slate-300 text-slate-700'
                                }`}
                              >
                                {member.name.charAt(0)}
                              </div>
                            ))}
                            {team.members.length > 3 && (
                              <span className="text-xs text-slate-500">+{team.members.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          {/* 中间 - 聊天区域 */}
          <div className="flex-1 flex flex-col">
            {!currentTeam ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex items-center justify-center">
                <div className="text-center text-slate-500">
                  <Users className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <h3 className="text-lg font-medium text-slate-700 mb-2">选择一个团队开始聊天</h3>
                  <p>从左侧选择或创建一个新团队</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
                {/* 团队头部 */}
                <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {currentTeam.members.slice(0, 3).map(member => (
                        <div
                          key={member.id}
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border-2 border-white ${
                            member.online ? 'bg-green-500 text-white' : 'bg-slate-300 text-slate-700'
                          }`}
                        >
                          {member.name.charAt(0)}
                        </div>
                      ))}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{currentTeam.name}</h3>
                      <p className="text-sm text-slate-600">{currentTeam.members.length} 位成员</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-slate-100 rounded-lg">
                      <Bell className="w-5 h-5 text-slate-600" />
                    </button>
                    <div className="relative">
                      <button className="p-2 hover:bg-slate-100 rounded-lg">
                        <MoreVertical className="w-5 h-5 text-slate-600" />
                      </button>
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 hidden group-hover:block">
                        {currentTeam.ownerId === '1' && (
                          <button
                            onClick={() => deleteTeam(currentTeam.id)}
                            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 w-full"
                          >
                            <Trash2 className="w-4 h-4" />
                            删除团队
                          </button>
                        )}
                        <button
                          onClick={() => leaveTeam(currentTeam.id)}
                          className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-50 w-full"
                        >
                          <UserMinus className="w-4 h-4" />
                          离开团队
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 消息区域 */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map(message => {
                    const user = getUser(message.userId)
                    const isOwn = message.userId === '1'
                    return (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isOwn && (
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                            user?.online ? 'bg-green-500 text-white' : 'bg-slate-300 text-slate-700'
                          }`}>
                            {user?.name.charAt(0)}
                          </div>
                        )}
                        <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                          {!isOwn && (
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-slate-900">{user?.name}</span>
                              {user?.tags?.slice(0, 2).map(tag => (
                                <span key={tag} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className={`px-4 py-3 rounded-lg ${
                            isOwn
                              ? 'bg-blue-600 text-white rounded-br-none'
                              : 'bg-slate-100 text-slate-900 rounded-bl-none'
                          }`}>
                            <p>{message.content}</p>
                          </div>
                          <span className="text-xs text-slate-500 mt-1">
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                  {isTyping && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 bg-slate-300 text-slate-700">
                        L
                      </div>
                      <div className="bg-slate-100 text-slate-900 px-4 py-3 rounded-lg rounded-bl-none">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* 输入区域 */}
                <div className="p-4 border-t border-slate-200">
                  <div className="flex items-end gap-3">
                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                      <Paperclip className="w-5 h-5 text-slate-600" />
                    </button>
                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                      <ImageIcon className="w-5 h-5 text-slate-600" />
                    </button>
                    <div className="flex-1">
                      <div className="relative">
                        <textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              sendMessage()
                            }
                          }}
                          placeholder="输入消息..."
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                          rows={1}
                        />
                        <button className="absolute right-3 bottom-3 p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                          <Smile className="w-5 h-5 text-slate-600" />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 右侧 - 团队详情 */}
          {currentTeam && (
            <div className="lg:w-72 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full">
                <div className="p-4 border-b border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-4">团队成员</h3>
                </div>
                <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
                  {currentTeam.members.map(member => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium relative ${
                        member.online ? 'bg-green-500 text-white' : 'bg-slate-300 text-slate-700'
                      }`}>
                        {member.name.charAt(0)}
                        {member.online && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900 truncate">{member.name}</span>
                          {member.role === 'owner' && (
                            <Shield className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {member.tags?.slice(0, 3).map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-slate-200">
                  <button className="flex items-center gap-2 w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
                    <UserPlus className="w-4 h-4" />
                    添加成员
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 创建团队弹窗 */}
      {showCreateTeamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">创建新团队</h2>
                <button
                  onClick={() => setShowCreateTeamModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <CreateTeamForm onSubmit={createTeam} onCancel={() => setShowCreateTeamModal(false)} />
          </div>
        </div>
      )}
    </div>
  )
}

function CreateTeamForm({ onSubmit, onCancel }: { onSubmit: (name: string, description: string, isPrivate: boolean) => void; onCancel: () => void }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)

  return (
    <div className="p-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">团队名称</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="输入团队名称..."
          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">团队描述</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="输入团队描述..."
          rows={3}
          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
        />
      </div>
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="private"
          checked={isPrivate}
          onChange={(e) => setIsPrivate(e.target.checked)}
          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
        />
        <label htmlFor="private" className="text-sm text-slate-700">设为私密团队（需要邀请才能加入）</label>
      </div>
      <div className="pt-4 flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-6 py-3 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
        >
          取消
        </button>
        <button
          onClick={() => onSubmit(name, description, isPrivate)}
          disabled={!name.trim()}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          创建团队
        </button>
      </div>
    </div>
  )
}
