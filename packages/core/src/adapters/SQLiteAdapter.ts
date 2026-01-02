import type Database from 'better-sqlite3';
import type { StorageAdapter, Appointment, BlockedTime, Provider } from '../types';

/**
 * Configuration options for SQLite database
 */
export interface SQLiteConfig {
  /**
   * Path to the SQLite database file
   * Use ':memory:' for in-memory database
   */
  filename: string;
  
  /**
   * Open database in read-only mode (default: false)
   */
  readonly?: boolean;
  
  /**
   * Fail if database file does not exist (default: false)
   */
  fileMustExist?: boolean;
  
  /**
   * Connection timeout in milliseconds (default: 5000)
   */
  timeout?: number;
  
  /**
   * Enable verbose logging (default: false)
   */
  verbose?: boolean;
}

/**
 * SQLite storage adapter implementation
 * Provides persistent storage using SQLite with file-based database
 * Perfect for local development, testing, and embedded applications
 */
export class SQLiteAdapter implements StorageAdapter {
  private config: SQLiteConfig;
  private db: Database.Database | null = null;
  
  constructor(config: SQLiteConfig) {
    this.config = {
      readonly: false,
      fileMustExist: false,
      timeout: 5000,
      verbose: false,
      ...config,
    };
  }
  
  /**
   * Connect to SQLite database and create tables if they don't exist
   */
  async connect(): Promise<void> {
    const Database = (await import('better-sqlite3')).default;
    
    this.db = new Database(this.config.filename, {
      readonly: this.config.readonly,
      fileMustExist: this.config.fileMustExist,
      timeout: this.config.timeout,
      verbose: this.config.verbose ? console.log : undefined,
    });
    
    // Create tables if they don't exist
    this.createTables();
  }
  
