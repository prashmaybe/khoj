import CryptoJS from 'crypto-js';

export interface PasswordEntry {
  id: string;
  title: string;
  username: string;
  password: string;
  url: string;
  notes?: string;
  dateCreated: string;
  dateModified: string;
  category?: string;
  tags?: string[];
}

export interface PasswordGeneratorOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeSimilar: boolean;
}

const PASSWORDS_KEY = 'khoj_password_manager';
const MASTER_PASSWORD_KEY = 'khoj_master_password_hash';

class PasswordManager {
  private masterPassword: string | null = null;
  private encryptionKey: string | null = null;

  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  private safeJSONParse<T>(str: string | null, defaultValue: T): T {
    if (!str) return defaultValue;
    try {
      return JSON.parse(str);
    } catch (error) {
      console.error('Error parsing JSON from storage:', error);
      return defaultValue;
    }
  }

  private safeJSONStringify(obj: any): string | null {
    try {
      return JSON.stringify(obj);
    } catch (error) {
      console.error('Error stringifying object for storage:', error);
      return null;
    }
  }

  private encrypt(data: string, key: string): string {
    return CryptoJS.AES.encrypt(data, key).toString();
  }

  private decrypt(encryptedData: string, key: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, key);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Error decrypting data:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  private hashPassword(password: string): string {
    return CryptoJS.SHA256(password).toString();
  }

  private deriveKey(masterPassword: string): string {
    return CryptoJS.PBKDF2(masterPassword, 'khoj-salt', {
      keySize: 256/32,
      iterations: 10000
    }).toString();
  }

  // Master password management
  async setMasterPassword(password: string): Promise<boolean> {
    if (!this.isClient()) return false;

    try {
      const hash = this.hashPassword(password);
      localStorage.setItem(MASTER_PASSWORD_KEY, hash);
      this.masterPassword = password;
      this.encryptionKey = this.deriveKey(password);
      return true;
    } catch (error) {
      console.error('Error setting master password:', error);
      return false;
    }
  }

  async verifyMasterPassword(password: string): Promise<boolean> {
    if (!this.isClient()) return false;

    try {
      const storedHash = localStorage.getItem(MASTER_PASSWORD_KEY);
      if (!storedHash) return false;

      const inputHash = this.hashPassword(password);
      if (inputHash !== storedHash) return false;

      this.masterPassword = password;
      this.encryptionKey = this.deriveKey(password);
      return true;
    } catch (error) {
      console.error('Error verifying master password:', error);
      return false;
    }
  }

  isUnlocked(): boolean {
    return this.masterPassword !== null && this.encryptionKey !== null;
  }

  lock(): void {
    this.masterPassword = null;
    this.encryptionKey = null;
  }

  // Password storage
  private loadPasswords(): PasswordEntry[] {
    if (!this.isClient() || !this.encryptionKey) {
      return [];
    }

    const stored = localStorage.getItem(PASSWORDS_KEY);
    if (!stored) return [];

    try {
      const decrypted = this.decrypt(stored, this.encryptionKey);
      return this.safeJSONParse(decrypted, []);
    } catch (error) {
      console.error('Error loading passwords:', error);
      return [];
    }
  }

  private savePasswords(passwords: PasswordEntry[]): void {
    if (!this.isClient() || !this.encryptionKey) return;

    try {
      const serialized = this.safeJSONStringify(passwords);
      if (serialized) {
        const encrypted = this.encrypt(serialized, this.encryptionKey);
        localStorage.setItem(PASSWORDS_KEY, encrypted);
      }
    } catch (error) {
      console.error('Error saving passwords:', error);
    }
  }

  // Password CRUD operations
  async addPassword(entry: Omit<PasswordEntry, 'id' | 'dateCreated' | 'dateModified'>): Promise<PasswordEntry | null> {
    if (!this.isUnlocked()) return null;

    const newEntry: PasswordEntry = {
      ...entry,
      id: Date.now().toString(),
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString(),
    };

    const passwords = this.loadPasswords();
    passwords.unshift(newEntry);
    this.savePasswords(passwords);

    return newEntry;
  }

  async updatePassword(id: string, updates: Partial<PasswordEntry>): Promise<PasswordEntry | null> {
    if (!this.isUnlocked()) return null;

    const passwords = this.loadPasswords();
    const index = passwords.findIndex(p => p.id === id);

    if (index === -1) return null;

    passwords[index] = {
      ...passwords[index],
      ...updates,
      dateModified: new Date().toISOString(),
    };

    this.savePasswords(passwords);
    return passwords[index];
  }

  async deletePassword(id: string): Promise<boolean> {
    if (!this.isUnlocked()) return false;

    const passwords = this.loadPasswords();
    const filtered = passwords.filter(p => p.id !== id);

    if (filtered.length === passwords.length) return false;

    this.savePasswords(filtered);
    return true;
  }

  async getPassword(id: string): Promise<PasswordEntry | null> {
    if (!this.isUnlocked()) return null;

    const passwords = this.loadPasswords();
    return passwords.find(p => p.id === id) || null;
  }

  async getAllPasswords(): Promise<PasswordEntry[]> {
    if (!this.isUnlocked()) return [];

    return this.loadPasswords();
  }

