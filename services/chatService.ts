// PataFundi Chat Service — Mock Implementation

import { ChatRoom, ChatMessage, ApiResponse } from '@/types';

const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_001',
    roomId: 'room_job_001',
    senderId: 'fundi_001',
    senderRole: 'fundi',
    type: 'system',
    content: 'James has been assigned to your job.',
    readBy: ['cust_001', 'fundi_001'],
    createdAt: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg_002',
    roomId: 'room_job_001',
    senderId: 'fundi_001',
    senderRole: 'fundi',
    type: 'text',
    content: 'Hello Amina! I have reviewed your job. I am on my way now. Should be there in about 20 minutes.',
    readBy: ['cust_001', 'fundi_001'],
    createdAt: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg_003',
    roomId: 'room_job_001',
    senderId: 'cust_001',
    senderRole: 'customer',
    type: 'text',
    content: 'Great, thank you! The gate is open. Ask the guard to let you in.',
    readBy: ['cust_001', 'fundi_001'],
    createdAt: new Date(Date.now() - 92 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg_004',
    roomId: 'room_job_001',
    senderId: 'fundi_001',
    senderRole: 'fundi',
    type: 'text',
    content: 'I have arrived. Coming up now.',
    readBy: ['cust_001', 'fundi_001'],
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg_005',
    roomId: 'room_job_001',
    senderId: 'fundi_001',
    senderRole: 'fundi',
    type: 'text',
    content: 'I found the issue. The P-trap seal has worn out. I have the replacement part. Repair should take about 30-40 minutes.',
    readBy: ['fundi_001'],
    createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
  },
];

export const chatService = {
  async getChatRoom(jobId: string): Promise<ApiResponse<ChatRoom>> {
    await simulateDelay(400);
    const room: ChatRoom = {
      id: `room_${jobId}`,
      jobId,
      participants: ['cust_001', 'fundi_001'],
      lastMessage: MOCK_MESSAGES[MOCK_MESSAGES.length - 1],
      updatedAt: new Date().toISOString(),
    };
    return { success: true, data: room };
  },

  async getMessages(roomId: string): Promise<ApiResponse<ChatMessage[]>> {
    await simulateDelay(600);
    const messages = MOCK_MESSAGES.filter(m => m.roomId === roomId);
    return { success: true, data: messages };
  },

  async sendMessage(params: {
    roomId: string;
    senderId: string;
    senderRole: 'customer' | 'fundi';
    type: 'text' | 'image';
    content: string;
    imageUrl?: string;
  }): Promise<ApiResponse<ChatMessage>> {
    await simulateDelay(400);
    const message: ChatMessage = {
      id: `msg_${Date.now()}`,
      roomId: params.roomId,
      senderId: params.senderId,
      senderRole: params.senderRole,
      type: params.type,
      content: params.content,
      imageUrl: params.imageUrl,
      readBy: [params.senderId],
      createdAt: new Date().toISOString(),
    };
    return { success: true, data: message };
  },

  async markAsRead(roomId: string, userId: string): Promise<ApiResponse<boolean>> {
    await simulateDelay(200);
    return { success: true, data: true };
  },
};
