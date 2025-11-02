import type { Address } from "../interfaces/address";
import api from "./api";
export const getAddressesByUser = async() =>{
    const response = await api.get('address/getAddressesByUser');
    return response.data;
}

 export const updateAddress = async (address: Address) =>{
    const response = await api.put(`address/${address.id}`,{
        name:address.name,
        address:address.address,
        phone:address.phone,
        is_default:address.is_default
    })
    return response.data
 }

export const addAddress = async (address: Address)=>{
    const response = await api.post('address/addAddress',{
        name:address.name,
        address:address.address,
        phone:address.phone,
        is_default:address.is_default
    })
    return response.data
}

export const deleteAddress = async (addressId: number) => {
    const response = await api.delete(`address/${addressId}`)
    return response.data
}

