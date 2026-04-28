'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface PaymentProof {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  transactionId: string | null;
  paymentMethod: string;
  notes: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNotes: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  user: {
    email: string;
    username: string;
    sellerProfile: {
      companyName: string;
    } | null;
  };
}

export default function AdminPaymentProofsPage() {
  const router = useRouter();
  const [proofs, setProofs] = useState<PaymentProof[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [selectedProof, setSelectedProof] = useState<PaymentProof | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPaymentProofs();
  }, [filter]);

  const fetchPaymentProofs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/payment-proofs?status=${filter}`);
      const data = await response.json();
      if (response.ok) {
        setProofs(data.proofs);
      } else {
        setError(data.error || 'Failed to load payment proofs');
      }
    } catch (err) {
      setError('Failed to load payment proofs');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (proofId: string) => {
    setProcessing(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/admin/payment-proofs/${proofId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNotes }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess('Payment proof approved successfully');
        setSelectedProof(null);
        setAdminNotes('');
        fetchPaymentProofs();
      } else {
        setError(data.error || 'Failed to approve');
      }
    } catch (err) {
      setError('Failed to approve');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (proofId: string) => {
    setProcessing(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/admin/payment-proofs/${proofId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNotes }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess('Payment proof rejected');
        setSelectedProof(null);
        setAdminNotes('');
        fetchPaymentProofs();
      } else {
        setError(data.error || 'Failed to reject');
      }
    } catch (err) {
      setError('Failed to reject');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">
            付款凭证审核
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            审核商家的付款凭证并激活账户
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="mb-6 flex space-x-2">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {status === 'ALL' ? '全部' : 
               status === 'PENDING' ? '待审核' :
               status === 'APPROVED' ? '已通过' : '已拒绝'}
            </button>
          ))}
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">加载中...</p>
          </div>
        ) : (
          <>
            {/* Payment Proofs List */}
            {proofs.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-600">暂无付款凭证</p>
              </div>
            ) : (
              <div className="space-y-4">
                {proofs.map((proof) => (
                  <div key={proof.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {proof.user.sellerProfile?.companyName || proof.user.username}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(proof.status)}`}>
                            {proof.status === 'PENDING' ? '待审核' :
                             proof.status === 'APPROVED' ? '已通过' : '已拒绝'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><strong>邮箱：</strong>{proof.user.email}</p>
                          <p><strong>金额：</strong>${proof.amount} {proof.currency}</p>
                          {proof.transactionId && (
                            <p><strong>交易单号：</strong>{proof.transactionId}</p>
                          )}
                          <p><strong>提交时间：</strong>{new Date(proof.submittedAt).toLocaleString('zh-CN')}</p>
                          {proof.notes && (
                            <p><strong>备注：</strong>{proof.notes}</p>
                          )}
                          {proof.adminNotes && (
                            <p><strong>管理员备注：</strong>{proof.adminNotes}</p>
                          )}
                        </div>
                      </div>

                      {proof.status === 'PENDING' && (
                        <button
                          onClick={() => setSelectedProof(proof)}
                          className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                        >
                          审核
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Review Modal */}
        {selectedProof && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">审核付款凭证</h2>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="space-y-2 text-sm">
                    <p><strong>商家：</strong>{selectedProof.user.sellerProfile?.companyName || selectedProof.user.username}</p>
                    <p><strong>邮箱：</strong>{selectedProof.user.email}</p>
                    <p><strong>金额：</strong>${selectedProof.amount} {selectedProof.currency}</p>
                    {selectedProof.transactionId && (
                      <p><strong>交易单号：</strong>{selectedProof.transactionId}</p>
                    )}
                    {selectedProof.notes && (
                      <p><strong>商家备注：</strong>{selectedProof.notes}</p>
                    )}
                  </div>
                </div>

                {/* Screenshot placeholder */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    付款截图
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <p className="text-gray-500">截图上传功能开发中...</p>
                    <p className="text-xs text-gray-400 mt-1">
                      请通过 SCP 命令上传截图到服务器
                    </p>
                  </div>
                </div>

                {/* Admin Notes */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    管理员备注
                  </label>
                  <textarea
                    rows={3}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="输入审核备注..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleApprove(selectedProof.id)}
                    disabled={processing}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    {processing ? '处理中...' : '通过并激活账户'}
                  </button>
                  <button
                    onClick={() => handleReject(selectedProof.id)}
                    disabled={processing}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    {processing ? '处理中...' : '拒绝'}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedProof(null);
                      setAdminNotes('');
                    }}
                    className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
