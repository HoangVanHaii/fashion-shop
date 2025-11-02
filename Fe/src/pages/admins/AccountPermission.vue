<script setup lang="ts">
import { ref, computed } from 'vue';
import Header from '../../components/admins/Header.vue';
import NavbarAdmin from '../../components/admins/NavbarAdmin.vue';
import { onMounted } from 'vue';
import { useAdminStore } from '../../stores/admin/userStore';
import type { User } from '../../interfaces/user';

const admin = useAdminStore();
const users = ref<User[]>([]);
onMounted (async () => {
    await admin.getAllUserStore();
    await admin.getAllSellerRequestStore();
    console.log(admin.ListSellerRequest);
    users.value = admin.ListUser;
});


interface SellerRequest {
    id: number;
    user_id: number;
    name: string;
    phone: string;
    email: string;
    address: string;
    cccd: string;
    description: string;
    status: 'pending' | 'approved' | 'rejected';
    request_date: string;
}

const activeTab = ref('all');
const searchQuery = ref('');
const searchField = ref('ID');
const filterStatus = ref('pending');
const userSearchField = ref('Tên tài khoản');
const userSearchQuery = ref('');

const sellerRequests = ref<SellerRequest[]>([
    {
        id: 1,
        user_id: 1588,
        name: 'Nguyễn Văn A',
        phone: '0134678964',
        email: 'abc@gmail.com',
        address: '123 Nguyễn Huệ, Q.1, TP.HCM',
        cccd: '001234567890',
        description: 'Muốn mở shop bán quần áo thời trang',
        status: 'pending',
        request_date: '2024-11-01'
    },
    {
        id: 2,
        user_id: 1748,
        name: 'Trần Thị B',
        phone: '0278546723',
        email: 'haha@gmail.com',
        address: '456 Lê Lợi, Q.3, TP.HCM',
        cccd: '001234567891',
        description: 'Bán đồ điện tử',
        status: 'pending',
        request_date: '2024-11-02'
    },
    {
        id: 3,
        user_id: 1486,
        name: 'Lê Văn C',
        phone: '0278556349',
        email: 'hann@gmail.com',
        address: '789 Trần Hưng Đạo, Q.5, TP.HCM',
        cccd: '001234567892',
        description: 'Kinh doanh mỹ phẩm',
        status: 'approved',
        request_date: '2024-10-28'
    },
    {
        id: 4,
        user_id: 1553,
        name: 'Phạm Thị D',
        phone: '0765172872',
        email: 'myhaq@gmail.com',
        address: '321 Võ Văn Tần, Q.3, TP.HCM',
        cccd: '001234567893',
        description: 'Bán đồ handmade',
        status: 'rejected',
        request_date: '2024-10-25'
    },
    {
        id: 5,
        user_id: 2100,
        name: 'Hoàng Văn E',
        phone: '0912345678',
        email: 'hoange@gmail.com',
        address: '555 Pasteur, Q.1, TP.HCM',
        cccd: '001234567894',
        description: 'Kinh doanh thực phẩm sạch',
        status: 'pending',
        request_date: '2024-11-03'
    },
    {
        id: 6,
        user_id: 2200,
        name: 'Võ Thị F',
        phone: '0923456789',
        email: 'vothif@gmail.com',
        address: '666 Điện Biên Phủ, Q.3, TP.HCM',
        cccd: '001234567895',
        description: 'Bán phụ kiện thời trang',
        status: 'pending',
        request_date: '2024-11-03'
    },
    {
        id: 7,
        user_id: 2300,
        name: 'Đặng Văn G',
        phone: '0934567890',
        email: 'dangg@gmail.com',
        address: '777 Cách Mạng Tháng 8, Q.10, TP.HCM',
        cccd: '001234567896',
        description: 'Kinh doanh đồ chơi trẻ em',
        status: 'approved',
        request_date: '2024-10-30'
    },
    {
        id: 8,
        user_id: 2400,
        name: 'Bùi Thị H',
        phone: '0945678901',
        email: 'buih@gmail.com',
        address: '888 Hai Bà Trưng, Q.1, TP.HCM',
        cccd: '001234567897',
        description: 'Bán đồ nội thất',
        status: 'pending',
        request_date: '2024-11-04'
    },
    {
        id: 9,
        user_id: 2500,
        name: 'Trương Văn I',
        phone: '0956789012',
        email: 'truongi@gmail.com',
        address: '999 Lý Thái Tổ, Q.10, TP.HCM',
        cccd: '001234567898',
        description: 'Kinh doanh sách',
        status: 'rejected',
        request_date: '2024-10-26'
    },
    {
        id: 10,
        user_id: 2600,
        name: 'Mai Thị K',
        phone: '0967890123',
        email: 'maik@gmail.com',
        address: '101 Nguyễn Đình Chiểu, Q.3, TP.HCM',
        cccd: '001234567899',
        description: 'Bán đồ thể thao',
        status: 'pending',
        request_date: '2024-11-05'
    },
    {
        id: 11,
        user_id: 2700,
        name: 'Lý Văn L',
        phone: '0978901234',
        email: 'lyl@gmail.com',
        address: '202 Phan Xích Long, Phú Nhuận, TP.HCM',
        cccd: '001234567900',
        description: 'Kinh doanh giày dép',
        status: 'approved',
        request_date: '2024-10-29'
    },
    {
        id: 12,
        user_id: 2800,
        name: 'Phan Thị M',
        phone: '0989012345',
        email: 'phanm@gmail.com',
        address: '303 Trường Chinh, Tân Bình, TP.HCM',
        cccd: '001234567901',
        description: 'Bán túi xách',
        status: 'pending',
        request_date: '2024-11-05'
    },
    {
        id: 13,
        user_id: 2900,
        name: 'Hồ Văn N',
        phone: '0990123456',
        email: 'hon@gmail.com',
        address: '404 Hoàng Văn Thụ, Tân Bình, TP.HCM',
        cccd: '001234567902',
        description: 'Kinh doanh đồng hồ',
        status: 'rejected',
        request_date: '2024-10-27'
    },
    {
        id: 14,
        user_id: 3000,
        name: 'Dương Thị O',
        phone: '0901234567',
        email: 'duongo@gmail.com',
        address: '505 Cộng Hòa, Tân Bình, TP.HCM',
        cccd: '001234567903',
        description: 'Bán đồ gia dụng',
        status: 'pending',
        request_date: '2024-11-06'
    },
    {
        id: 15,
        user_id: 3100,
        name: 'Cao Văn P',
        phone: '0912340987',
        email: 'caop@gmail.com',
        address: '606 Âu Cơ, Tân Phú, TP.HCM',
        cccd: '001234567904',
        description: 'Kinh doanh thực phẩm chức năng',
        status: 'approved',
        request_date: '2024-10-31'
    }
]);

