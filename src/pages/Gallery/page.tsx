import { useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";

import { useInfiniteGetGalleries } from "@/api/http/v1/gallery/gallery.hooks";
import type { GalleryImage } from "@/api/http/v1/gallery/gallery.types";
import { preloadImages } from "@/hooks/useImageCache";
import { headerContentSignal } from "@/layout/Header";

export const Gallery = () => {
	const observerTarget = useRef<HTMLDivElement>(null);

	const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
		useInfiniteGetGalleries(20);

	// Intersection Observer for infinite scroll
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
					fetchNextPage();
				}
			},
			{ threshold: 0.1 }
		);

		const currentTarget = observerTarget.current;
		if (currentTarget) {
			observer.observe(currentTarget);
		}

		return () => {
			if (currentTarget) {
				observer.unobserve(currentTarget);
			}
		};
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	// Flatten all pages into a single array of images
	const allImages = data?.pages.flatMap((page) => page.data) ?? [];

	// Preload images when they are fetched
	useEffect(() => {
		if (allImages.length > 0) {
			const urls = allImages.map((img) => img.url);
			preloadImages(urls);
		}
	}, [allImages.length]);

	useLayoutEffect(() => {
		headerContentSignal.value = "Folders";
	}, []);

	return <div class="flex flex-col flex-1 pb-8">FOlders</div>;
};
