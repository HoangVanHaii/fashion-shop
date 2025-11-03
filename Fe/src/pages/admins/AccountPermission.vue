<script setup lang="ts">
import { ref, computed } from 'vue';
// Giả định các components này đã tồn tại trong đường dẫn
import Header from '../../components/admins/Header.vue';
import NavbarAdmin from '../../components/admins/NavbarAdmin.vue';
import { onMounted } from 'vue';
import { useAdminStore } from '../../stores/admin/userStore';
// Giả định interfaces User và SellerRequest đã được định nghĩa
import type { SellerRequest, User } from '../../interfaces/user';

const adminn = useAdminStore();
const users = ref<User[]>([]);
const sellerRequests = ref<SellerRequest[]>([]);

// Khởi tạo dữ liệu khi component được mount
onMounted (async () => {
    // Lưu ý: Cần đảm bảo các hàm API này tồn tại và hoạt động trong useAdminStore
    await adminn.getAllUserStore();
    await adminn.getAllSellerRequestStore();
    
    users.value = adminn.ListUser;
    sellerRequests.value = adminn.ListSellerRequest;
});

// Logic quản lý tab và tìm kiếm/lọc
const activeTab = ref<'all' | 'duyetSeller'>('duyetSeller'); 
const searchQuery = ref('');
const searchField = ref('ID');
const filterStatus = ref<'all' | 'pending' | 'approved' | 'rejected'>('pending'); 
const userSearchField = ref('Tên tài khoản');
const userSearchQuery = ref('');

// Modal state
const showDetailModal = ref(false);
const selectedRequest = ref<SellerRequest | null>(null);
const selectedUser = ref<User | null>(null);

// Computed filtered seller requests
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
                    return r.id!.toString().includes(query);
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
                    return (u.name || '').toLowerCase().includes(query);
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


const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('vi-VN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const getGenderText = (gender: User['gender']) => {
    switch (gender) {
        case 'male': return 'Nam';
        case 'female': return 'Nữ';
        case 'other': return 'Khác';
        default: return 'N/A';
    }
};
const getStatusClass = (status: SellerRequest['status']) => {
    switch (status) {
        case 'pending':
            return 'status-pending';
        case 'approved':
        return 'status-approved';
        case 'rejected':
            return 'status-rejected';
        default:
            return '';
    }
};

const getStatusText = (status: SellerRequest['status']) => {
    switch (status) {
        case 'pending':
            return 'Chờ duyệt';
        case 'approved':
            return 'Đã duyệt';
        case 'rejected':
            return 'Từ chối';
        default:
            return 'Không rõ';
    }
};

const rejectRequest = async (requestId: number | undefined) => {
    if (requestId === undefined) return;

    if (confirm("Bạn có chắc chắn muốn TỪ CHỐI yêu cầu này không?")) {
        try {
            // **THAY THẾ BẰNG HÀM API THỰC TẾ CỦA BẠN:**
            // await adminn.rejectSellerRequestApi(requestId); 
            
            // Cập nhật trạng thái giả định
            const index = sellerRequests.value.findIndex(r => r.id === requestId);
            if (index !== -1) {
                sellerRequests.value[index]!.status = 'rejected';
            }
            alert('Yêu cầu đã được từ chối thành công.');
        } catch (error) {
            alert('Lỗi: Có lỗi xảy ra khi từ chối yêu cầu.');
        }
    }
};

const approveRequest = async (requestId: number | undefined) => {
    if (requestId === undefined) return;

    if (confirm("Bạn có chắc chắn muốn PHÊ DUYỆT yêu cầu này không? Tài khoản sẽ trở thành Seller.")) {
        try {
            // **THAY THẾ BẰNG HÀM API THỰC TẾ CỦA BẠN:**
            // await adminn.approveSellerRequestApi(requestId); 

            // Cập nhật trạng thái giả định
            const index = sellerRequests.value.findIndex(r => r.id === requestId);
            if (index !== -1) {
                sellerRequests.value[index]!.status = 'approved';
            }
            alert('Yêu cầu đã được phê duyệt thành công. Tài khoản đã trở thành Seller.');
        } catch (error) {
            alert('Lỗi: Có lỗi xảy ra khi phê duyệt yêu cầu.');
        }
    }
};

