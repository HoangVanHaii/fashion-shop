export const formatPrice = (value: number) => {
    return value.toLocaleString("vi-VN") + "đ";
}
export const getImage = (path: string) => {
    if (/^https?:\/\//.test(path)) {
        return path;
    }
    return `http://localhost:3000${path}`;
}