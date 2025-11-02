// import { defineStore } from "pinia";
// import { addAddress, getAddressesByUser, updateAddress } from "../services/address";
// import type { Address } from "../interfaces/address";
// import { ref } from "vue";
// export const useAddressStore = defineStore('address',()=>{
//     const listAddress = ref<Address[]>([])
//     const loadingAddress = ref<boolean>(false)
//     const addressDefault = ref<Address>({    
//         name: "",
//         address: "",
//         phone: "",
//         is_default: false,
//     })
//     const getAddressesByUserStore = async () =>{
//         try {
//             const res:any= await getAddressesByUser();
//             listAddress.value = res.data;
//             const defaultAddr = listAddress.value.find(a => a.is_default);
//              if (defaultAddr) {
//         addressDefault.value = defaultAddr;
//         } else if (listAddress.value.length > 0) {
//             addressDefault.value = listAddress.value[0] as Address;
//         }
//             return res.data as Address
//         } catch (error) {
//             console.log(error)
//             throw error;
//         }
//     }

//     const updateAddressStore = async (address:Address)=>{
//         try {
//             const res = await updateAddress(address);
//             if(address.is_default) addressDefault.value = address
//             return res
//         } catch (error) {
//             console.log(error)
//             throw error;
//         }
//     }

//     const addAddressStore = async (address:Address)=>{
//         try {
//             const res = await addAddress(address);
//             if(address.is_default) addressDefault.value = address
//             return res
//         } catch (error) {
//             console.log(error)
//             throw error;
//         }
//     }
//     return{
//         listAddress,
//         getAddressesByUserStore,
//         addressDefault,
//         updateAddressStore,
//         addAddressStore
//     }
// })

import { defineStore } from "pinia";
import { addAddress, deleteAddress, getAddressesByUser, updateAddress } from "../services/address";
import type { Address } from "../interfaces/address";
import { ref } from "vue";

export const useAddressStore = defineStore('address', () => {
    const listAddress = ref<Address[]>([])
    const loadingAddress = ref<boolean>(false)
    const addressDefault = ref<Address>({    
        name: "",
        address: "",
        phone: "",
        is_default: false,
    })

    const getAddressesByUserStore = async () => {
        loadingAddress.value = true  
        try {
            const res: any = await getAddressesByUser();
            listAddress.value = res.data;
            const defaultAddr = listAddress.value.find(a => a.is_default);
            if (defaultAddr) {
                addressDefault.value = defaultAddr;
            } else if (listAddress.value.length > 0) {
                addressDefault.value = listAddress.value[0] as Address;
            }
            return res.data as Address
        } catch (error) {
            console.log(error)
            throw error;
        } finally {
            loadingAddress.value = false  
        }
    }

    const updateAddressStore = async (address: Address) => {
        loadingAddress.value = true  
        try {
            const res = await updateAddress(address);
            if (address.is_default) addressDefault.value = address
            await getAddressesByUserStore() 
            return res
        } catch (error) {
            console.log(error)
            throw error;
        } finally {
            loadingAddress.value = false  
        }
    }

    const addAddressStore = async (address: Address) => {
        loadingAddress.value = true 
        try {
            const res = await addAddress(address);
            if (address.is_default) addressDefault.value = address
            await getAddressesByUserStore()  
            return res
        } catch (error) {
            console.log(error)
            throw error;
        } finally {
            loadingAddress.value = false  
        }
    }

    const deleteAddressStore = async (addressId: number) => {
        loadingAddress.value = true;
        try {
            await deleteAddress(addressId)
            if (addressDefault.value && addressDefault.value.id === addressId) {
                addressDefault.value = { name: "", address: "", phone: "", is_default: false };
            }
            await getAddressesByUserStore();
        } catch (error) {
            console.log(error);
            throw error;
        } finally {
            loadingAddress.value = false;
        }
    }

    return {
        listAddress,
        getAddressesByUserStore,
        addressDefault,
        updateAddressStore,
        addAddressStore,
        loadingAddress,
        deleteAddressStore
    }
})