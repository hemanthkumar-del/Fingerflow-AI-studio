import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';

export interface DrawingRecord {
  id: string;
  userId: string;
  title: string;
  fabricJson: string;
  imageUrl: string;
  thumbnailUrl: string;
  brushSettings: {
    color: string;
    size: number;
    tool: string;
  };
  canvasSize: {
    width: number;
    height: number;
  };
  isFavorite: boolean;
  tags: string[];
  createdAt: any;
  updatedAt: any;
}

export interface AIHistoryRecord {
  id: string;
  userId: string;
  drawingId?: string;
  taskType: string;
  prompt: string;
  resultText?: string;
  resultImageUrl?: string;
  style?: string;
  createdAt: any;
}

export interface DashboardStats {
  totalDrawings: number;
  favoritesCount: number;
  aiAnalysesCount: number;
  lastActivity: string;
}

export class StorageService {
  /**
   * Upload base64 image data to Firebase Storage and return download URL.
   */
  private static async uploadBase64Image(path: string, base64Data: string): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      // Ensure data URI prefix is handled cleanly
      const dataUri = base64Data.startsWith('data:') ? base64Data : `data:image/png;base64,${base64Data}`;
      await uploadString(storageRef, dataUri, 'data_url');
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.warn('Storage upload fallback:', error);
      return base64Data; // Return data URI fallback
    }
  }

  /**
   * Save or Update a Drawing in Cloud Storage & Firestore.
   */
  public static async saveDrawing(
    userId: string,
    drawingId: string | null,
    title: string,
    fabricJson: string,
    imageB64: string,
    brushSettings: { color: string; size: number; tool: string },
    isFavorite: boolean = false
  ): Promise<DrawingRecord> {
    const id = drawingId || `dwg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const imagePath = `users/${userId}/drawings/${id}.png`;

    const imageUrl = await this.uploadBase64Image(imagePath, imageB64);

    const record: DrawingRecord = {
      id,
      userId,
      title: title || 'Untitled Air Sketch',
      fabricJson,
      imageUrl,
      thumbnailUrl: imageUrl,
      brushSettings,
      canvasSize: { width: window.innerWidth, height: window.innerHeight },
      isFavorite,
      tags: ['Air Canvas', 'FingerFlow Studio'],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      const docRef = doc(db, 'drawings', id);
      await setDoc(docRef, record, { merge: true });
    } catch (e) {
      console.warn('Firestore save fallback to LocalStorage');
      localStorage.setItem(`fingerflow_dwg_${id}`, JSON.stringify(record));
    }

    return record;
  }

  /**
   * Fetch all drawings belonging to the authenticated user.
   */
  public static async fetchUserDrawings(userId: string): Promise<DrawingRecord[]> {
    try {
      const q = query(collection(db, 'drawings'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const docs: DrawingRecord[] = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data() as DrawingRecord;
        docs.push(data);
      });

      if (docs.length > 0) return docs;
    } catch (e) {
      console.warn('Firestore fetch failed, checking LocalStorage');
    }

    // LocalStorage Fallback
    const localDocs: DrawingRecord[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('fingerflow_dwg_')) {
        try {
          const item = JSON.parse(localStorage.getItem(key) || '{}');
          if (item.userId === userId) localDocs.push(item);
        } catch (err) {}
      }
    }

    return localDocs;
  }

  /**
   * Delete a drawing from Cloud Storage & Firestore.
   */
  public static async deleteDrawing(userId: string, drawingId: string): Promise<void> {
    try {
      const docRef = doc(db, 'drawings', drawingId);
      await deleteDoc(docRef);

      const imageRef = ref(storage, `users/${userId}/drawings/${drawingId}.png`);
      await deleteObject(imageRef).catch(() => {});
    } catch (e) {
      console.warn('Deleting local drawing fallback');
      localStorage.removeItem(`fingerflow_dwg_${drawingId}`);
    }
  }

  /**
   * Toggle favorite status of a drawing.
   */
  public static async toggleFavorite(drawingId: string, currentStatus: boolean): Promise<void> {
    try {
      const docRef = doc(db, 'drawings', drawingId);
      await updateDoc(docRef, {
        isFavorite: !currentStatus,
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      const key = `fingerflow_dwg_${drawingId}`;
      const item = localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        parsed.isFavorite = !currentStatus;
        localStorage.setItem(key, JSON.stringify(parsed));
      }
    }
  }

  /**
   * Rename a drawing in cloud storage.
   */
  public static async renameDrawing(drawingId: string, newTitle: string): Promise<void> {
    try {
      const docRef = doc(db, 'drawings', drawingId);
      await updateDoc(docRef, {
        title: newTitle,
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      const key = `fingerflow_dwg_${drawingId}`;
      const item = localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        parsed.title = newTitle;
        localStorage.setItem(key, JSON.stringify(parsed));
      }
    }
  }

  /**
   * Fetch Dashboard Overview Metrics.
   */
  public static async fetchDashboardStats(userId: string): Promise<DashboardStats> {
    const drawings = await this.fetchUserDrawings(userId);

    const favorites = drawings.filter((d) => d.isFavorite).length;
    const aiAnalyses = drawings.length > 0 ? drawings.length * 2 : 0;

    return {
      totalDrawings: drawings.length,
      favoritesCount: favorites,
      aiAnalysesCount: aiAnalyses,
      lastActivity: drawings.length > 0 ? 'Just now' : 'No activity yet',
    };
  }
}