const approveRequest = (id: number) => {
    const request = sellerRequests.value.find(r => r.id === id);
    if (request) {
        request.status = 'approved';
        alert('Đã duyệt yêu cầu thành công!');
    }
};

const rejectRequest = (id: number) => {
    const request = sellerRequests.value.find(r => r.id === id);
    if (request) {
        request.status = 'rejected';
        alert('Đã từ chối yêu cầu!');
    }
};

const viewDetail = (request: SellerRequest) => {
    alert(`Chi tiết yêu cầu:\n\nTên: ${request.name}\nĐịa chỉ: ${request.address}\nCCCD: ${request.cccd}\nMô tả: ${request.description}`);
};

const getStatusText = (status: string) => {
    switch(status) {
        case 'pending': return 'Chờ duyệt';
        case 'approved': return 'Đã duyệt';
        case 'rejected': return 'Từ chối';
        default: return status;
    }
};

const getStatusClass = (status: string) => {
    switch(status) {
        case 'pending': return 'status-pending';
        case 'approved': return 'status-approved';
        case 'rejected': return 'status-rejected';
        default: return '';
    }
};

// Computed filtered list
const filteredSellerRequests = computed(() => {
    let filtered = sellerRequests.value;

    // Filter by status
    if (filterStatus.value !== 'all') {
        filtered = filtered.filter(r => r.status === filterStatus.value);
    }

    // Search
    if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase().trim();
        filtered = filtered.filter(r => {
            switch(searchField.value) {
                case 'ID':
                    return r.id.toString().includes(query);
                case 'userID':
                    return r.user_id.toString().includes(query);
                case 'Email':
                    return r.email.toLowerCase().includes(query);
                case 'CCCD':
                    return r.cccd.includes(query);
                default:
                    return true;
            }
        });
    }

    return filtered;
});

// Computed filtered users
const filteredUsers = computed(() => {
    let filtered = users.value;

    // Search
    if (userSearchQuery.value.trim()) {
        const query = userSearchQuery.value.toLowerCase().trim();
        filtered = filtered.filter(u => {
            switch(userSearchField.value) {
                case 'Tên tài khoản':
                    return u.name.toLowerCase().includes(query);
                case 'ID':
                    return u.id!.toString().includes(query);
                case 'Email':
                    return u.email.toLowerCase().includes(query);
                default:
                    return true;
            }
        });
    }

    return filtered;
});
</script>

