import * as fs from 'fs';
import * as path from 'path';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  component: string;
  message: string;
  data?: any;
}

export class Logger {
  private static logLevel: LogLevel = LogLevel.INFO;
  private static logFile: string | null = null;
  private static logBuffer: LogEntry[] = [];
  private static maxBufferSize = 1000;
  private static flushInterval = 5000; // 5 seconds
  private static flushTimer: NodeJS.Timeout | null = null;

  private component: string;

  constructor(component: string) {
    this.component = component;
    
    // Initialize logging on first instance
    if (!Logger.flushTimer) {
      Logger.initializeLogging();
    }
  }

  private static initializeLogging(): void {
    try {
      const os = require('os');
      const logDir = path.join(os.tmpdir(), 'freeze-guard-logs');
      
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      
      const logFileName = `freeze-guard-${new Date().toISOString().split('T')[0]}.log`;
      Logger.logFile = path.join(logDir, logFileName);
      
      // Start periodic flush
      Logger.flushTimer = setInterval(() => {
        Logger.flushLogs();
      }, Logger.flushInterval);
      
      // Cleanup old log files (keep last 7 days)
      Logger.cleanupOldLogs(logDir);
    } catch (error) {
      console.error('Failed to initialize logging:', error);
    }
  }

  private static cleanupOldLogs(logDir: string): void {
    try {
      const files = fs.readdirSync(logDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 7);
      
      for (const file of files) {
        if (file.startsWith('freeze-guard-') && file.endsWith('.log')) {
          const filePath = path.join(logDir, file);
          const stats = fs.statSync(filePath);
          
          if (stats.mtime < cutoffDate) {
            fs.unlinkSync(filePath);
          }
        }
      }
    } catch (error) {
      console.error('Failed to cleanup old logs:', error);
    }
  }

  private static flushLogs(): void {
    if (!Logger.logFile || Logger.logBuffer.length === 0) {
      return;
    }
    
    try {
      const logEntries = Logger.logBuffer.splice(0);
      const logLines = logEntries.map(entry => Logger.formatLogEntry(entry));
      const logContent = logLines.join('\n') + '\n';
      
      fs.appendFileSync(Logger.logFile, logContent);
    } catch (error) {
      console.error('Failed to flush logs:', error);
    }
  }

  private static formatLogEntry(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const level = LogLevel[entry.level].padEnd(5);
    const component = entry.component.padEnd(20);
    const message = entry.message;
    const data = entry.data ? ` | ${JSON.stringify(entry.data)}` : '';
    
    return `${timestamp} [${level}] ${component} ${message}${data}`;
  }

  private log(level: LogLevel, message: string, data?: any): void {
    if (level < Logger.logLevel) {
      return;
    }
    
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      component: this.component,
      message,
      data,
    };
    
    // Add to buffer
    Logger.logBuffer.push(entry);
    
    // Flush if buffer is full
    if (Logger.logBuffer.length >= Logger.maxBufferSize) {
      Logger.flushLogs();
    }
    
    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      const formattedMessage = Logger.formatLogEntry(entry);
      
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(formattedMessage);
          break;
        case LogLevel.INFO:
          console.info(formattedMessage);
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage);
          break;
        case LogLevel.ERROR:
          console.error(formattedMessage);
          break;
      }
    }
  }

  public debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  public info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  public warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  public error(message: string, data?: any): void {
    this.log(LogLevel.ERROR, message, data);
  }

  public static setLogLevel(level: LogLevel): void {
    Logger.logLevel = level;
  }

  public static getLogLevel(): LogLevel {
    return Logger.logLevel;
  }

  public static async getLogs(lines: number = 100): Promise<string[]> {
    if (!Logger.logFile) {
      return [];
    }
    
    try {
      // Flush current buffer first
      Logger.flushLogs();
      
      const content = fs.readFileSync(Logger.logFile, 'utf-8');
      const allLines = content.split('\n').filter(line => line.trim());
      
      return allLines.slice(-lines);
    } catch (error) {
      console.error('Failed to read logs:', error);
      return [];
    }
  }

  public static cleanup(): void {
    if (Logger.flushTimer) {
      clearInterval(Logger.flushTimer);
      Logger.flushTimer = null;
    }
    
    // Final flush
    Logger.flushLogs();
  }

  // Performance monitoring utilities
  public time(label: string): void {
    console.time(`${this.component}:${label}`);
  }

  public timeEnd(label: string): void {
    console.timeEnd(`${this.component}:${label}`);
  }

  public profile(operation: string): () => void {
    const startTime = process.hrtime.bigint();
    const startMemory = process.memoryUsage();
    
    return () => {
      const endTime = process.hrtime.bigint();
      const endMemory = process.memoryUsage();
      
      const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
      const memoryDelta = endMemory.heapUsed - startMemory.heapUsed;
      
      this.info(`Performance: ${operation}`, {
        duration: `${duration.toFixed(2)}ms`,
        memoryDelta: `${(memoryDelta / 1024 / 1024).toFixed(2)}MB`,
      });
    };
  }
}