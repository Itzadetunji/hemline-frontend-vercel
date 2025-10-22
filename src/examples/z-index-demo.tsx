/**
 * Z-Index Management Demo
 *
 * This demo showcases the dynamic z-index management system for overlays.
 * It demonstrates how multiple dialogs, drawers, and popovers can be opened
 * simultaneously with proper stacking order.
 */

import { useState } from "preact/hooks";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Drawer } from "@/components/ui/drawer";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export function ZIndexDemo() {
	const [dialog1Open, setDialog1Open] = useState(false);
	const [dialog2Open, setDialog2Open] = useState(false);
	const [dialog3Open, setDialog3Open] = useState(false);
	const [drawerOpen, setDrawerOpen] = useState(false);

	return (
		<div class="p-8 space-y-4">
			<h1 class="text-3xl font-bold mb-4">Z-Index Management Demo</h1>

			<p class="text-grey-600 mb-8">
				This demo shows how the dynamic z-index management system works. Try
				opening multiple dialogs, drawers, and popovers to see how they stack
				properly.
			</p>

			<div class="space-y-4">
				{/* Dialog Examples */}
				<section class="space-y-2">
					<h2 class="text-xl font-semibold">Dialogs</h2>
					<div class="flex gap-2">
						<Dialog
							open={dialog1Open}
							onOpenChange={setDialog1Open}
						>
							<DialogTrigger asChild>
								<Button variant="outline">Open Dialog 1</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Dialog 1</DialogTitle>
									<DialogDescription>
										This is the first dialog. Notice its z-index in the
										DevTools.
									</DialogDescription>
								</DialogHeader>
								<div class="py-4">
									<p class="mb-4">Try opening another dialog from here:</p>
									<Dialog
										open={dialog2Open}
										onOpenChange={setDialog2Open}
									>
										<DialogTrigger asChild>
											<Button variant="outline">Open Dialog 2</Button>
										</DialogTrigger>
										<DialogContent>
											<DialogHeader>
												<DialogTitle>Dialog 2</DialogTitle>
												<DialogDescription>
													This dialog should appear on top of Dialog 1 with a
													higher z-index.
												</DialogDescription>
											</DialogHeader>
											<div class="py-4">
												<p class="mb-4">Want to go deeper? Open another one:</p>
												<Dialog
													open={dialog3Open}
													onOpenChange={setDialog3Open}
												>
													<DialogTrigger asChild>
														<Button variant="outline">Open Dialog 3</Button>
													</DialogTrigger>
													<DialogContent>
														<DialogHeader>
															<DialogTitle>Dialog 3</DialogTitle>
															<DialogDescription>
																This is the third level! It should have the
																highest z-index.
															</DialogDescription>
														</DialogHeader>
														<div class="py-4">
															<p class="text-sm text-grey-600">
																Check the browser DevTools to see the z-index
																values:
																<br />
																<code class="bg-grey-100 px-2 py-1 rounded">
																	Dialog 1: z-index: 60
																</code>
																<br />
																<code class="bg-grey-100 px-2 py-1 rounded">
																	Dialog 2: z-index: 70
																</code>
																<br />
																<code class="bg-grey-100 px-2 py-1 rounded">
																	Dialog 3: z-index: 80
																</code>
															</p>
														</div>
													</DialogContent>
												</Dialog>
											</div>
										</DialogContent>
									</Dialog>
								</div>
							</DialogContent>
						</Dialog>

						<Button
							variant="outline"
							onClick={() => setDrawerOpen(true)}
						>
							Open Drawer
						</Button>
					</div>
				</section>

				{/* Popover Example */}
				<section class="space-y-2">
					<h2 class="text-xl font-semibold">Popovers</h2>
					<div class="flex gap-2">
						<Popover>
							<PopoverTrigger asChild>
								<Button variant="outline">Open Popover</Button>
							</PopoverTrigger>
							<PopoverContent>
								<div class="space-y-2">
									<h3 class="font-medium">Popover Content</h3>
									<p class="text-sm text-grey-600">
										Popovers have a lower z-index (50) than dialogs (60).
									</p>
									<p class="text-sm text-grey-600">
										When you open a dialog, it should appear on top of any
										popover.
									</p>
								</div>
							</PopoverContent>
						</Popover>

						<Popover>
							<PopoverTrigger asChild>
								<Button variant="outline">Another Popover</Button>
							</PopoverTrigger>
							<PopoverContent>
								<div class="space-y-2">
									<h3 class="font-medium">Second Popover</h3>
									<p class="text-sm text-grey-600">
										Multiple popovers can be open, but typically only one should
										be visible.
									</p>
								</div>
							</PopoverContent>
						</Popover>
					</div>
				</section>

				{/* Mixed Example */}
				<section class="space-y-2">
					<h2 class="text-xl font-semibold">Mixed Test</h2>
					<div class="space-y-2">
						<p class="text-sm text-grey-600">
							Try this scenario to test the z-index management:
						</p>
						<ol class="list-decimal list-inside space-y-1 text-sm text-grey-700">
							<li>Open a Popover</li>
							<li>Open Dialog 1 (should appear above the popover)</li>
							<li>
								From Dialog 1, open Dialog 2 (should appear above Dialog 1)
							</li>
							<li>Close Dialog 2 (Dialog 1 should still be visible)</li>
							<li>Open the Drawer (should have the same level as dialogs)</li>
						</ol>
					</div>
				</section>

				{/* Technical Details */}
				<section class="space-y-2 mt-8 p-4 bg-grey-50 rounded-lg">
					<h2 class="text-xl font-semibold">How It Works</h2>
					<div class="space-y-2 text-sm text-grey-700">
						<p>
							<strong>Base Z-Index Values:</strong>
						</p>
						<ul class="list-disc list-inside ml-4 space-y-1">
							<li>Popover: 50</li>
							<li>Dialog: 60</li>
							<li>Drawer: 60</li>
							<li>Toast: 70</li>
							<li>Tooltip: 80</li>
						</ul>
						<p class="mt-4">
							<strong>Dynamic Stacking:</strong>
						</p>
						<p>
							When multiple overlays of the same type are opened, each
							subsequent one gets a z-index increment of +10. For example:
						</p>
						<ul class="list-disc list-inside ml-4 space-y-1">
							<li>First Dialog: 60</li>
							<li>Second Dialog: 70 (60 + 10)</li>
							<li>Third Dialog: 80 (70 + 10)</li>
						</ul>
						<p class="mt-4">
							<strong>Cleanup:</strong>
						</p>
						<p>
							When an overlay is closed, its z-index is released, allowing the
							next overlay to use the appropriate stacking position.
						</p>
					</div>
				</section>
			</div>

			{/* Drawer Component */}
			<Drawer
				isOpen={drawerOpen}
				onClose={() => setDrawerOpen(false)}
			>
				<div class="p-6 space-y-4">
					<h2 class="text-2xl font-bold">Drawer</h2>
					<p class="text-grey-600">
						This drawer should have the same z-index priority as dialogs.
					</p>
					<p class="text-grey-600">
						Try opening a dialog while this drawer is open to see the stacking
						behavior.
					</p>
					<Dialog
						open={dialog1Open}
						onOpenChange={setDialog1Open}
					>
						<DialogTrigger asChild>
							<Button variant="outline">Open Dialog from Drawer</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Dialog from Drawer</DialogTitle>
								<DialogDescription>
									This dialog was opened from the drawer and should appear on
									top.
								</DialogDescription>
							</DialogHeader>
						</DialogContent>
					</Dialog>
				</div>
			</Drawer>
		</div>
	);
}