  async searchPasswords(query: string): Promise<PasswordEntry[]> {
    if (!this.isUnlocked()) return [];

    const passwords = this.loadPasswords();
    const lowercaseQuery = query.toLowerCase();

    return passwords.filter(password =>
      password.title.toLowerCase().includes(lowercaseQuery) ||
      password.username.toLowerCase().includes(lowercaseQuery) ||
      password.url.toLowerCase().includes(lowercaseQuery) ||
      password.notes?.toLowerCase().includes(lowercaseQuery) ||
      password.category?.toLowerCase().includes(lowercaseQuery) ||
      password.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  async getPasswordsByUrl(url: string): Promise<PasswordEntry[]> {
    if (!this.isUnlocked()) return [];

    const passwords = this.loadPasswords();
    const urlObj = new URL(url);
    const domain = urlObj.hostname;

    return passwords.filter(password => {
      try {
        const passwordUrl = new URL(password.url);
        return passwordUrl.hostname === domain;
      } catch {
        return password.url.includes(domain);
      }
    });
  }

  // Password generation
  generatePassword(options: Partial<PasswordGeneratorOptions> = {}): string {
    const defaultOptions: PasswordGeneratorOptions = {
      length: 16,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeSimilar: true,
    };

    const finalOptions = { ...defaultOptions, ...options };
    
    let charset = '';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const similar = 'il1Lo0O';

    if (finalOptions.includeUppercase) {
      charset += finalOptions.excludeSimilar ? 
        uppercase.split('').filter(c => !similar.includes(c)).join('') : 
        uppercase;
    }

    if (finalOptions.includeLowercase) {
      charset += finalOptions.excludeSimilar ? 
        lowercase.split('').filter(c => !similar.includes(c)).join('') : 
        lowercase;
    }

    if (finalOptions.includeNumbers) {
      charset += finalOptions.excludeSimilar ? 
        numbers.split('').filter(c => !similar.includes(c)).join('') : 
        numbers;
    }

    if (finalOptions.includeSymbols) {
      charset += symbols;
    }

    if (!charset) {
      throw new Error('No character sets selected for password generation');
    }

    let password = '';
    const array = new Uint32Array(finalOptions.length);
    crypto.getRandomValues(array);

    for (let i = 0; i < finalOptions.length; i++) {
      password += charset[array[i] % charset.length];
    }

    // Ensure at least one character from each selected set
    if (finalOptions.includeUppercase && !/[A-Z]/.test(password)) {
      const pos = Math.floor(Math.random() * password.length);
      password = password.substring(0, pos) + 
        uppercase[Math.floor(Math.random() * uppercase.length)] + 
        password.substring(pos + 1);
    }

    if (finalOptions.includeLowercase && !/[a-z]/.test(password)) {
      const pos = Math.floor(Math.random() * password.length);
      password = password.substring(0, pos) + 
        lowercase[Math.floor(Math.random() * lowercase.length)] + 
        password.substring(pos + 1);
    }

    if (finalOptions.includeNumbers && !/[0-9]/.test(password)) {
      const pos = Math.floor(Math.random() * password.length);
      password = password.substring(0, pos) + 
        numbers[Math.floor(Math.random() * numbers.length)] + 
        password.substring(pos + 1);
    }

    if (finalOptions.includeSymbols && !/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
      const pos = Math.floor(Math.random() * password.length);
      password = password.substring(0, pos) + 
        symbols[Math.floor(Math.random() * symbols.length)] + 
        password.substring(pos + 1);
    }

    return password;
  }

  // Utility methods
  async exportPasswords(): Promise<string | null> {
    if (!this.isUnlocked()) return null;

    try {
      const passwords = this.loadPasswords();
      return this.safeJSONStringify({
        passwords,
        exportDate: new Date().toISOString(),
        version: '1.0'
      });
    } catch (error) {
      console.error('Error exporting passwords:', error);
      return null;
    }
  }

  async importPasswords(jsonData: string): Promise<boolean> {
    if (!this.isUnlocked()) return false;

    try {
      const data = JSON.parse(jsonData);
      
      if (!data.passwords || !Array.isArray(data.passwords)) {
        throw new Error('Invalid import data format');
      }

      const passwords = this.loadPasswords();
      const importedPasswords = data.passwords.map((p: any) => ({
        ...p,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        dateModified: new Date().toISOString(),
      }));

      const mergedPasswords = [...importedPasswords, ...passwords];
      this.savePasswords(mergedPasswords);

      return true;
    } catch (error) {
      console.error('Error importing passwords:', error);
      return false;
    }
  }

  hasMasterPassword(): boolean {
    if (!this.isClient()) return false;
    return localStorage.getItem(MASTER_PASSWORD_KEY) !== null;
  }

  async changeMasterPassword(newPassword: string): Promise<boolean> {
    if (!this.isUnlocked()) return false;

    try {
      const passwords = this.loadPasswords();
      
      // Update master password
      await this.setMasterPassword(newPassword);
      
      // Re-encrypt passwords with new key
      this.savePasswords(passwords);
      
      return true;
    } catch (error) {
      console.error('Error changing master password:', error);
      return false;
    }
  }
}

export const passwordManager = new PasswordManager();
