/**
 * Database Service for ZEA Platform
 * Currently using LocalStorage to simulate real-time persistence.
 * This is designed to be easily swappable with Firebase Firestore.
 */

export interface Currency {
  id: string;
  name: string;
  network: string;
  address: string;
  qrUrl: string;
  iconUrl?: string; // Icon/Logo for the currency
  price: string;
  isActive: boolean;
}

export interface VipLevel {
  id: string;
  level: number;
  name: string;
  price: number;
  tasksPerDay: number;
  rewardPerTask: number;
  referralBonus: number;
}

export interface UserDailyCode {
  id: string;
  userId: string;
  code: string;
  date: string;
  isUsed: boolean;
  usedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  balance: number;
  honorPoints: number;
  vipLevel: number;
  invitationCode: string;
  referrerId?: string;
  invitations: number; // Active invitations (paid)
  totalInvited: number; // Background total count
  leaderLevel: number;
  status: 'active' | 'banned';
  joinedAt: string;
  walletAddress?: string;
  walletNetwork?: string;
}

export interface TaskCode {
  id: string;
  code: string;
  platform: string;
  tasksCount: number;
  rewardPerTask: number;
  createdAt: string;
}

export interface TaskRecord {
  id: string;
  userId: string;
  taskCodeId: string;
  platform: string;
  screenshotUrl: string;
  reward: number;
  status: 'doing' | 'pending' | 'approved' | 'rejected' | 'cancelled';
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  sender: 'user' | 'admin';
  text: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number; // Gross amount
  fee?: number;   // 19% fee
  netAmount?: number; // amount - fee
  currencyId?: string;
  networkAddress?: string;
  walletNetwork?: string;
  type: 'deposit' | 'withdrawal' | 'subscription';
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface GiftCode {
  id: string;
  code: string;
  amount: number;
  isUsed: boolean;
  usedBy?: string;
}

const STORAGE_KEYS = {
  CURRENCIES: 'zea_currencies',
  USERS: 'zea_users',
  TASK_CODES: 'zea_task_codes',
  TASK_RECORDS: 'zea_task_records',
  TRANSACTIONS: 'zea_transactions',
  SETTINGS: 'zea_settings',
  NOTIFICATIONS: 'zea_notifications',
  GIFT_CODES: 'zea_gift_codes',
  CURRENT_USER: 'zea_current_user',
  CHAT: 'zea_chat',
  VIP_LEVELS: 'zea_vip_levels',
  DAILY_CODES: 'zea_daily_codes',
};

// Helper for safe storage with quota management
const safeSetItem = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    if (e instanceof DOMException && (e.code === 22 || e.name === 'QuotaExceededError')) {
      console.warn('Storage quota exceeded, trimming old data...');
      
      // Trim task records first (they grow fast)
      if (key === STORAGE_KEYS.TASK_RECORDS) {
        const records = JSON.parse(value);
        if (records.length > 500) {
          localStorage.setItem(key, JSON.stringify(records.slice(-500)));
          return;
        }
      }

      // If trimming specific key didn't help, try trimming others
      const keysToTrim = [STORAGE_KEYS.NOTIFICATIONS, STORAGE_KEYS.CHAT, STORAGE_KEYS.TRANSACTIONS, STORAGE_KEYS.TASK_RECORDS];
      for (const k of keysToTrim) {
        const data = localStorage.getItem(k);
        if (data) {
          try {
            const arr = JSON.parse(data);
            if (Array.isArray(arr) && arr.length > 100) {
              localStorage.setItem(k, JSON.stringify(arr.slice(-100)));
              console.log(`Trimmed ${k} to 100 items`);
            }
          } catch (err) {
            localStorage.removeItem(k);
          }
        }
      }
      
      // Try setting the item again after trimming others
      try {
        localStorage.setItem(key, value);
      } catch (err) {
        console.error('Failed to set item even after trimming:', err);
      }
    }
  }
};