  /**
   * Create database tables with proper indexes
   */
  private createTables(): void {
    if (!this.db) throw new Error('Database not initialized');
    
    // Create appointments table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS appointments (
        id TEXT PRIMARY KEY,
        provider_id TEXT,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        metadata TEXT
      )
    `);
    
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_appointments_provider_id ON appointments(provider_id)
    `);
    
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON appointments(start_time)
    `);
    
    // Create blocked_times table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS blocked_times (
        id TEXT PRIMARY KEY,
        provider_id TEXT,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        reason TEXT
      )
    `);
    
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_blocked_times_provider_id ON blocked_times(provider_id)
    `);
    
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_blocked_times_start_time ON blocked_times(start_time)
    `);
    
    // Create providers table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS providers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        metadata TEXT
      )
    `);
  }
  
  /**
   * Disconnect from SQLite database
   */
  async disconnect(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
  
  /**
   * Convert SQLite row to Appointment
   */
  private rowToAppointment(row: Record<string, any>): Appointment {
    return {
      id: row.id,
      providerId: row.provider_id,
      startTime: row.start_time,
      endTime: row.end_time,
      metadata: row.metadata ? JSON.parse(row.metadata) : {},
    };
  }
  
  /**
   * Convert SQLite row to BlockedTime
   */
  private rowToBlockedTime(row: Record<string, any>): BlockedTime {
    return {
      id: row.id,
      providerId: row.provider_id,
      startTime: row.start_time,
      endTime: row.end_time,
      reason: row.reason,
    };
  }
  
  /**
   * Convert SQLite row to Provider
   */
  private rowToProvider(row: Record<string, any>): Provider {
    return {
      id: row.id,
      name: row.name,
      metadata: row.metadata ? JSON.parse(row.metadata) : {},
    };
  }
  
  // Appointment operations
  
  async saveAppointment(appointment: Appointment): Promise<Appointment> {
    if (!this.db) throw new Error('Database not initialized');
    
    const stmt = this.db.prepare(`
      INSERT INTO appointments (id, provider_id, start_time, end_time, metadata)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      appointment.id,
      appointment.providerId,
      appointment.startTime,
      appointment.endTime,
      JSON.stringify(appointment.metadata || {})
    );
    
    return appointment;
  }
  
  async getAppointment(id: string): Promise<Appointment | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const stmt = this.db.prepare('SELECT * FROM appointments WHERE id = ?');
    const row = stmt.get(id) as Record<string, any> | undefined;
    
    if (!row) return null;
    return this.rowToAppointment(row);
  }
  
  async getAllAppointments(providerId?: string): Promise<Appointment[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    let query = 'SELECT * FROM appointments';
    const params: any[] = [];
    
    if (providerId) {
      query += ' WHERE provider_id = ?';
      params.push(providerId);
    }
    
    const stmt = this.db.prepare(query);
    const rows = stmt.all(...params) as Record<string, any>[];
    
    return rows.map((row) => this.rowToAppointment(row));
  }
  
  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    if (!this.db) throw new Error('Database not initialized');
    
    const setClauses: string[] = [];
    const params: any[] = [];
    
    if (updates.providerId !== undefined) {
      setClauses.push('provider_id = ?');
      params.push(updates.providerId);
    }
    if (updates.startTime !== undefined) {
      setClauses.push('start_time = ?');
      params.push(updates.startTime);
    }
    if (updates.endTime !== undefined) {
      setClauses.push('end_time = ?');
      params.push(updates.endTime);
    }
    if (updates.metadata !== undefined) {
      setClauses.push('metadata = ?');
      params.push(JSON.stringify(updates.metadata));
    }
    
    if (setClauses.length > 0) {
      params.push(id);
      const stmt = this.db.prepare(`
        UPDATE appointments
        SET ${setClauses.join(', ')}
        WHERE id = ?
      `);
      stmt.run(...params);
    }
    
    const updated = await this.getAppointment(id);
    if (!updated) throw new Error(`Appointment ${id} not found`);
    
    return updated;
  }
  
  async deleteAppointment(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const stmt = this.db.prepare('DELETE FROM appointments WHERE id = ?');
    stmt.run(id);
  }
  
  // Blocked time operations
  
  async saveBlockedTime(blockedTime: BlockedTime): Promise<BlockedTime> {
    if (!this.db) throw new Error('Database not initialized');
    
    const stmt = this.db.prepare(`
      INSERT INTO blocked_times (id, provider_id, start_time, end_time, reason)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      blockedTime.id,
      blockedTime.providerId,
      blockedTime.startTime,
      blockedTime.endTime,
      blockedTime.reason
    );
    
    return blockedTime;
  }
  
  async getBlockedTime(id: string): Promise<BlockedTime | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const stmt = this.db.prepare('SELECT * FROM blocked_times WHERE id = ?');
    const row = stmt.get(id) as Record<string, any> | undefined;
    
    if (!row) return null;
    return this.rowToBlockedTime(row);
  }
  
  async getAllBlockedTimes(providerId?: string): Promise<BlockedTime[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    let query = 'SELECT * FROM blocked_times';
    const params: any[] = [];
    
    if (providerId) {
      query += ' WHERE provider_id = ?';
      params.push(providerId);
    }
    
    const stmt = this.db.prepare(query);
    const rows = stmt.all(...params) as Record<string, any>[];
    
    return rows.map((row) => this.rowToBlockedTime(row));
  }
  
  async deleteBlockedTime(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const stmt = this.db.prepare('DELETE FROM blocked_times WHERE id = ?');
    stmt.run(id);
  }
  
  // Provider operations
  
  async saveProvider(provider: Provider): Promise<Provider> {
    if (!this.db) throw new Error('Database not initialized');
    
    const stmt = this.db.prepare(`
      INSERT INTO providers (id, name, metadata)
      VALUES (?, ?, ?)
    `);
    
    stmt.run(
      provider.id,
      provider.name,
      JSON.stringify(provider.metadata || {})
    );
    
    return provider;
  }
  
  async getProvider(id: string): Promise<Provider | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const stmt = this.db.prepare('SELECT * FROM providers WHERE id = ?');
    const row = stmt.get(id) as Record<string, any> | undefined;
    
    if (!row) return null;
    return this.rowToProvider(row);
  }
  
  async getAllProviders(): Promise<Provider[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const stmt = this.db.prepare('SELECT * FROM providers');
    const rows = stmt.all() as Record<string, any>[];
    
    return rows.map((row) => this.rowToProvider(row));
  }
  
  async deleteProvider(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const stmt = this.db.prepare('DELETE FROM providers WHERE id = ?');
    stmt.run(id);
  }
  
  /**
   * Clear all data (useful for testing)
   */
  async clear(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    this.db.exec('DELETE FROM appointments');
    this.db.exec('DELETE FROM blocked_times');
    this.db.exec('DELETE FROM providers');
  }
}
