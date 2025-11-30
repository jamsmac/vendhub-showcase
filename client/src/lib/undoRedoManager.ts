/**
 * UndoRedoManager - Client-side state management for undo/redo operations
 * 
 * Manages undo/redo stack for import operations with support for:
 * - Multiple concurrent import sessions
 * - Undo/redo history tracking
 * - State snapshots and rollback
 */

export interface ImportOperation {
  id: number;
  dictionaryCode: string;
  fileName: string;
  totalRecords: number;
  successfulRecords: number;
  failedRecords: number;
  status: "pending" | "in_progress" | "completed" | "failed" | "rolled_back";
  importMode: "create" | "update" | "upsert";
  timestamp: Date;
  errorLog?: string;
}

export interface UndoRedoState {
  operation: ImportOperation;
  previousState?: Record<string, any>;
  newState?: Record<string, any>;
  canUndo: boolean;
  canRedo: boolean;
}

export interface UndoRedoStack {
  past: UndoRedoState[];
  present: UndoRedoState | null;
  future: UndoRedoState[];
}

export class UndoRedoManager {
  private stacks: Map<number, UndoRedoStack> = new Map();
  private maxStackSize = 50;
  private listeners: Set<(importId: number) => void> = new Set();

  /**
   * Initialize a new undo/redo stack for an import operation
   */
  initializeStack(importId: number, operation: ImportOperation): void {
    const state: UndoRedoState = {
      operation,
      canUndo: false,
      canRedo: false,
    };

    this.stacks.set(importId, {
      past: [],
      present: state,
      future: [],
    });

    this.notifyListeners(importId);
  }

  /**
   * Push a new state onto the undo stack
   */
  pushState(
    importId: number,
    operation: ImportOperation,
    previousState?: Record<string, any>,
    newState?: Record<string, any>
  ): void {
    const stack = this.stacks.get(importId);
    if (!stack) {
      this.initializeStack(importId, operation);
      return;
    }

    // Add current state to past
    if (stack.present) {
      stack.past.push(stack.present);
    }

    // Limit stack size
    if (stack.past.length > this.maxStackSize) {
      stack.past.shift();
    }

    // Create new present state
    stack.present = {
      operation,
      previousState,
      newState,
      canUndo: stack.past.length > 0,
      canRedo: false,
    };

    // Clear future when new action is taken
    stack.future = [];

    this.notifyListeners(importId);
  }

  /**
   * Undo the last operation
   */
  undo(importId: number): UndoRedoState | null {
    const stack = this.stacks.get(importId);
    if (!stack || stack.past.length === 0) {
      return null;
    }

    // Move present to future
    if (stack.present) {
      stack.future.unshift(stack.present);
    }

    // Pop from past
    stack.present = stack.past.pop() || null;

    if (stack.present) {
      stack.present.canUndo = stack.past.length > 0;
      stack.present.canRedo = stack.future.length > 0;
    }

    this.notifyListeners(importId);
    return stack.present;
  }

  /**
   * Redo the last undone operation
   */
  redo(importId: number): UndoRedoState | null {
    const stack = this.stacks.get(importId);
    if (!stack || stack.future.length === 0) {
      return null;
    }

    // Move present to past
    if (stack.present) {
      stack.past.push(stack.present);
    }

    // Pop from future
    stack.present = stack.future.shift() || null;

    if (stack.present) {
      stack.present.canUndo = stack.past.length > 0;
      stack.present.canRedo = stack.future.length > 0;
    }

    this.notifyListeners(importId);
    return stack.present;
  }

  /**
   * Get current state
   */
  getCurrentState(importId: number): UndoRedoState | null {
    const stack = this.stacks.get(importId);
    return stack?.present || null;
  }

  /**
   * Get undo/redo capabilities
   */
  getCapabilities(importId: number): { canUndo: boolean; canRedo: boolean } {
    const state = this.getCurrentState(importId);
    return {
      canUndo: state?.canUndo ?? false,
      canRedo: state?.canRedo ?? false,
    };
  }

  /**
   * Get full stack for an import
   */
  getStack(importId: number): UndoRedoStack | null {
    return this.stacks.get(importId) || null;
  }

  /**
   * Clear stack for an import
   */
  clearStack(importId: number): void {
    this.stacks.delete(importId);
    this.notifyListeners(importId);
  }

  /**
   * Clear all stacks
   */
  clearAllStacks(): void {
    this.stacks.clear();
  }

  /**
   * Get history for an import
   */
  getHistory(importId: number): UndoRedoState[] {
    const stack = this.stacks.get(importId);
    if (!stack) return [];

    const history: UndoRedoState[] = [...stack.past];
    if (stack.present) {
      history.push(stack.present);
    }
    history.push(...stack.future);

    return history;
  }

  /**
   * Subscribe to state changes
   */
  subscribe(callback: (importId: number) => void): () => void {
    this.listeners.add(callback);

    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(importId: number): void {
    this.listeners.forEach((callback) => {
      callback(importId);
    });
  }

  /**
   * Export state for persistence
   */
  exportState(importId: number): string {
    const stack = this.stacks.get(importId);
    return JSON.stringify(stack || null);
  }

  /**
   * Import state from persistence
   */
  importState(importId: number, state: string): void {
    try {
      const stack = JSON.parse(state) as UndoRedoStack;
      this.stacks.set(importId, stack);
      this.notifyListeners(importId);
    } catch (error) {
      console.error("Failed to import undo/redo state:", error);
    }
  }
}

// Singleton instance
export const undoRedoManager = new UndoRedoManager();
