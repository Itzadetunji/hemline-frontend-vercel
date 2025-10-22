import { useEffect, useState } from "preact/hooks";

interface ImageCacheEntry {
	url: string;
	objectUrl?: string;
	timestamp: number;
}

class ImageCacheManager {
	private cache: Map<string, ImageCacheEntry> = new Map();
	private loading: Set<string> = new Set();
	private readonly CACHE_EXPIRY = 1000 * 60 * 60 * 24; // 24 hours

	async loadImage(url: string): Promise<string> {
		// Check if image is in cache and not expired
		const cached = this.cache.get(url);
		if (cached && Date.now() - cached.timestamp < this.CACHE_EXPIRY) {
			return cached.objectUrl || url;
		}

		// Check if already loading
		if (this.loading.has(url)) {
			return new Promise((resolve) => {
				const checkInterval = setInterval(() => {
					const entry = this.cache.get(url);
					if (entry && !this.loading.has(url)) {
						clearInterval(checkInterval);
						resolve(entry.objectUrl || url);
					}
				}, 100);
			});
		}

		// Mark as loading
		this.loading.add(url);

		try {
			// Fetch the image
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`Failed to fetch image: ${response.statusText}`);
			}

			const blob = await response.blob();
			const objectUrl = URL.createObjectURL(blob);

			// Store in cache
			this.cache.set(url, {
				url,
				objectUrl,
				timestamp: Date.now(),
			});

			this.loading.delete(url);
			return objectUrl;
		} catch (error) {
			console.error("Error loading image:", error);
			this.loading.delete(url);
			// Return original URL as fallback
			this.cache.set(url, {
				url,
				timestamp: Date.now(),
			});
			return url;
		}
	}

	preloadImages(urls: string[]): void {
		urls.forEach((url) => {
			if (!this.cache.has(url) && !this.loading.has(url)) {
				this.loadImage(url).catch(console.error);
			}
		});
	}

	clearCache(): void {
		// Revoke all object URLs to free memory
		this.cache.forEach((entry) => {
			if (entry.objectUrl) {
				URL.revokeObjectURL(entry.objectUrl);
			}
		});
		this.cache.clear();
	}

	getCacheSize(): number {
		return this.cache.size;
	}
}

// Singleton instance
const imageCacheManager = new ImageCacheManager();

interface UseImageCacheOptions {
	preloadNext?: boolean;
	nextImageUrl?: string;
}

export const useImageCache = (
	imageUrl: string | undefined,
	options: UseImageCacheOptions = {}
) => {
	const [cachedUrl, setCachedUrl] = useState<string | undefined>(imageUrl);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		if (!imageUrl) {
			setIsLoading(false);
			return;
		}

		let isMounted = true;

		const loadImage = async () => {
			setIsLoading(true);
			setError(null);

			try {
				const url = await imageCacheManager.loadImage(imageUrl);
				if (isMounted) {
					setCachedUrl(url);
					setIsLoading(false);
				}

				// Preload next image if specified
				if (options.preloadNext && options.nextImageUrl) {
					imageCacheManager
						.loadImage(options.nextImageUrl)
						.catch(console.error);
				}
			} catch (err) {
				if (isMounted) {
					setError(
						err instanceof Error ? err : new Error("Failed to load image")
					);
					setIsLoading(false);
					setCachedUrl(imageUrl); // Fallback to original URL
				}
			}
		};

		loadImage();

		return () => {
			isMounted = false;
		};
	}, [imageUrl, options.preloadNext, options.nextImageUrl]);

	return { cachedUrl, isLoading, error };
};

// Export the manager for advanced use cases
export const preloadImages = (urls: string[]) => {
	imageCacheManager.preloadImages(urls);
};

export const clearImageCache = () => {
	imageCacheManager.clearCache();
};

export const getImageCacheSize = () => {
	imageCacheManager.getCacheSize();
};
