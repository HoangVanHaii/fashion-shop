import api from "../../services/api";

export const getShopTodoSummary = async () => {
    const result = await api.get(`/user/shop/todoSummary`);
    return result.data;
}
export const getShopStatistic = async () => {
    const result = await api.get(`/user/shop/statistic`);
    return result.data;
}