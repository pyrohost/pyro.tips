export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
	id: string;
	type: ToastType;
	title: string;
	message: string;
}

export const toastsStore = $state<{
	toasts: Toast[];
}>({
	toasts: []
});

export const showToast = (toast: Omit<Toast, 'id'>) => {
	const id = crypto.randomUUID();
	// toasts = [...toasts, { ...toast, id }];
	// setTimeout(() => {
	// 	toasts = toasts.filter((t) => t.id !== id);
	// }, 5000);
	toastsStore.toasts = [...toastsStore.toasts, { ...toast, id }];
	setTimeout(() => {
		toastsStore.toasts = toastsStore.toasts.filter((t) => t.id !== id);
	}, 5000);
};

export const hideToast = (toast: string | Toast) => {
	const id = typeof toast === 'string' ? toast : 'id' in toast ? toast.id : '';
	if (id) {
		// toasts = toasts.filter((t) => t.id !== id);
		toastsStore.toasts = toastsStore.toasts.filter((t) => t.id !== id);
	}
};