const viewDetail = (request: SellerRequest) => {
    selectedRequest.value = request;
    // Tìm thông tin user tương ứng
    selectedUser.value = users.value.find(u => u.id === request.user_id) || null;
    showDetailModal.value = true;
};

const closeModal = () => {
    showDetailModal.value = false;
    selectedRequest.value = null;
    selectedUser.value = null;
};
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
                                    <th>Trạng thái</th>
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
                                                        title="Từ chối"
                                                    >
                                                        <i class="fa-solid fa-xmark"></i>
                                                    </button>
                                                    <button 
                                                        class="action-btn approve-btn" 
                                                        @click="approveRequest(request.id)"
                                                        title="Phê duyệt"
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

        <!-- Modal Chi tiết -->
        <Teleport to="body">
            <div v-if="showDetailModal" class="modal-overlay" @click="closeModal">
                <div class="modal-content" @click.stop>
                    <div class="modal-header">
                        <h2>Chi tiết Yêu cầu Seller</h2>
                        <button class="close-btn" @click="closeModal">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                    
                    <div class="modal-body">
                        <div class="info-container">
                            <!-- Thông tin User -->
                            <div class="info-section">
                                <h3><i class="fa-solid fa-user"></i> Thông tin Người dùng</h3>
                                <div class="info-list">
                                    <div class="info-row">
                                        <span class="info-label">ID:</span>
                                        <span class="info-value">{{ selectedUser?.id || 'N/A' }}</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label">Tên tài khoản:</span>
                                        <span class="info-value">{{ selectedUser?.name || 'N/A' }}</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label">Email:</span>
                                        <span class="info-value">{{ selectedUser?.email || 'N/A' }}</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label">Số điện thoại:</span>
                                        <span class="info-value">{{ selectedUser?.phone || 'N/A' }}</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label">Ngày sinh:</span>
                                        <span class="info-value">{{ formatDate(selectedUser?.date_of_birth) }}</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label">Giới tính:</span>
                                        <span class="info-value">{{ getGenderText(selectedUser?.gender) }}</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label">Vai trò:</span>
                                        <span class="info-value">
                                            <span class="role-badge" :class="'role-' + selectedUser?.role">
                                                {{ selectedUser?.role || 'N/A' }}
                                            </span>
                                        </span>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label">Trạng thái:</span>
                                        <span class="info-value">
                                            <span class="status-badge" :class="selectedUser?.status === 'active' ? 'status-active' : 'status-banned'">
                                                {{ selectedUser?.status === 'active' ? 'Hoạt động' : 'Bị chặn' }}
                                            </span>
                                        </span>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label">Xác thực:</span>
                                        <span class="info-value">
                                            <span class="verify-badge" :class="selectedUser?.is_verified ? 'verified' : 'unverified'">
                                                {{ selectedUser?.is_verified ? 'Đã xác thực' : 'Chưa xác thực' }}
                                            </span>
                                        </span>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label">Ngày tạo:</span>
                                        <span class="info-value">{{ formatDate(selectedUser?.created_at) }}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Thông tin Request Seller -->
                            <div class="info-section">
                                <h3><i class="fa-solid fa-file-lines"></i> Thông tin Yêu cầu Seller</h3>
                                <div class="info-list">
                                    <div class="info-row">
                                        <span class="info-label">ID Yêu cầu:</span>
                                        <span class="info-value">{{ selectedRequest?.id || 'N/A' }}</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label">User ID:</span>
                                        <span class="info-value">{{ selectedRequest?.user_id || 'N/A' }}</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label">Tên Shop:</span>
                                        <span class="info-value">{{ selectedRequest?.name || 'N/A' }}</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label">Email:</span>
                                        <span class="info-value">{{ selectedRequest?.email || 'N/A' }}</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label">Số điện thoại:</span>
                                        <span class="info-value">{{ selectedRequest?.phone || 'N/A' }}</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label">Địa chỉ:</span>
                                        <span class="info-value">{{ selectedRequest?.address || 'N/A' }}</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label">CCCD/CMND:</span>
                                        <span class="info-value">{{ selectedRequest?.cccd || 'N/A' }}</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label">Mô tả:</span>
                                        <span class="info-value">{{ selectedRequest?.description || 'N/A' }}</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label">Trạng thái:</span>
                                        <span class="info-value">
                                            <span class="status-badge" :class="getStatusClass(selectedRequest?.status || 'pending')">
                                                {{ getStatusText(selectedRequest?.status || 'pending') }}
                                            </span>
                                        </span>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label">Ngày yêu cầu:</span>
                                        <span class="info-value">{{ formatDate(selectedRequest?.request_date) }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Action Buttons -->
                        <div v-if="selectedRequest?.status === 'pending'" class="modal-actions">
                            <button class="modal-btn reject" @click="rejectRequest(selectedRequest?.id); closeModal()">
                                <i class="fa-solid fa-xmark"></i> Từ chối
                            </button>
                            <button class="modal-btn approve" @click="approveRequest(selectedRequest?.id); closeModal()">
                                <i class="fa-solid fa-circle-check"></i> Phê duyệt
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<style scoped>
/* Giữ nguyên CSS để đảm bảo giao diện không thay đổi */
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
    font-size: 19px;
    border-bottom: 2px solid #e0e0e0;
}

