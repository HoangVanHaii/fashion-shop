<template>
  <footer class="footer">
    <div class="subscribe"> 
        
        <div class="subscribe-input">
            <p>Đăng ký nhận tin</p>
            <div class="input-wrapper">
                <i class="fa-solid fa-envelope"></i>
                <input type="email" placeholder="Nhập Email của bạn">
            </div>
            <button>Đăng ký</button>
            <div class="social">
                <span>Kết nối với chúng tôi:</span>
                <i class="fa-brands fa-facebook"></i>
                <i class="fa-brands fa-instagram"></i>
             </div>
        </div>
        <div>
    </div>         
        </div>
        <div class="content">
            <div class="Nava col">
                <h4>Về NAVA</h4>
                <p>
                    CÔNG TY CỔ PHẦN TẬP ĐOÀN NAVA<br />
                    Mã số doanh nghiệp 0102196094, do Sở kế hoạch và đầu tư Thành phố HCM cấp ngày 30/03/2007<br />
                    Người chịu trách nhiệm quản lý website: Nguyễn Trọng Phi.<br />
                </p>
                <div class="editspan">
                    <div>
                        <i class="fa-solid fa-location-dot"></i>
                        <span>   Tầng 8, Lô 3, 04-3A, KCN Hoàng Mai, số 435A Tam Trinh, Phường Hoàng Mai, Hà Nội</span>
                    </div> 
                    <br />
                    <div>
                        <i class="fa-solid fa-phone"></i>
                        <span>   0348177549 </span>
                    </div>
                    
                    <div>
                        <i class="fa-solid fa-envelope"></i>
                        <span>   abcdef@gmail.com</span>
                    </div>
                    <div class="method_pay">
                        <b>Phương thức thanh toán</b>
                        <div class="edit_imgPay">
                            <img src="../assets/vnpay.png"/>
                            <img src="../assets/vnpay.png"/>
                            <img src="../assets/vnpay.png"/>
                        </div>
                    </div>
                    

                </div>
            </div>
            <div class="LK col">
                <h4>Liên kết</h4>
                <ul>
                    <li>Sản phẩm mới</li>
                    <li>Nam</li>
                    <li>Nữ</li>
                    <li>Phụ kiện</li>
                    <li>SALE</li>
                </ul>
            </div>
            <div class="CS col">
                <h4>Chính sách</h4>
                <ul>
                    <li>Giới thiệu</li>
                    <li>Hướng dẫn mua hàng</li>
                    <li>Chính sách bảo hành đổi trả</li>
                    <li>Chính sách thanh toán</li>
                    <li>Chính sách bảo mật</li>
                </ul>
            </div>
        </div>
    </footer>
</template>

<script setup lang="ts">

</script>

<style scoped>
.footer {
    background-color: #F26B3A;
    color: white;
    border: 2px solid #9b59b6;
    border-radius: 2px;
    overflow: hidden;
    width: 100%;
}

.subscribe {
    padding: 12px 20px;
    background-color: #992900;
}

.input-wrapper {
    position: relative; 
    width: 250px;
}

.input-wrapper i {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: gray;
}

.input-wrapper input {
    padding: 8px 0px 8px 35px; /* chừa khoảng bên trái cho icon */
    border-radius: 20px; 
    border: none;
    outline: none;
    width: 220px;
    background-color: #d7dcd9f9
}

.subscribe p {
    margin: 0;
    font-size:28px;
    text-align:left;
}

.subscribe-input {
    display: flex;
    align-items: center;
    gap: 15px;
}

.subscribe-input input::placeholder {
    color: #461edaff;
    opacity: 1;
}

.subscribe-input button {
    background-color: black;
    color: white;
    padding: 5px 30px;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;     /* canh chữ giữa theo chiều dọc */
    justify-content: center;
}

.social {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
}

.social i {
    cursor: pointer;
    font-size: 26px;
}

.social span {
    font-size: 20px;
}
.content {
    display: flex;
    gap: 20px; 
    margin: 0 10px 0px 10px;
}

.Nava{
    flex: 1.2; 
    margin:20px;
}
.CS {
    flex: 1; 
    margin:30px;
}
.LK{
    flex: 1;
    margin:30px 0px 0px 150px;
}
.col h4 {
    margin: 5px 0 10px 0;
    font-size: 18px;
    text-align: justify;
  
}

.col ul {
    padding-left: 16px;
    margin: 0px;
 
}

.col li {
    margin-bottom: 6px;
    font-size: 18px;
    text-align: left;
}
.col p {
    font-size: 18px;
    line-height: 1.4;
    text-align: justify;
}

.editspan{
    display: flex;
    flex-direction: column;
    gap: 4px;
    text-align:left;
    font-size:18px;
}
.method_pay img{
    width: 90px;
}

.edit_imgPay{
    display: flex;
    gap:10px;
}

/* ----------------------------- */
/*  Tablet (768px – 1024px) */
/* ----------------------------- */
@media (max-width: 1200px) and (min-width: 880px) {
    .Nava{
    flex: 1.6; 
    margin:20px;
    }
    .CS {
        flex: 1; 
        margin:30 0 0 0px;
    }
    .LK{
        flex: 0.6;
        margin:30px 0px 0px 20px;
    }
    .subscribe p {
    margin: 0;
    font-size:22px;
    text-align:left;
    }

    .social span {
    font-size: 19px;
    }
}

/* ----------------------------- */
/*  mobile (880px<=) */
/* ----------------------------- */
@media (max-width: 880px) {
    .Nava{
    flex: 1.6; 
    margin:20px;
    }
    .CS {
        flex: 1; 
        margin:30 0 0 0px;
    }
    .LK{
        flex: 0.6;
        margin:30px 0px 0px 20px;
    }
    .subscribe p {
    margin: 0;
    font-size:23px;
    text-align:left;
    }

    .social span {
    display: none;
    }
}


</style>
