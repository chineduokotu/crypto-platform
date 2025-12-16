import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  async setItem(key: string, value: string) {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  },

  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Error reading from storage:', error);
      return null;
    }
  },

  async removeItem(key: string) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from storage:', error);
    }
  },

  async clear() {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
};

export const authStorage = {
  async setUserData(data: { userId: string; fullName: string; kycCompleted: boolean }) {
    await storage.setItem('isLoggedIn', 'true');
    await storage.setItem('userId', data.userId);
    await storage.setItem('fullName', data.fullName);
    await storage.setItem('kycCompleted', data.kycCompleted ? 'true' : 'false');
  },

  async getUserData() {
    const isLoggedIn = await storage.getItem('isLoggedIn');
    const userId = await storage.getItem('userId');
    const fullName = await storage.getItem('fullName');
    const kycCompleted = await storage.getItem('kycCompleted');

    return {
      isLoggedIn: isLoggedIn === 'true',
      userId,
      fullName,
      kycCompleted: kycCompleted === 'true',
    };
  },

  async logout() {
    await storage.removeItem('isLoggedIn');
    await storage.removeItem('userId');
    await storage.removeItem('fullName');
    await storage.removeItem('kycCompleted');
  },
};