<template>
    <Header />
    <div class="container">
        <NavbarAdmin />
        <div class="right-content">
            <div class="content-wrapper">
                <div class="tabs">
                    <button 
                        :class="['tab', { active: activeTab === 'all' }]"
                        @click="activeTab = 'all'"
                    >
                        Người dùng
                    </button>
                    <button 
                        :class="['tab', { active: activeTab === 'duyetSeller' }]"
                        @click="activeTab = 'duyetSeller'"
                    >
                        Yêu cầu phê duyệt seller
                    </button>
                </div>

                <div v-if="activeTab === 'all'">
                    <div class="toolbar">
                        <div class="search-box">
                            <select class="search-select" v-model="userSearchField">
                                <option>Tên tài khoản</option>
                                <option>ID</option>
                                <option>Email</option>
                            </select>
                            <input 
                                type="text" 
                                class="search-input" 
                                v-model="userSearchQuery"
                                placeholder="Tìm kiếm..."
                            />
                            <button class="search-btn">🔍</button>
                        </div>
                        <button class="add-btn">+ Thêm tài khoản</button>
                    </div>

                    <div class="table-container">
                        <table class="user-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Tên tài khoản</th>
                                    <th>Số điện thoại</th>
                                    <th>Email</th>
                                    <th>Vai trò</th>
                                    <th>Trạng thái</th>
                                    <th>Chỉnh sửa</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="user in filteredUsers" :key="user.id">
                                    <td>{{ user.id }}</td>
                                    <td>{{ user.name }}</td>
                                    <td>{{ user.phone }}</td>
                                    <td>{{ user.email }}</td>
                                    <td>{{ user.role }}</td>
                                    <td>
                                        <div class="toggle-switch" :class="{ active: user.status === 'active' }">
                                            <div class="toggle-slider"></div>
                                        </div>
                                    </td>
                                    <td>
                                        <button class="edit-btn"><i class="fa-solid fa-pen-to-square"></i></button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                </div>

                <div v-if="activeTab === 'duyetSeller'">
                    <div class="toolbar">
                        <div class="search-box">
                            <select class="search-select" v-model="searchField">
                                <option>ID</option>
                                <option>userID</option>
                                <option>Email</option>
                                <option>CCCD</option>
                            </select>
                            <input 
                                type="text" 
                                class="search-input" 
                                v-model="searchQuery"
                                placeholder="Tìm kiếm..."
                            />
                            <button class="search-btn">🔍</button>
                        </div>
                        <div class="filter-group">
                            <select class="filter-select" v-model="filterStatus">
                                <option value="all">Tất cả trạng thái</option>
                                <option value="pending">Chờ duyệt</option>
                                <option value="approved">Đã duyệt</option>
                                <option value="rejected">Từ chối</option>
                            </select>
                        </div>
                    </div>

                    <div class="table-container">
                        <table class="user-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>userID</th>
                                    <th>Số điện thoại</th>
                                    <th>Email</th>
                                    <th>CCCD</th>
                                    <th>Vai trò</th>
                                    <th>Duyệt</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="request in filteredSellerRequests" :key="request.id">
                                    <td>{{ request.id }}</td>
                                    <td>{{ request.user_id }}</td>
                                    <td>{{ request.phone }}</td>
                                    <td>{{ request.email }}</td>
                                    <td>{{ request.cccd }}</td>
                                    <td>
                                        <span class="status-badge" :class="getStatusClass(request.status)">
                                            {{ getStatusText(request.status) }}
                                        </span>
                                    </td>
                                    <td>
                                        <div class="action-buttons">
                                            <template v-if="request.status === 'pending'">
                                                <div class="pending-actions"> 
                                                    <button 
                                                        class="action-btn reject-btn" 
                                                        @click="rejectRequest(request.id)"
                                                    >
                                                        <i class="fa-solid fa-xmark"></i>
                                                    </button>
                                                    <button 
                                                        class="action-btn approve-btn" 
                                                        @click="approveRequest(request.id)"
                                                    >
                                                        <i class="fa-solid fa-circle-check"></i>
                                                    </button>
                                                </div>
                                            </template>
                                            <button 
                                                class="detail-link" 
                                                @click="viewDetail(request)"
                                            >
                                                Xem chi tiết >>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.container {
    width: 100%;
    display: flex;
}

.left-content {
    width: 18.7%;
}

.right-content {
    width: 81.3%;
    padding: 20px;
    background-color: #f5f5f5;
    height: calc(100vh - 60px);
    overflow-y: auto;
}

