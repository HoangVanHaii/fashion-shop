<script setup lang="ts">
const props = defineProps<{ message: string }>();
const emit = defineEmits(['close', 'confirm']);
const handleClose = () => {
    emit('close');
}
const handleConfirm = () => {
    emit('confirm');
}
</script>

<template>
    <teleport to="body"> 
        <div class="container"  @click="handleClose">
            <div class="form-content" @click.stop>
                <div class="content"> 
                    <span>{{ props.message }}</span>
                </div>
                <div class="btn-actions">
                    <button class="btn-back" @click="handleClose">Hủy</button>
                    <button class="btn-confirm" @click="handleConfirm">Xác nhận</button>
                </div>
            </div>
        </div>
    </teleport>

</template>
<style scoped>
    .container{
        width: 100%;
        height: 100%;
        position: fixed;
        top: 0;
        left: 0;
        z-index: 9999;
        display: flex;
        background-color: rgba(0, 0, 0, 0.3);
        flex-direction: row;
        align-items: center;
        justify-content: center;
        
    }
    .form-content{
        width: 300px;
        height: 120px;
        background-color: red;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        border-radius: 5px;
        background-color: white;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 5px;
    }
    .content{
        width: 90%;
        height: 65%;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
    }
    .content span{
        text-align: center;
    }
    .btn-actions{
        width: 90%;
        height: 30%;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 30px;
        margin-bottom: 2px;
    }
    .btn-actions button{
        width: 80px;
        border-radius: 3px;
        border: 0.1px solid #656464;
        padding: 2px;
        box-shadow: 0 3px 2px rgba(0, 0, 0, 0.2);
        cursor: pointer;
    }
    .btn-back{
        background-color: #d6d1d1;
        color: black;
    }
    .btn-confirm{
        background-color: rgb(237, 57, 57);
        color: white;
    }
    .btn-back:hover{
        background-color: #ede8e8;
        transform: translateY(-1px);
    }
    .btn-confirm:hover{
        background-color: rgb(225, 15, 15);
        transform: translateY(-1px);
    }

</style>