.user-table td {
    padding: 15px 12px;
    border-bottom: 1px solid #f0f0f0;
    font-size: 16px;
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

.status-active {
    background-color: #d4edda;
    color: #155724;
}

.status-banned {
    background-color: #f8d7da;
    color: #721c24;
}

.role-badge {
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 500;
}

.role-customer {
    background-color: #e3f2fd;
    color: #1565c0;
}

.role-seller {
    background-color: #fff3e0;
    color: #e65100;
}

.role-admin {
    background-color: #fce4ec;
    color: #c2185b;
}

.verify-badge {
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 500;
}

.verified {
    background-color: #d4edda;
    color: #155724;
}

.unverified {
    background-color: #fff3cd;
    color: #856404;
}

/* CHỈNH SỬA CHO BỐ CỤC ICON */
.action-buttons {
    display: flex;
    flex-direction: column; 
    align-items: center; 
    gap: 4px; 
}

.pending-actions {
    /* Đảm bảo khoảng cách chỉ hiển thị khi có icon */
    display: flex;
    gap: 10px; 
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
    color: #ff4444; 
}

.approve-btn i {
    color: #4caf50; 
}

.action-btn:hover:not(:disabled) {
    opacity: 0.7;
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

/* Modal Styles */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    animation: fadeIn 0.3s;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

.modal-content {
    background: white;
    border-radius: 12px;
    width: 90%;
    max-width: 800px;
    max-height: 85vh;
    overflow-y: auto;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    animation: slideUp 0.3s;
}

@keyframes slideUp {
    from {
        transform: translateY(50px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #e0e0e0;
    position: sticky;
    top: 0;
    background: white;
    z-index: 10;
}

.modal-header h2 {
    margin: 0;
    font-size: 20px;
    color: #333;
    font-weight: 600;
}

.close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.3s;
}

.close-btn:hover {
    background-color: #f5f5f5;
    color: #333;
}

.modal-body {
    padding: 24px;
}

.info-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}

.info-section {
    padding: 20px;
    background-color: #f8f9fa;
    border-radius: 8px;
}

.info-section h3 {
    margin: 0 0 16px 0;
    font-size: 16px;
    color: #333;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
}

.info-section h3 i {
    color: #ff4444;
}

.info-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.info-row {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 16px;
    align-items: flex-start;
    padding: 12px 0;
    border-bottom: 1px solid #e9ecef;
}

.info-row:last-child {
    border-bottom: none;
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.info-label {
    font-size: 13px;
    color: #666;
    font-weight: 600;
}

.info-value {
    font-size: 14px;
    color: #333;
    font-weight: 400;
    word-break: break-all;
    line-height: 1.5;
}

.modal-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid #e0e0e0;
}

.modal-btn {
    padding: 10px 24px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s;
}

.modal-btn.reject {
    background-color: #fff;
    color: #ff4444;
    border: 1px solid #ff4444;
}

.modal-btn.reject:hover {
    background-color: #ff4444;
    color: white;
}

.modal-btn.approve {
    background-color: #4caf50;
    color: white;
}

.modal-btn.approve:hover {
    background-color: #45a049;
}

/* Responsive */
@media (max-width: 968px) {
    .info-container {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .info-row {
        grid-template-columns: 1fr;
        gap: 4px;
    }
    
    .info-grid {
        grid-template-columns: 1fr;
    }
    
    .modal-content {
        width: 95%;
        margin: 10px;
    }
}
</style>