.content-wrapper {
    background-color: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Tabs */
.tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    border-bottom: 1px solid #e0e0e0;
}

.tab {
    padding: 12px 24px;
    background: none;
    border: none;
    border-bottom: 3px solid transparent;
    cursor: pointer;
    font-size: 14px;
    color: #666;
    transition: all 0.3s;
}

.tab.active {
    color: #ff4444;
    border-bottom-color: #ff4444;
    font-weight: 500;
}

/* Toolbar */
.toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.search-box {
    display: flex;
    align-items: center;
    gap: 5px;
    border: 1px solid #ddd;
    border-radius: 6px;
    overflow: hidden;
    background: white;
}

.search-select {
    padding: 10px 15px;
    border: none;
    background: white;
    cursor: pointer;
    font-size: 14px;
}

.search-input {
    padding: 10px;
    border: none;
    outline: none;
    width: 300px;
    font-size: 14px;
}

.search-btn {
    padding: 10px 15px;
    border: none;
    background: white;
    cursor: pointer;
    font-size: 16px;
}

.add-btn, .filter-btn {
    padding: 10px 20px;
    background-color: #ff4444;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: background-color 0.3s;
}

.add-btn:hover, .filter-btn:hover {
    background-color: #cc0000;
}

.filter-group {
    display: flex;
    gap: 10px;
    align-items: center;
}

.filter-select {
    padding: 10px 15px;
    border: 1px solid #ddd;
    border-radius: 6px;
    background: white;
    cursor: pointer;
    font-size: 14px;
    min-width: 180px;
}

/* Table */
.table-container {
    overflow-x: auto;
    margin-bottom: 20px;
    max-height: 500px;
    overflow-y: auto;
}

.user-table {
    width: 100%;
    border-collapse: collapse;
}

.user-table thead {
    background-color: #f8f9fa;
    position: sticky;
    top: 0;
    z-index: 10;
}

.user-table th {
    padding: 12px;
    text-align: left;
    font-weight: 500;
    color: #666;
    font-size: 14px;
    border-bottom: 2px solid #e0e0e0;
}

.user-table td {
    padding: 15px 12px;
    border-bottom: 1px solid #f0f0f0;
    font-size: 14px;
    color: #333;
}

.user-table tbody tr:hover {
    background-color: #f8f9fa;
}

/* Toggle Switch */
.toggle-switch {
    width: 44px;
    height: 24px;
    background-color: #ccc;
    border-radius: 12px;
    position: relative;
    cursor: pointer;
    transition: background-color 0.3s;
}

.toggle-switch.active {
    background-color: #4caf50;
}

.toggle-slider {
    width: 20px;
    height: 20px;
    background-color: white;
    border-radius: 50%;
    position: absolute;
    top: 2px;
    left: 2px;
    transition: transform 0.3s;
}

.toggle-switch.active .toggle-slider {
    transform: translateX(20px);
}

.edit-btn {
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 20px;
    background-color: transparent;
}

/* Status Badge */
.status-badge {
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 500;
}

.status-pending {
    background-color: #fff3cd;
    color: #856404;
}

.status-approved {
    background-color: #d4edda;
    color: #155724;
}

.status-rejected {
    background-color: #f8d7da;
    color: #721c24;
}

/* CHỈNH SỬA CHO BỐ CỤC ICON */
.action-buttons {
    display: flex;
    flex-direction: column; /* Xếp dọc icon và text */
    align-items: center; /* Canh giữa nội dung */
    gap: 4px; 
}

.pending-actions {
    display: flex;
    gap: 10px; /* Khoảng cách giữa ❌ và ✅ */
    margin-bottom: 2px; 
}

.action-btn {
    /* Loại bỏ background, chỉ hiển thị icon */
    background-color: transparent !important;
    border: none;
    cursor: pointer;
    width: auto; 
    height: auto;
    padding: 0;
    font-size: 20px; 
    line-height: 1; 
    border-radius: 0;
    transition: opacity 0.3s;
}

/* Định màu cho icon để chúng hiển thị rõ ràng */
.reject-btn i {
    color: #ff4444; /* Màu đỏ cho icon từ chối */
}

.approve-btn i {
    color: #4caf50; /* Màu xanh lá cho icon duyệt */
}

.action-btn:hover:not(:disabled) {
    opacity: 0.7;
}

.action-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.detail-link {
    background: none;
    border: none;
    color: #ff4444;
    cursor: pointer;
    font-size: 13px;
    text-decoration: underline;
    padding: 0;
}

.detail-link:hover {
    color: #cc0000;
}
</style>