import { Bounce, toast } from "react-toastify";

export const notification = (text: string, type: 'error' | 'success', time?: number) => {
    if (type === 'success') {
        toast.success(`${text}`, {
            position: "bottom-right",
            autoClose: time || 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            transition: Bounce,
        });
    }
    if (type === 'error') {
        toast.error(`${text}`, {
            position: "top-right",
            autoClose: time || 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
            transition: Bounce,
        });
    }
};