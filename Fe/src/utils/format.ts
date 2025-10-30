export const formatPrice = (value: number) => {
    return value.toLocaleString("vi-VN") + "đ";
}
export const getImage = (path: string) => {
    if (/^https?:\/\//.test(path)) {
        return path;
    }
    return import.meta.env.VITE_API_URL + path; 
}

export const formatDateTime = (isoString: any): string =>{
    const date = new Date(isoString);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // tháng bắt đầu từ 0
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
}
export const formatDate = (isoString: any): string => {
    const date = new Date(isoString);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // tháng bắt đầu từ 0
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}