/**
 * Firestore読み取り最適化 - キャッシュ戦略
 * 
 * 問題: リアルタイムリスナーで全データ再取得 → 課金爆増
 * 解決: メモリキャッシュ + TTL管理
 * 
 * 期待効果: 読み取り -70%、月額コスト $50 → $15
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class FirestoreCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5分

  /**
   * キャッシュから取得（有効期限チェック付き）
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      // 期限切れ
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * キャッシュに保存
   */
  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.DEFAULT_TTL
    });
  }

  /**
   * キャッシュクリア
   */
  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * キャッシュサイズ取得
   */
  size(): number {
    return this.cache.size;
  }
}

export const firestoreCache = new FirestoreCache();

/**
 * キャッシュ付きフェッチ関数
 */
export async function cachedFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // キャッシュチェック
  const cached = firestoreCache.get<T>(key);
  if (cached) {
    console.log(`📦 キャッシュヒット: ${key}`);
    return cached;
  }

  // キャッシュミス → フェッチ
  console.log(`🔄 キャッシュミス: ${key} - Firestoreから取得`);
  const data = await fetchFn();
  firestoreCache.set(key, data, ttl);
  return data;
}