const DEFAULT_CURRENCIES: Currency[] = [
  { id: '1', name: 'USDT', network: 'TRC20', address: 'T9yD...xY2v', qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=T9yD...xY2v', iconUrl: 'https://cryptologos.cc/logos/tether-usdt-logo.png', price: '1.00', isActive: true },
  { id: '2', name: 'USDC', network: 'ERC20', address: '0x71...55c2', qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=0x71...55c2', iconUrl: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png', price: '1.00', isActive: true },
];

const DEFAULT_VIP_LEVELS: VipLevel[] = [
  { id: '1', level: 1, name: 'المستوى 1', price: 600, tasksPerDay: 5, rewardPerTask: 3.00, referralBonus: 70 },
  { id: '2', level: 2, name: 'المستوى 2', price: 1200, tasksPerDay: 12, rewardPerTask: 2.92, referralBonus: 120 },
  { id: '3', level: 3, name: 'المستوى 3', price: 2600, tasksPerDay: 10, rewardPerTask: 7.00, referralBonus: 260 },
];

const DEFAULT_USERS: User[] = [
  { 
    id: 'ZEA-489123', 
    name: 'موظف تجريبي', 
    email: 'test@zea.com', 
    phoneNumber: '07701234567',
    balance: 100.50, 
    honorPoints: 100, 
    vipLevel: 1, 
    invitationCode: 'aX7k2mQ9',
    invitations: 5, 
    totalInvited: 12,
    leaderLevel: 0, 
    status: 'active', 
    joinedAt: new Date().toISOString() 
  },
  { 
    id: 'ZEA-ADMIN', 
    name: 'المدير', 
    email: 'admin@zea.com', 
    balance: 0, 
    honorPoints: 0, 
    vipLevel: 3, 
    invitationCode: 'admin123',
    invitations: 0, 
    totalInvited: 0,
    leaderLevel: 0, 
    status: 'active', 
    joinedAt: new Date().toISOString() 
  }
];

export const databaseService = {
  // Currencies
  getCurrencies: (): Currency[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENCIES);
    return data ? JSON.parse(data) : DEFAULT_CURRENCIES;
  },
  saveCurrency: (currency: Currency) => {
    const currencies = databaseService.getCurrencies();
    const index = currencies.findIndex(c => c.id === currency.id);
    if (index >= 0) currencies[index] = currency;
    else currencies.push(currency);
    safeSetItem(STORAGE_KEYS.CURRENCIES, JSON.stringify(currencies));
  },
  deleteCurrency: (id: string) => {
    const currencies = databaseService.getCurrencies().filter(c => c.id !== id);
    safeSetItem(STORAGE_KEYS.CURRENCIES, JSON.stringify(currencies));
  },

  // VIP Levels
  getVipLevels: (): VipLevel[] => {
    const data = localStorage.getItem(STORAGE_KEYS.VIP_LEVELS);
    return data ? JSON.parse(data) : DEFAULT_VIP_LEVELS;
  },
  saveVipLevel: (level: VipLevel) => {
    const levels = databaseService.getVipLevels();
    const index = levels.findIndex(l => l.id === level.id);
    if (index >= 0) levels[index] = level;
    else levels.push(level);
    safeSetItem(STORAGE_KEYS.VIP_LEVELS, JSON.stringify(levels));
  },
  deleteVipLevel: (id: string) => {
    const levels = databaseService.getVipLevels().filter(l => l.id !== id);
    safeSetItem(STORAGE_KEYS.VIP_LEVELS, JSON.stringify(levels));
  },

  // Daily Codes
  getDailyCodes: (userId?: string): UserDailyCode[] => {
    const data = localStorage.getItem(STORAGE_KEYS.DAILY_CODES);
    const codes: UserDailyCode[] = data ? JSON.parse(data) : [];
    if (userId) return codes.filter(c => c.userId === userId);
    return codes;
  },
  generateDailyCode: (userId: string): UserDailyCode => {
    const codes = databaseService.getDailyCodes();
    
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let codeStr = '';
    for (let i = 0; i < 6; i++) {
      codeStr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    const newCode: UserDailyCode = {
      id: `DCODE-${Date.now()}`,
      userId,
      code: codeStr,
      date: today,
      isUsed: false
    };
    
    codes.push(newCode);
    safeSetItem(STORAGE_KEYS.DAILY_CODES, JSON.stringify(codes));
    return newCode;
  },
  useDailyCode: (userId: string, code: string): boolean => {
    const codes = databaseService.getDailyCodes();
    const today = new Date().toISOString().split('T')[0];
    
    const codeIndex = codes.findIndex(c => c.userId === userId && c.code === code && c.date === today && !c.isUsed);
    
    if (codeIndex >= 0) {
      codes[codeIndex].isUsed = true;
      codes[codeIndex].usedAt = new Date().toISOString();
      safeSetItem(STORAGE_KEYS.DAILY_CODES, JSON.stringify(codes));
      return true;
    }
    
    return false;
  },

  // Task Codes
  getTaskCodes: (): TaskCode[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TASK_CODES);
    const DEFAULT_TASK_CODES: TaskCode[] = [
      { id: '1', code: 'ZEA2024', platform: 'youtube', tasksCount: 5, rewardPerTask: 1.20, createdAt: new Date().toISOString() },
      { id: '2', code: 'TIKTOK6.2', platform: 'tiktok', tasksCount: 5, rewardPerTask: 6.20, createdAt: new Date().toISOString() },
    ];
    return data ? JSON.parse(data) : DEFAULT_TASK_CODES;
  },
  getRandomTaskLink: (platform: string): string => {
    const links: Record<string, string[]> = {
      youtube: [
        'https://www.youtube.com/shorts/5vOC_FALm_4',
        'https://www.youtube.com/shorts/3X9zF3_Hk_c',
        'https://www.youtube.com/shorts/1vP4G-x_tGM'
      ],
      tiktok: [
        'https://www.tiktok.com/@willsmith/video/7123456789012345678',
        'https://www.tiktok.com/@mrbeast/video/7123456789012345678',
        'https://www.tiktok.com/@khaby.lame/video/7123456789012345678'
      ],
      facebook: [
        'https://www.facebook.com/reel/1234567890',
        'https://www.facebook.com/reel/0987654321'
      ],
      instagram: [
        'https://www.instagram.com/reel/C1234567890/',
        'https://www.instagram.com/reel/C0987654321/'
      ]
    };
    const platformLinks = links[platform] || ['https://google.com'];
    return platformLinks[Math.floor(Math.random() * platformLinks.length)];
  },
  generateCaptcha: () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },
  saveTaskCode: (code: TaskCode) => {
    const codes = databaseService.getTaskCodes();
    const index = codes.findIndex(c => c.id === code.id);
    if (index >= 0) codes[index] = code;
    else codes.push(code);
    safeSetItem(STORAGE_KEYS.TASK_CODES, JSON.stringify(codes));
  },

  // Task Records
  getTaskRecords: (userId?: string): TaskRecord[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TASK_RECORDS);
    const all: TaskRecord[] = data ? JSON.parse(data) : [];
    return userId ? all.filter(r => r.userId === userId) : all;
  },
  claimTask: (record: Omit<TaskRecord, 'id' | 'createdAt' | 'status' | 'screenshotUrl'>) => {
    const records = databaseService.getTaskRecords();
    const newRecord: TaskRecord = {
      ...record,
      id: `TASK-${Date.now()}`,
      status: 'doing',
      screenshotUrl: '',
      createdAt: new Date().toISOString(),
    };
    records.push(newRecord);
    safeSetItem(STORAGE_KEYS.TASK_RECORDS, JSON.stringify(records));
    return newRecord;
  },
  updateTaskRecord: (id: string, updates: Partial<TaskRecord>) => {
    const records = databaseService.getTaskRecords();
    const index = records.findIndex(r => r.id === id);
    if (index >= 0) {
      records[index] = { ...records[index], ...updates };
      safeSetItem(STORAGE_KEYS.TASK_RECORDS, JSON.stringify(records));
      return records[index];
    }
    return null;
  },
  submitTask: (record: Omit<TaskRecord, 'id' | 'createdAt' | 'status'>) => {
    const records = databaseService.getTaskRecords();
    const newRecord: TaskRecord = {
      ...record,
      id: `TASK-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    records.push(newRecord);
    safeSetItem(STORAGE_KEYS.TASK_RECORDS, JSON.stringify(records));
    return newRecord;
  },
  updateTaskStatus: (id: string, status: 'approved' | 'rejected') => {
    const records = databaseService.getTaskRecords();
    const index = records.findIndex(r => r.id === id);
    if (index >= 0) {
      const record = records[index];
      record.status = status;
      safeSetItem(STORAGE_KEYS.TASK_RECORDS, JSON.stringify(records));

      if (status === 'approved') {
        const users = databaseService.getUsers();
        const uIdx = users.findIndex(u => u.id === record.userId);
        if (uIdx >= 0) {
          users[uIdx].balance += record.reward;
          safeSetItem(STORAGE_KEYS.USERS, JSON.stringify(users));
          const currentUser = databaseService.getCurrentUser();
          if (currentUser && record.userId === currentUser.id) {
            databaseService.updateCurrentUser({ balance: users[uIdx].balance });
          }
        }
      }

      databaseService.sendNotification({
        userId: record.userId,
        title: status === 'approved' ? 'مهمة مكتملة' : 'مهمة مرفوضة',
        message: status === 'approved' 
          ? `تمت الموافقة على مهمتك وإضافة $${record.reward} إلى رصيدك.`
          : 'تم رفض المهمة المقدمة. يرجى التأكد من تنفيذ الخطوات بشكل صحيح.'
      });
    }
  },

  // Users
  getUsers: (): User[] => {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : DEFAULT_USERS;
  },
  saveUser: (user: User) => {
    const users = databaseService.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) users[index] = user;
    else users.push(user);
    safeSetItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    // Sync with current user if the ID matches
    const current = databaseService.getCurrentUser();
    if (current && current.id === user.id) {
       safeSetItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    }
  },
  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!data) return null;
    try {
      const user = JSON.parse(data) as User;
      // Ensure existing users have a code
      if (!user.invitationCode) {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let code = '';
        for (let i = 0; i < 5; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
        user.invitationCode = code;
        databaseService.updateCurrentUser(user);
      }
      return user;
    } catch {
      return null;
    }
  },
  updateCurrentUser: (userData: Partial<User>) => {
    const current = databaseService.getCurrentUser();
    if (!current) return null;
    const updated = { ...current, ...userData };
    safeSetItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updated));
    databaseService.saveUser(updated);
    return updated;
  },
  login: (emailOrPhone: string) => {
    const users = databaseService.getUsers();
    const user = users.find(u => u.email === emailOrPhone || u.phoneNumber === emailOrPhone);
    if (user) {
      safeSetItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      return user;
    }
    return null;
  },
  signup: (userData: { name: string, email: string, phoneNumber?: string, invitationCode?: string }) => {
    const users = databaseService.getUsers();
    
    let referrerId: string | undefined;
    if (!userData.invitationCode) {
      throw new Error('رمز الدعوة مطلوب للتسجيل');
    }

    const referrer = users.find(u => u.invitationCode === userData.invitationCode);
    if (referrer) {
      referrerId = referrer.id;
      const refIndex = users.findIndex(u => u.id === referrer.id);
      if (refIndex >= 0) {
        users[refIndex].totalInvited += 1;
      }
    } else {
      throw new Error('رمز الدعوة غير صحيح');
    }

    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let newCode = '';
    for (let i = 0; i < 5; i++) {
        newCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const newUser: User = {
      ...userData,
      id: `ZEA-${Math.floor(100000 + Math.random() * 900000)}`,
      balance: 0,
      honorPoints: 100,
      vipLevel: 0,
      invitationCode: newCode,
      referrerId,
      invitations: 0,
      totalInvited: 0,
      leaderLevel: 0,
      status: 'active',
      joinedAt: new Date().toISOString()
    };
    users.push(newUser);
    safeSetItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    safeSetItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
    return newUser;
  },
  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  // Transactions
  getTransactions: (userId?: string): Transaction[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    const all: Transaction[] = data ? JSON.parse(data) : [];
    return userId ? all.filter(t => t.userId === userId) : all;
  },
  hasPendingWithdrawal: (userId: string): boolean => {
    const txs = databaseService.getTransactions(userId);
    return txs.some(t => t.type === 'withdrawal' && t.status === 'pending');
  },
  createTransaction: (tx: Omit<Transaction, 'id' | 'createdAt' | 'status'> & { status?: Transaction['status'] }) => {
    const transactions = databaseService.getTransactions();
    const newTx: Transaction = {
      status: 'pending',
      ...tx,
      id: `TX-${Math.floor(Math.random() * 1000000)}`,
      createdAt: new Date().toISOString(),
    };
    transactions.push(newTx);
    safeSetItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    return newTx;
  },
  updateTransactionStatus: (id: string, status: Transaction['status']) => {
    const transactions = databaseService.getTransactions();
    const index = transactions.findIndex(t => t.id === id);
    if (index >= 0) {
      const tx = transactions[index];
      const oldStatus = tx.status;
      tx.status = status;
      
      // Handle balance updates based on status transitions
      if (oldStatus === 'pending' && status === 'completed') {
        if (tx.type === 'deposit') {
          const users = databaseService.getUsers();
          const uIdx = users.findIndex(u => u.id === tx.userId);
          if (uIdx >= 0) {
            users[uIdx].balance += tx.amount;
            safeSetItem(STORAGE_KEYS.USERS, JSON.stringify(users));
            const currentUser = databaseService.getCurrentUser();
            if (currentUser && tx.userId === currentUser.id) {
              databaseService.updateCurrentUser({ balance: users[uIdx].balance });
            }
          }
        }
      }

      // Handle failed withdrawal refund
      if (status === 'failed' && tx.type === 'withdrawal' && oldStatus !== 'failed') {
        const users = databaseService.getUsers();
        const uIdx = users.findIndex(u => u.id === tx.userId);
        if (uIdx >= 0) {
          users[uIdx].balance += tx.amount;
          safeSetItem(STORAGE_KEYS.USERS, JSON.stringify(users));
          const currentUser = databaseService.getCurrentUser();
          if (currentUser && tx.userId === currentUser.id) {
            databaseService.updateCurrentUser({ balance: users[uIdx].balance });
          }
        }
      }
      
      safeSetItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
      
      // Notify user
      databaseService.sendNotification({
        userId: tx.userId,
        title: status === 'completed' ? 'عملية ناجحة' : 'عملية مرفوضة',
        message: `تم ${status === 'completed' ? 'تأكيد' : 'رفض'} طلب ${
          tx.type === 'deposit' ? 'الإيداع' : 
          tx.type === 'subscription' ? 'الاشتراك' : 'السحب'
        } الخاص بك بمبلغ $${tx.amount}.`
      });
    }
  },

  // Chat
  getChatMessages: (userId: string): ChatMessage[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CHAT);
    const all: ChatMessage[] = data ? JSON.parse(data) : [];
    return all.filter(m => m.userId === userId);
  },
  sendChatMessage: (msg: Omit<ChatMessage, 'id' | 'createdAt'>) => {
    const data = localStorage.getItem(STORAGE_KEYS.CHAT);
    const all: ChatMessage[] = data ? JSON.parse(data) : [];
    const newMsg: ChatMessage = {
      ...msg,
      id: `MSG-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    all.push(newMsg);
    safeSetItem(STORAGE_KEYS.CHAT, JSON.stringify(all));
    return newMsg;
  },
  deleteChatMessage: (msgId: string) => {
    const data = localStorage.getItem(STORAGE_KEYS.CHAT);
    const all: ChatMessage[] = data ? JSON.parse(data) : [];
    const filtered = all.filter(m => m.id !== msgId);
    safeSetItem(STORAGE_KEYS.CHAT, JSON.stringify(filtered));
  },

  // Notifications
  getNotifications: (userId: string): Notification[] => {
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const all: Notification[] = data ? JSON.parse(data) : [];
    return all.filter(n => n.userId === userId);
  },
  sendNotification: (notif: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const all: Notification[] = data ? JSON.parse(data) : [];
    const newNotif: Notification = {
      ...notif,
      id: `NOTIF-${Date.now()}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    all.push(newNotif);
    safeSetItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(all));
  },

  // Gift Codes
  getGiftCodes: (): GiftCode[] => {
    const data = localStorage.getItem(STORAGE_KEYS.GIFT_CODES);
    return data ? JSON.parse(data) : [];
  },
  createGiftCode: (code: Omit<GiftCode, 'id' | 'isUsed'>) => {
    const codes = databaseService.getGiftCodes();
    const newCode: GiftCode = {
      ...code,
      id: `GIFT-${Date.now()}`,
      isUsed: false,
    };
    codes.push(newCode);
    safeSetItem(STORAGE_KEYS.GIFT_CODES, JSON.stringify(codes));
    return newCode;
  },

  // Settings
  getMaintenanceMessage: () => localStorage.getItem(STORAGE_KEYS.SETTINGS + '_maintenance') || '',
  setMaintenanceMessage: (msg: string) => safeSetItem(STORAGE_KEYS.SETTINGS + '_maintenance', msg),
  getWithdrawalCommission: () => parseInt(localStorage.getItem(STORAGE_KEYS.SETTINGS + '_commission') || '19'),
  setWithdrawalCommission: (rate: number) => safeSetItem(STORAGE_KEYS.SETTINGS + '_commission', rate.toString()),
};
